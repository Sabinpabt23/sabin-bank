import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Admin from '@/models/Admin';

export async function GET() {
  try {
    await connectDB();
    
    // Check if admin exists
    const adminCount = await Admin.countDocuments();
    
    return NextResponse.json({
      success: true,
      message: 'Admin API test passed',
      data: {
        adminExists: adminCount > 0,
        adminCount
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message
    }, { status: 500 });
  }
}