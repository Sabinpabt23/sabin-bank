import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST() {
  try {
    await connectDB();
    
    // This is just a test - creates a temporary test user
    const testUser = {
      fullName: 'Test User',
      email: 'test@example.com',
      phoneNumber: '9876543210',
      location: 'Test Location',
      gender: 'male',
      birthDate: new Date('2000-01-01'),
      idType: 'citizenship',
      idNumber: 'TEST123456',
      idPhotoPath: 'test-path.jpg',
      accountNumber: '1234567890123456',
      password: 'hashed_password_here',
      status: 'pending',
      requestedCard: false,
    };

    // Check if test user already exists
    const existing = await User.findOne({ phoneNumber: '9876543210' });
    if (!existing) {
      await User.create(testUser);
    }

    return NextResponse.json({
      success: true,
      message: 'User creation test passed',
      data: { testUserCreated: !existing }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message
    }, { status: 500 });
  }
}