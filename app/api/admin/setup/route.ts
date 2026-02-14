import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import Admin from '@/models/Admin';

export async function POST() {
  try {
    await connectDB();
    
    // Check if admin already exists
    const adminExists = await Admin.findOne({ email: 'admin@sabinbank.com' });
    if (adminExists) {
      return NextResponse.json(
        { error: 'Admin already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    const admin = await Admin.create({
      fullName: 'Super Admin',
      email: 'admin@sabinbank.com',
      password: hashedPassword,
      role: 'superadmin',
    });

    return NextResponse.json({
      success: true,
      message: 'Admin created successfully',
      admin: {
        email: admin.email,
        fullName: admin.fullName,
      },
    });

  } catch (error) {
    console.error('Admin setup error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

// Add GET handler for easy browser access
export async function GET() {
  try {
    await connectDB();
    
    const adminExists = await Admin.findOne({ email: 'admin@sabinbank.com' });
    
    if (adminExists) {
      return NextResponse.json({
        message: 'Admin already exists',
        admin: {
          email: adminExists.email,
          fullName: adminExists.fullName,
        }
      });
    } else {
      // Create admin automatically when visiting via GET
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      const admin = await Admin.create({
        fullName: 'Super Admin',
        email: 'admin@sabinbank.com',
        password: hashedPassword,
        role: 'superadmin',
      });
      
      return NextResponse.json({
        success: true,
        message: 'Admin created automatically',
        admin: {
          email: admin.email,
          fullName: admin.fullName,
        }
      });
    }
  } catch (error) {
    console.error('Admin setup error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}