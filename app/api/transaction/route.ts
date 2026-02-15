import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Transaction from '@/models/Transaction';

export async function POST(request: Request) {
  try {
    console.log("🔵 Transaction API called");
    
    // Parse request body
    let body;
    try {
      body = await request.json();
      console.log("📦 Request body:", body);
    } catch (e) {
      console.error("❌ Failed to parse request body:", e);
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    const { phoneNumber, amount, type } = body;

    // Validate required fields
    if (!phoneNumber || !amount || !type) {
      console.error("❌ Missing required fields:", { phoneNumber, amount, type });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Connect to database
    console.log("🔄 Connecting to DB...");
    await connectDB();
    console.log("✅ DB Connected");

    // Find user
    console.log("🔍 Finding user:", phoneNumber);
    const user = await User.findOne({ phoneNumber });
    
    if (!user) {
      console.error("❌ User not found:", phoneNumber);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    console.log("✅ User found:", user.fullName);

    // Get all transactions for this user
    console.log("🔍 Fetching transactions...");
    const allTransactions = await Transaction.find({
      $or: [
        { fromPhone: phoneNumber },
        { toPhone: phoneNumber }
      ]
    }).sort({ createdAt: 1 });
    
    console.log(`✅ Found ${allTransactions.length} transactions`);

    // Calculate ACTUAL balance
    let currentBalance = 1000; // Starting balance

    allTransactions.forEach(t => {
      if (t.toPhone === phoneNumber) {
        currentBalance += t.amount;
      } else if (t.fromPhone === phoneNumber) {
        currentBalance -= t.amount;
      }
    });

    console.log(`💰 Current balance: $${currentBalance}`);

    // Check if sufficient balance for withdrawal
    if (type === 'withdraw' && currentBalance < amount) {
      console.log(`❌ Insufficient balance: have $${currentBalance}, need $${amount}`);
      return NextResponse.json(
        { error: `Insufficient balance. Maximum withdrawal: $${currentBalance.toFixed(2)}` },
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
  balance: type === 'deposit' ? currentBalance + amount : currentBalance - amount, // ✅ ADD THIS
});
    console.log("✅ Transaction created:", transaction._id);

    // Calculate new balance
    const newBalance = type === 'deposit' 
      ? currentBalance + amount 
      : currentBalance - amount;

    console.log(`💰 New balance: $${newBalance}`);

    return NextResponse.json({
      success: true,
      message: `${type === 'deposit' ? 'Deposit' : 'Withdrawal'} successful`,
      transaction,
      newBalance,
    });

  } catch (error: any) {
    console.error('❌ Transaction error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json(
      { error: 'Something went wrong: ' + error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST for transactions.' },
    { status: 405 }
  );
}