import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Otp from '@/models/Otp';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    console.log("1️⃣ Send OTP API called");
    await connectDB();
    console.log("2️⃣ Database connected");
    
    const { email } = await request.json();
    console.log("3️⃣ Email received:", email);

    // Check if user exists
    console.log("4️⃣ Searching for user with email:", email);
    const user = await User.findOne({ email });
    console.log("5️⃣ User found?", !!user);
    
    if (!user) {
      console.log("6️⃣ No user found with this email");
      return NextResponse.json(
        { error: 'No account found with this email' },
        { status: 404 }
      );
    }

    console.log("7️⃣ User found:", user.fullName);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("8️⃣ OTP generated:", otp);

    // Save OTP to database
    await Otp.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });
    console.log("9️⃣ OTP saved to database");

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'sabinpant100@gmail.com', // Replace with your email
        pass: 'tjej pfgn ywmw mbsp', // Replace with your app password
      },
    });
    console.log("🔟 Email transporter configured");

    // Send email
    console.log("1️⃣1️⃣ Attempting to send email...");
    await transporter.sendMail({
      from: '"Sabin Bank" <sabinpant100@gmail.com>', // Replace with your email
      to: email,
      subject: 'Password Reset OTP - Sabin Bank',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #2e7d32;">Password Reset Request</h2>
          <p>Hello ${user.fullName},</p>
          <p>We received a request to reset your password. Use the following OTP to proceed:</p>
          <div style="background: #f5f5f5; padding: 1rem; text-align: center; font-size: 2rem; letter-spacing: 5px; font-weight: bold; color: #2e7d32;">
            ${otp}
          </div>
          <p>This OTP is valid for <strong>10 minutes</strong>.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr>
          <p style="color: #666; font-size: 0.9rem;">Sabin Bank - Your Trusted Banking Partner</p>
        </div>
      `,
    });
    console.log("1️⃣2️⃣ Email sent successfully!");

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
    });

  } catch (error) {
    console.error('❌ Send OTP error:', error);
    return NextResponse.json(
      { error: 'Something went wrong: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}