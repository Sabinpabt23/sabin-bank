import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Card from '@/models/Card';
import User from '@/models/User';

export async function GET() {
  try {
    await connectDB();
    
    // Get all pending card requests with user details
    const pendingRequests = await Card.find({ 
      requestStatus: 'pending',
      status: 'pending'
    }).sort({ requestedAt: -1 });

    // Get user details for each request
    const requestsWithUserDetails = await Promise.all(
      pendingRequests.map(async (request) => {
        const user = await User.findOne({ phoneNumber: request.phoneNumber });
        return {
          id: request._id,
          cardHolder: request.cardHolder,
          cardType: request.cardType,
          reason: request.requestReason,
          requestedAt: request.requestedAt,
          phoneNumber: request.phoneNumber,
          userEmail: user?.email || 'N/A',
          userName: user?.fullName || 'N/A',
        };
      })
    );

    return NextResponse.json({
      success: true,
      requests: requestsWithUserDetails,
    });

  } catch (error) {
    console.error('Error fetching card requests:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}