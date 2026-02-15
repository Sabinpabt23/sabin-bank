import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Card from '@/models/Card';
import Transaction from '@/models/Transaction';

export async function GET(request: Request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get('phoneNumber');

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ phoneNumber }).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user's active cards (status = 'active')
    const activeCards = await Card.find({ 
      phoneNumber, 
      status: 'active' 
    });

    // Get user's pending card requests
    const pendingRequests = await Card.find({ 
      phoneNumber, 
      requestStatus: 'pending' 
    }).sort({ requestedAt: -1 });

    // Get user's transactions
    const transactions = await Transaction.find({
      $or: [
        { fromPhone: phoneNumber },
        { toPhone: phoneNumber }
      ]
    }).sort({ createdAt: -1 });

    // Format transactions for frontend
    const formattedTransactions = transactions.map(t => {
      const isCredit = t.toPhone === phoneNumber;
      
      let name = '';
      let icon = '';
      
      if (t.type === 'deposit') {
        name = 'Cash Deposit';
        icon = '📥';
      } else if (t.type === 'withdrawal') {
        name = 'Cash Withdrawal';
        icon = '📤';
      } else if (t.type === 'transfer') {
        if (isCredit) {
          name = `Received from ${t.fromPhone}`;
          icon = '↘️';
        } else {
          name = `Sent to ${t.toPhone}`;
          icon = '↗️';
        }
      }
      
      return {
        id: t._id.toString(),
        name: name,
        type: isCredit ? 'credit' : 'debit',
        amount: t.amount,
        date: new Date(t.createdAt).toISOString().split('T')[0],
        time: new Date(t.createdAt).toLocaleTimeString(),
        category: t.type,
        icon: icon,
      };
    });

    // Format active cards for frontend
    const formattedActiveCards = activeCards.map(c => ({
      id: c._id.toString(),
      type: c.cardType,
      number: `**** **** **** ${c.cardNumber.slice(-4)}`,
      fullNumber: c.cardNumber,
      holderName: c.cardHolder,
      expiry: `${c.expiryMonth}/${c.expiryYear}`,
      cvv: c.cvv,
      issuedDate: c.createdAt,
    }));

    // Format pending requests for frontend
    const formattedPendingRequests = pendingRequests.map(r => ({
      _id: r._id.toString(),
      cardType: r.cardType,
      cardHolder: r.cardHolder,
      requestReason: r.requestReason,
      requestedAt: r.requestedAt,
      status: r.requestStatus,
    }));

   // Calculate balance from transactions
const calculateBalance = () => {
  let balance = 1000; // Starting bonus
  
  // Sort transactions by date to ensure correct order
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  
  sortedTransactions.forEach(t => {
    if (t.toPhone === phoneNumber) {
      balance += t.amount;
      console.log(`📈 Credit: +$${t.amount} → New balance: $${balance}`);
    } else if (t.fromPhone === phoneNumber) {
      balance -= t.amount;
      console.log(`📉 Debit: -$${t.amount} → New balance: $${balance}`);
    }
  });
  
  console.log(`✅ Final balance for ${phoneNumber}: $${balance}`);
  return balance;
};

    const currentBalance = calculateBalance();

    // Prepare dashboard data
    const dashboardData = {
      user: {
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        location: user.location,
        gender: user.gender,
        birthDate: user.birthDate,
        idType: user.idType,
        idNumber: user.idNumber,
        idPhotoPath: user.idPhotoPath,
        accountNumber: user.accountNumber,
        memberSince: user.createdAt,
        accountType: activeCards.length > 0 ? 'Premium Member' : 'Standard Member',
      },
      accounts: [
        {
          type: 'Main Account',
          accountNumber: user.accountNumber,
          balance: currentBalance,
          accountNumberMasked: `**** ${user.accountNumber.slice(-4)}`,
          status: 'Active',
        }
      ],
      summary: {
        totalBalance: currentBalance,
        pendingTransactions: transactions.filter(t => t.status === 'pending').length,
        accountStatus: 'Active',
        totalCards: activeCards.length,
        pendingRequests: pendingRequests.length,
      },
      activeCards: formattedActiveCards,
      pendingRequests: formattedPendingRequests,
      recentTransactions: formattedTransactions,
    };

    return NextResponse.json(dashboardData);

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to load dashboard data' },
      { status: 500 }
    );
  }
}

