import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Transaction from '@/models/Transaction';

export async function POST(request: Request) {
  try {
    await connectDB();
    
    const { phoneNumber } = await request.json();

    // Find user
    const user = await User.findOne({ phoneNumber });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get all transactions for this user
    const transactions = await Transaction.find({
      $or: [
        { fromPhone: phoneNumber },
        { toPhone: phoneNumber }
      ]
    }).sort({ createdAt: 1 });

    // Calculate correct balance
    let correctBalance = 1000; // Starting balance
    
    transactions.forEach(t => {
      if (t.toPhone === phoneNumber) {
        correctBalance += t.amount;
      } else if (t.fromPhone === phoneNumber) {
        correctBalance -= t.amount;
      }
    });

    // If balance is negative, add a correction transaction
    if (correctBalance < 0) {
      await Transaction.create({
        fromAccount: 'SYSTEM',
        toAccount: user.accountNumber,
        fromPhone: 'SYSTEM',
        toPhone: phoneNumber,
        amount: Math.abs(correctBalance),
        type: 'deposit',
        status: 'completed',
        description: 'Balance Correction - Fixed negative balance',
        balance: 1000,
      });
      
      correctBalance = 1000; // Reset to starting balance
    }

    return NextResponse.json({
      success: true,
      message: 'Balance reset successfully',
      newBalance: correctBalance,
    });

  } catch (error) {
    console.error('Reset balance error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}