import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function GET() {
  try {
    const uri = process.env.MONGODB_URI;
    
    if (!uri) {
      return NextResponse.json({ error: 'No URI found' }, { status: 500 });
    }

    await mongoose.connect(uri);
    await mongoose.disconnect();
    
    return NextResponse.json({ 
      success: true, 
      message: '✅ Connected to LOCAL MongoDB!' 
    });
    
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
