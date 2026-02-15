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

    // Build date query for current period
    let currentDateQuery = {};
    let previousDateQuery = {};
    const now = new Date();
    
    if (startDate && endDate) {
      // Custom range
      currentDateQuery = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        }
      };
      
      // Calculate previous period of same length
      const start = new Date(startDate);
      const end = new Date(endDate);
      const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      
      const prevStart = new Date(start);
      prevStart.setDate(prevStart.getDate() - daysDiff);
      
      const prevEnd = new Date(end);
      prevEnd.setDate(prevEnd.getDate() - daysDiff);
      
      previousDateQuery = {
        createdAt: {
          $gte: prevStart,
          $lte: prevEnd,
        }
      };
    } else {
      // Predefined filters
      const now = new Date();
      let currentStart = new Date();
      let previousStart = new Date();
      let previousEnd = new Date();

      switch(filter) {
        case 'today':
          currentStart = new Date(now.setHours(0,0,0,0));
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          yesterday.setHours(0,0,0,0);
          previousStart = yesterday;
          previousEnd = new Date(now.setHours(23,59,59,999));
          break;
          
        case 'week':
          currentStart = new Date(now.setDate(now.getDate() - 7));
          previousStart = new Date(now.setDate(now.getDate() - 14));
          previousEnd = new Date(now.setDate(now.getDate() - 7));
          break;
          
        case 'month':
          currentStart = new Date(now.setMonth(now.getMonth() - 1));
          previousStart = new Date(now.setMonth(now.getMonth() - 2));
          previousEnd = new Date(now.setMonth(now.getMonth() - 1));
          break;
          
        case 'year':
          currentStart = new Date(now.setFullYear(now.getFullYear() - 1));
          previousStart = new Date(now.setFullYear(now.getFullYear() - 2));
          previousEnd = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
      }

      currentDateQuery = {
        createdAt: { $gte: currentStart }
      };
      
      previousDateQuery = {
        createdAt: {
          $gte: previousStart,
          $lt: previousEnd
        }
      };
    }

    // Get current period transactions
    const currentTransactions = await Transaction.find(currentDateQuery)
      .sort({ createdAt: -1 })
      .limit(1000);

    // Get previous period transactions for comparison
    const previousTransactions = await Transaction.find(previousDateQuery);

    // Calculate current period stats
    const currentStats = {
      totalVolume: currentTransactions.reduce((sum, t) => sum + t.amount, 0),
      totalCount: currentTransactions.length,
      avgAmount: currentTransactions.length > 0 
        ? currentTransactions.reduce((sum, t) => sum + t.amount, 0) / currentTransactions.length 
        : 0,
      depositVolume: currentTransactions.filter(t => t.type === 'deposit')
        .reduce((sum, t) => sum + t.amount, 0),
      withdrawalVolume: currentTransactions.filter(t => t.type === 'withdrawal')
        .reduce((sum, t) => sum + t.amount, 0),
      transferVolume: currentTransactions.filter(t => t.type === 'transfer')
        .reduce((sum, t) => sum + t.amount, 0),
      depositCount: currentTransactions.filter(t => t.type === 'deposit').length,
      withdrawalCount: currentTransactions.filter(t => t.type === 'withdrawal').length,
      transferCount: currentTransactions.filter(t => t.type === 'transfer').length,
    };

    // Calculate previous period stats for percentage changes
    const previousStats = {
      totalVolume: previousTransactions.reduce((sum, t) => sum + t.amount, 0),
      totalCount: previousTransactions.length,
      depositVolume: previousTransactions.filter(t => t.type === 'deposit')
        .reduce((sum, t) => sum + t.amount, 0),
      withdrawalVolume: previousTransactions.filter(t => t.type === 'withdrawal')
        .reduce((sum, t) => sum + t.amount, 0),
    };

    // Calculate percentage changes
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? '+100' : '0';
      const change = ((current - previous) / previous * 100).toFixed(1);
      return change.startsWith('-') ? change : '+' + change;
    };

    const stats = {
      ...currentStats,
      volumeChange: calculateChange(currentStats.totalVolume, previousStats.totalVolume),
      transactionChange: calculateChange(currentStats.totalCount, previousStats.totalCount),
      depositsChange: calculateChange(currentStats.depositVolume, previousStats.depositVolume),
      withdrawalsChange: calculateChange(currentStats.withdrawalVolume, previousStats.withdrawalVolume),
    };

    // Get user details for transactions
    const transactionsWithUsers = await Promise.all(
      currentTransactions.map(async (t) => {
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

    // Generate chart data with color coding
    const chartData = generateChartData(currentTransactions);

    // Get top users by transaction volume
    const userVolume = new Map();
    currentTransactions.forEach(t => {
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
    
    // Determine if day was positive (more deposits/credits) or negative (more withdrawals/debits)
    const deposits = dayTransactions.filter(t => t.type === 'deposit').reduce((sum, t) => sum + t.amount, 0);
    const withdrawals = dayTransactions.filter(t => t.type === 'withdrawal').reduce((sum, t) => sum + t.amount, 0);
    const netFlow = deposits - withdrawals;
    
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
      netFlow,
      isPositive: netFlow >= 0,
      deposits,
      withdrawals,
    });
  }
  
  return last30Days;
}