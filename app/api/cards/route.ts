import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Card from '@/models/Card';

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

    // Get active cards
    const activeCards = await Card.find({ 
      phoneNumber, 
      status: 'active' 
    });

    // Get pending requests
    const pendingRequests = await Card.find({ 
      phoneNumber, 
      requestStatus: 'pending' 
    });

    return NextResponse.json({ 
      activeCards,
      pendingRequests 
    });

  } catch (error) {
    console.error('Cards fetch error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    
    const { phoneNumber, cardHolder, cardType } = await request.json();

    // Generate random card number
    const cardNumber = generateCardNumber();
    const expiryMonth = String(new Date().getMonth() + 1).padStart(2, '0');
    const expiryYear = String(new Date().getFullYear() + 3).slice(-2);
    const cvv = generateCVV();

    const card = await Card.create({
      phoneNumber,
      cardNumber,
      cardHolder,
      expiryMonth,
      expiryYear,
      cvv,
      cardType,
    });

    return NextResponse.json({
      success: true,
      message: 'Card added successfully',
      card: {
        ...card.toObject(),
        cvv: '***', // Don't send CVV to frontend
      },
    });

  } catch (error) {
    console.error('Card creation error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

function generateCardNumber() {
  let number = '';
  for (let i = 0; i < 16; i++) {
    number += Math.floor(Math.random() * 10);
  }
  return number.match(/.{1,4}/g)?.join(' ') || number;
}

function generateCVV() {
  return Math.floor(Math.random() * 900 + 100).toString();
}