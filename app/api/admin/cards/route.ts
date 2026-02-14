import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Card from '@/models/Card';
import User from '@/models/User';

export async function GET() {
  try {
    await connectDB();
    
    // Get all cards
    const cards = await Card.find({}).sort({ createdAt: -1 });
    
    // Get user details for each card
    const cardsWithUserDetails = await Promise.all(
      cards.map(async (card) => {
        const user = await User.findOne({ phoneNumber: card.phoneNumber });
        return {
          ...card.toObject(),
          userName: user?.fullName || 'Unknown',
          userEmail: user?.email || 'Unknown',
        };
      })
    );

    return NextResponse.json({ cards: cardsWithUserDetails });

  } catch (error) {
    console.error('Error fetching cards:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    await connectDB();
    
    const { cardId, status } = await request.json();

    const card = await Card.findById(cardId);
    
    if (!card) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      );
    }

    card.status = status;
    await card.save();

    return NextResponse.json({
      success: true,
      message: `Card ${status === 'active' ? 'unblocked' : 'blocked'} successfully`,
    });

  } catch (error) {
    console.error('Error updating card:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}