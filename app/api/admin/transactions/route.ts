import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import User from '@/models/User';

export async function GET(request: Request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'month';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build date query
    let dateQuery = {};
    const now = new Date();
    
    if (startDate && endDate) {
      dateQuery = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        }
      };
    } else {
      switch(filter) {
        case 'today':
          dateQuery = {
            createdAt: {
              $gte: new Date(now.setHours(0,0,0,0)),
              $lte: new Date(now.setHours(23,59,59,999)),
            }
          };
          break;
        case 'week':
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          dateQuery = {
            createdAt: { $gte: weekAgo }
          };
          break;
        case 'month':
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          dateQuery = {
            createdAt: { $gte: monthAgo }
          };
          break;
        case 'year':
          const yearAgo = new Date();
          yearAgo.setFullYear(yearAgo.getFullYear() - 1);
          dateQuery = {
            createdAt: { $gte: yearAgo }
          };
          break;
      }
    }

    // Get all transactions with date filter
    const transactions = await Transaction.find(dateQuery)
      .sort({ createdAt: -1 })
      .limit(1000);

    // Get user details for each transaction
    const transactionsWithUsers = await Promise.all(
      transactions.map(async (t) => {
        const fromUser = t.fromPhone !== 'SYSTEM' ? 
          await User.findOne({ phoneNumber: t.fromPhone }) : null;
        const toUser = t.toPhone !== 'SYSTEM' ? 
          await User.findOne({ phoneNumber: t.toPhone }) : null;
        
        return {
          id: t._id,
          date: t.createdAt,
          type: t.type,
          amount: t.amount,
          status: t.status,
          description: t.description,
          from: {
            phone: t.fromPhone,
            name: fromUser?.fullName || 'SYSTEM',
            account: t.fromAccount,
          },
          to: {
            phone: t.toPhone,
            name: toUser?.fullName || 'SYSTEM',
            account: t.toAccount,
          },
        };
      })
    );

    // Calculate statistics
    const stats = {
      totalVolume: transactions.reduce((sum, t) => sum + t.amount, 0),
      totalCount: transactions.length,
      avgAmount: transactions.length > 0 
        ? transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length 
        : 0,
      depositVolume: transactions.filter(t => t.type === 'deposit')
        .reduce((sum, t) => sum + t.amount, 0),
      withdrawalVolume: transactions.filter(t => t.type === 'withdrawal')
        .reduce((sum, t) => sum + t.amount, 0),
      transferVolume: transactions.filter(t => t.type === 'transfer')
        .reduce((sum, t) => sum + t.amount, 0),
    };

    // Generate chart data (last 30 days)
    const chartData = generateChartData(transactions);

    // Get top users by transaction volume
    const userVolume = new Map();
    transactions.forEach(t => {
      if (t.fromPhone !== 'SYSTEM') {
        userVolume.set(t.fromPhone, (userVolume.get(t.fromPhone) || 0) + t.amount);
      }
      if (t.toPhone !== 'SYSTEM' && t.type !== 'transfer') {
        userVolume.set(t.toPhone, (userVolume.get(t.toPhone) || 0) + t.amount);
      }
    });

    const topUsers = await Promise.all(
      Array.from(userVolume.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(async ([phone, volume]) => {
          const user = await User.findOne({ phoneNumber: phone });
          return {
            name: user?.fullName || 'Unknown',
            phone,
            volume,
          };
        })
    );

    return NextResponse.json({
      transactions: transactionsWithUsers,
      stats,
      chartData,
      topUsers,
    });

  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

function generateChartData(transactions: any[]) {
  const last30Days = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayTransactions = transactions.filter(t => 
      new Date(t.createdAt).toISOString().split('T')[0] === dateStr
    );
    
    const volume = dayTransactions.reduce((sum, t) => sum + t.amount, 0);
    const count = dayTransactions.length;
    
    // Calculate OHLC-like data (Nepse style)
    const amounts = dayTransactions.map(t => t.amount);
    const open = amounts[0] || 0;
    const close = amounts[amounts.length - 1] || 0;
    const high = Math.max(...amounts, 0);
    const low = Math.min(...amounts, Infinity) || 0;
    
    last30Days.push({
      date: dateStr,
      displayDate: `${date.getDate()}/${date.getMonth() + 1}`,
      volume,
      count,
      open,
      close,
      high,
      low,
      change: close - open,
      changePercent: open > 0 ? ((close - open) / open * 100).toFixed(2) : 0,
    });
  }
  
  return last30Days;
}