import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Card from '@/models/Card';
import Transaction from '@/models/Transaction';

export async function GET() {
  try {
    await connectDB();
    console.log("Admin dashboard connected to DB");

    // Get statistics
    const totalUsers = await User.countDocuments();
    const pendingUsers = await User.countDocuments({ status: 'pending' });
    const activeUsers = await User.countDocuments({ status: 'active' });
    const totalCards = await Card.countDocuments();
    const totalTransactions = await Transaction.countDocuments();
    
    console.log("Stats:", { totalUsers, pendingUsers, activeUsers });

    // Get pending users with card requests
    const pendingRequests = await User.find({ 
      status: 'pending'
    }).sort({ createdAt: -1 }).limit(20).select('-password');

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
      },
      pendingRequests,
      recentUsers,
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}