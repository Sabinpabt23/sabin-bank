import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Card from '@/models/Card';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    console.log("🔵 Card request API called");
    await connectDB();
    console.log("🟢 Database connected");
    
    const { phoneNumber, cardHolder, cardType, reason } = await request.json();
    console.log("📦 Request data:", { phoneNumber, cardHolder, cardType, reason });

    // Check if user exists
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      console.log("🔴 User not found");
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user already has a pending request
    const existingRequest = await Card.findOne({
      phoneNumber,
      requestStatus: 'pending'
    });

    if (existingRequest) {
      console.log("🟡 Pending request already exists");
      return NextResponse.json(
        { error: 'You already have a pending card request' },
        { status: 400 }
      );
    }

    // Create card request
    const cardRequest = await Card.create({
      phoneNumber,
      cardHolder,
      cardType,
      requestReason: reason,
      requestStatus: 'pending',
      requestedAt: new Date(),
      cardNumber: 'PENDING',
      expiryMonth: '00',
      expiryYear: '00',
      cvv: '000',
      status: 'pending',
    });

    console.log("🟢 Card request created:", cardRequest._id);

    return NextResponse.json({
      success: true,
      message: 'Card request submitted successfully',
      request: {
        id: cardRequest._id,
        cardHolder,
        cardType,
        reason,
        status: 'pending',
      },
    });

  } catch (error) {
    console.error('❌ Card request error:', error);
    return NextResponse.json(
      { error: 'Something went wrong: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}