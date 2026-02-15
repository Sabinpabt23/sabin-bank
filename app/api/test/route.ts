import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function GET() {
  try {
    const uri = process.env.MONGODB_URI;
    console.log('Test API - URI:', uri);
    
    if (!uri) {
      return NextResponse.json({ error: 'No URI' }, { status: 500 });
    }


    // Try a direct connection
    console.log('Test API - Attempting connection...');
    await mongoose.connect(uri);
    console.log('Test API - Connected!');
    
    // Check state
    const state = mongoose.connection.readyState;
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    
    await mongoose.disconnect();
    console.log('Test API - Disconnected');
    
    return NextResponse.json({
      success: true,
      message: '✅ Connection successful!',
      state: states[state]
    });
    
  } catch (error) {
    console.error('Test API - Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({
    success: true,
    message: 'Test API POST method works'
  });
}