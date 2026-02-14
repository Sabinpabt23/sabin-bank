import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Card from '@/models/Card';

export async function POST(request: Request) {
  try {
    await connectDB();
    
    const { userId, action } = await request.json(); // action: 'approve' or 'reject'

    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (action === 'approve') {
      // Update user status to active
      user.status = 'active';
      await user.save();

      // If user requested a card, create one
      if (user.requestedCard) {
        // Generate card details
        const cardNumber = generateCardNumber();
        const expiryMonth = String(new Date().getMonth() + 1).padStart(2, '0');
        const expiryYear = String(new Date().getFullYear() + 3).slice(-2);
        const cvv = generateCVV();

        await Card.create({
          phoneNumber: user.phoneNumber,
          cardNumber,
          cardHolder: user.fullName,
          expiryMonth,
          expiryYear,
          cvv,
          cardType: user.cardType || 'VISA',
          status: 'active',
        });
      }

      return NextResponse.json({
        success: true,
        message: 'User approved successfully',
        cardCreated: user.requestedCard,
      });

    } else if (action === 'reject') {
      user.status = 'rejected';
      await user.save();

      return NextResponse.json({
        success: true,
        message: 'User rejected',
      });
    }

  } catch (error) {
    console.error('Approve user error:', error);
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