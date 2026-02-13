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

    // Get user's cards
    const cards = await Card.find({ phoneNumber, status: 'active' });

    // Get user's transactions
    const transactions = await Transaction.find({
      $or: [
        { fromPhone: phoneNumber },
        { toPhone: phoneNumber }
      ]
    }).sort({ createdAt: -1 }).limit(10);

    console.log('Found transactions:', transactions.length); // For debugging

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

    // Format cards for frontend
    const formattedCards = cards.map(c => ({
      type: c.cardType,
      number: `**** **** **** ${c.cardNumber.slice(-4)}`,
      holderName: c.cardHolder,
      expiry: `${c.expiryMonth}/${c.expiryYear}`,
    }));

    const dashboardData = {
      user: {
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        location: user.location,
        gender: user.gender,
        birthDate: user.birthDate,
        idType: user.idType,
        idNumber: user.idNumber,
        idPhotoPath: user.idPhotoPath,
        accountNumber: user.accountNumber,
        memberSince: user.createdAt,
        accountType: cards.length > 0 ? 'Premium Member' : 'Standard Member',
      },
      accounts: [
        {
          type: 'Main Account',
          accountNumber: user.accountNumber,
          balance: calculateBalance(transactions, phoneNumber),
          accountNumberMasked: `**** ${user.accountNumber.slice(-4)}`,
          status: 'Active',
        }
      ],
      summary: {
        totalBalance: calculateBalance(transactions, phoneNumber),
        pendingTransactions: transactions.filter(t => t.status === 'pending').length,
        accountStatus: 'Active',
        totalCards: cards.length,
      },
      cards: formattedCards,
      recentTransactions: formattedTransactions,
    };

    return NextResponse.json(dashboardData);

  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

function calculateBalance(transactions: any[], phoneNumber: string) {
  let balance = 1000; // Starting bonus
  transactions.forEach(t => {
    if (t.toPhone === phoneNumber) {
      balance += t.amount;
    } else if (t.fromPhone === phoneNumber) {
      balance -= t.amount;
    }
  });
  return balance;
}