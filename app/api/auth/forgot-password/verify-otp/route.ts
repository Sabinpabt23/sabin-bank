import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Otp from '@/models/Otp';

export async function POST(request: Request) {
  try {
    await connectDB();
    
    const { email, otp } = await request.json();

    // Find the most recent OTP for this email
    const otpRecord = await Otp.findOne({ 
      email, 
      otp,
      expiresAt: { $gt: new Date() } // Check if not expired
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

    // OTP is valid
    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}