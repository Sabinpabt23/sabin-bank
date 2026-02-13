import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Transaction from '@/models/Transaction';

export async function POST(request: Request) {
  try {
    await connectDB();
    
    const { phoneNumber, amount, type } = await request.json();

    // Find user
    const user = await User.findOne({ phoneNumber });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get current balance from recent transactions
    const recentTransactions = await Transaction.find({
      $or: [
        { fromPhone: phoneNumber },
        { toPhone: phoneNumber }
      ]
    }).sort({ createdAt: -1 });

    let currentBalance = 1000; // Starting balance

    recentTransactions.forEach(t => {
      if (t.toPhone === phoneNumber) {
        currentBalance += t.amount;
      } else if (t.fromPhone === phoneNumber) {
        currentBalance -= t.amount;
      }
    });

    // Check if sufficient balance for withdrawal
    if (type === 'withdraw' && currentBalance < amount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Create transaction
    const transaction = await Transaction.create({
      fromAccount: type === 'withdraw' ? user.accountNumber : 'DEPOSIT',
      toAccount: type === 'deposit' ? user.accountNumber : 'WITHDRAW',
      fromPhone: type === 'withdraw' ? phoneNumber : 'SYSTEM',
      toPhone: type === 'deposit' ? phoneNumber : 'SYSTEM',
      amount,
      type: type === 'deposit' ? 'deposit' : 'withdrawal',
      status: 'completed',
      description: type === 'deposit' ? 'Cash Deposit' : 'Cash Withdrawal',
      balance: type === 'deposit' ? currentBalance + amount : currentBalance - amount,
    });

    return NextResponse.json({
      success: true,
      message: `${type === 'deposit' ? 'Deposit' : 'Withdrawal'} successful`,
      transaction,
      newBalance: type === 'deposit' ? currentBalance + amount : currentBalance - amount,
    });

  } catch (error) {
    console.error('Transaction error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

// Handle GET requests to prevent 405 error
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST for transactions.' },
    { status: 405 }
  );
}