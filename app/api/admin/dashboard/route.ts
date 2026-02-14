import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Card from '@/models/Card';
import Transaction from '@/models/Transaction';

export async function GET() {
  try {
    await connectDB();
    console.log("✅ Admin dashboard connected to DB");

    // Get statistics
    const totalUsers = await User.countDocuments();
    const pendingUsers = await User.countDocuments({ status: 'pending' });
    const activeUsers = await User.countDocuments({ status: 'active' });
    const totalCards = await Card.countDocuments();
    const totalTransactions = await Transaction.countDocuments();
    const pendingCardRequests = await Card.countDocuments({ requestStatus: 'pending' }); // ADD THIS
    
    console.log("Stats:", { totalUsers, pendingUsers, activeUsers, pendingCardRequests });

    // Get pending users with card requests
    const pendingRequests = await User.find({ 
      status: 'pending'
    }).sort({ createdAt: -1 }).limit(20).select('-password');

    // Get pending card requests (NEW)
    const cardRequests = await Card.find({ 
      requestStatus: 'pending' 
    })
    .sort({ requestedAt: -1 })
    .limit(10);

    // Get user details for each card request
    const cardRequestsWithUser = await Promise.all(
      cardRequests.map(async (card) => {
        const user = await User.findOne({ phoneNumber: card.phoneNumber });
        return {
          id: card._id,
          cardHolder: card.cardHolder,
          cardType: card.cardType,
          reason: card.requestReason,
          requestedAt: card.requestedAt,
          userName: user?.fullName || 'Unknown',
          userEmail: user?.email || 'Unknown',
        };
      })
    );

    // Get recent users
    const recentUsers = await User.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .select('-password');

    console.log("Recent users found:", recentUsers.length);

    return NextResponse.json({
      stats: {
        totalUsers,
        pendingUsers,
        activeUsers,
        totalCards,
        totalTransactions,
        pendingCardRequests, // ADD THIS
      },
      pendingRequests,
      cardRequests: cardRequestsWithUser, // ADD THIS
      recentUsers,
    });

  } catch (error) {
    console.error('❌ Admin dashboard error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}