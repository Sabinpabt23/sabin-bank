import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Transaction from '@/models/Transaction';

export async function POST(request: Request) {
  try {
    await connectDB();
    
    const { fromPhone, toPhone, amount, description } = await request.json();

    // Find sender and receiver
    const sender = await User.findOne({ phoneNumber: fromPhone });
    const receiver = await User.findOne({ phoneNumber: toPhone });

    if (!sender) {
      return NextResponse.json(
        { error: 'Sender not found' },
        { status: 404 }
      );
    }

    if (!receiver) {
      return NextResponse.json(
        { error: 'Receiver not found' },
        { status: 404 }
      );
    }

    // Get sender's current balance
    const transactions = await Transaction.find({
      $or: [
        { fromPhone: fromPhone },
        { toPhone: fromPhone }
      ]
    });

    let senderBalance = 1000; // Starting balance
    transactions.forEach(t => {
      if (t.toPhone === fromPhone) {
        senderBalance += t.amount;
      } else if (t.fromPhone === fromPhone) {
        senderBalance -= t.amount;
      }
    });

    // Check sufficient balance
    if (senderBalance < amount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Create transaction
    const transaction = await Transaction.create({
      fromAccount: sender.accountNumber,
      toAccount: receiver.accountNumber,
      fromPhone: sender.phoneNumber,
      toPhone: receiver.phoneNumber,
      amount,
      type: 'transfer',
      status: 'completed',
      description: description || 'Money Transfer',
      balance: senderBalance - amount,
    });

    return NextResponse.json({
      success: true,
      message: 'Transfer successful',
      transaction,
    });

  } catch (error) {
    console.error('Transfer error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

// Handle GET requests to prevent 405 error
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST for transfers.' },
    { status: 405 }
  );
}