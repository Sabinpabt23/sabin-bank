import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Transaction from '@/models/Transaction';

export async function GET() {
  try {
    await connectDB();
    
    // Try to fetch a sample transaction
    const sampleTransaction = await Transaction.findOne().lean();
    
    return NextResponse.json({
      success: true,
      message: 'Transaction test passed',
      data: {
        hasTransactions: !!sampleTransaction,
        sample: sampleTransaction ? {
          id: sampleTransaction._id,
          amount: sampleTransaction.amount,
          type: sampleTransaction.type
        } : null
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message
    }, { status: 500 });
  }
}