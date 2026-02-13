import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { fullName, phoneNumber, location, gender, birthDate, idType, idNumber, password } = body;

    // Check if user already exists
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this phone number' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate 16-digit account number
    let accountNumber = '';
    for (let i = 0; i < 16; i++) {
      accountNumber += Math.floor(Math.random() * 10);
    }

    // Create new user
    const newUser = await User.create({
      fullName,
      phoneNumber,
      location,
      gender,
      birthDate: new Date(birthDate),
      idType,
      idNumber,
      idPhotoPath: 'temp-path.jpg',
      accountNumber,
      password: hashedPassword,
    });

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: {
        fullName: newUser.fullName,
        phoneNumber: newUser.phoneNumber,
        accountNumber: newUser.accountNumber,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
