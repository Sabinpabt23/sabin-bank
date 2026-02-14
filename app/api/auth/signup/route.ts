import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { 
      fullName, 
      email,  // NEW
      phoneNumber, 
      location, 
      gender, 
      birthDate, 
      idType, 
      idNumber, 
      password,
      requestedCard,  // NEW
      cardType  // NEW
    } = body;

    // Check if user already exists with phone or email
    const existingUser = await User.findOne({ 
      $or: [
        { phoneNumber },
        { email }  // NEW - check email too
      ]
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this phone number or email' },
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

    // Create new user with all fields
    const newUser = await User.create({
      fullName,
      email,  // NEW
      phoneNumber,
      location,
      gender,
      birthDate: new Date(birthDate),
      idType,
      idNumber,
      idPhotoPath: 'temp-path.jpg',
      accountNumber,
      password: hashedPassword,
      status: 'pending', 
      requestedCard: requestedCard === 'yes',  
      cardType: requestedCard === 'yes' ? cardType : null,  
    });

    return NextResponse.json({
      success: true,
      message: 'Account created! Please wait for admin approval. You will receive an email once verified.',
      user: {
        fullName: newUser.fullName,
        email: newUser.email,  // NEW
        phoneNumber: newUser.phoneNumber,
        status: newUser.status,  // NEW
        requestedCard: newUser.requestedCard,  // NEW
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