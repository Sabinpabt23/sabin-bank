import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Card from '@/models/Card';

export async function GET() {
  try {
    await connectDB();
    
    // Get all users with their card counts
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    
    // Get card counts for each user
    const usersWithCardCount = await Promise.all(
      users.map(async (user) => {
        const cardCount = await Card.countDocuments({ 
          phoneNumber: user.phoneNumber,
          status: 'active' 
        });
        
        return {
          ...user.toObject(),
          cardCount,
        };
      })
    );

    return NextResponse.json({ users: usersWithCardCount });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}