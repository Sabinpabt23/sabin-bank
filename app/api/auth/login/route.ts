import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    console.log("1️⃣ Login API called");
    await connectDB();
    console.log("2️⃣ Database connected");
    
    const body = await request.json();
    console.log("3️⃣ Request body:", { phoneNumber: body.phoneNumber, password: '***' });
    
    const { phoneNumber, password } = body;

    // Find user
    console.log("4️⃣ Searching for user with phone:", phoneNumber);
    const user = await User.findOne({ phoneNumber }).lean();
    console.log("5️⃣ User found?", !!user);
    
    // If user doesn't exist
    if (!user) {
      console.log("6️⃣ No user found - returning 401");
      return NextResponse.json(
        { error: 'Invalid phone number or password' },
        { status: 401 }
      );
    }

    console.log("6️⃣ User found:", {
      phoneNumber: user.phoneNumber,
      status: user.status,
      hasPassword: !!user.password
    });

    // Check status
    console.log("7️⃣ Checking status:", user.status);
    if (user.status === 'pending') {
      return NextResponse.json(
        { error: 'Your account is pending admin approval. Please check your email for verification.' },
        { status: 403 }
      );
    }

    if (user.status === 'rejected') {
      return NextResponse.json(
        { error: 'Your account application was rejected. Please contact support.' },
        { status: 403 }
      );
    }

    // Check password
    console.log("8️⃣ Comparing passwords");
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("9️⃣ Password valid?", isPasswordValid);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid phone number or password' },
        { status: 401 }
      );
    }

    // Successful login
    console.log("🔟 Login successful!");
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        accountNumber: user.accountNumber,
      },
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}