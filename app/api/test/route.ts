import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function GET() {
  try {
    const uri = process.env.MONGODB_URI;
    console.log('Test API - URI:', uri);
    
    if (!uri) {
      return NextResponse.json({ error: 'No URI' }, { status: 500 });
    }

    // Check current connection state FIRST
    const currentState = mongoose.connection.readyState;
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    
    console.log('Current connection state:', states[currentState]);

    // If already connected, verify it's actually working
    if (currentState === 1 && mongoose.connection.db) {
      try {
        // Try a simple operation to verify connection is alive
        await mongoose.connection.db.admin().ping();
        console.log('✅ Connection verified with ping');
        
        return NextResponse.json({
          success: true,
          message: '✅ Connection verified!',
          state: states[currentState],
          verified: true
        });
      } catch (pingError) {
        console.log('❌ Ping failed, connection is stale');
        // Force disconnect
        await mongoose.disconnect();
      }
    } else if (currentState === 1 && !mongoose.connection.db) {
      console.log('❌ Connection exists but db is undefined');
      await mongoose.disconnect();
    }

    // Try fresh connection
    console.log('Test API - Attempting new connection...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
    });
    
    console.log('Test API - Connected!');
    const newState = mongoose.connection.readyState;
    
    // Test the connection with a ping (with null check)
    if (mongoose.connection.db) {
      await mongoose.connection.db.admin().ping();
    } else {
      throw new Error('Database connection established but db object is undefined');
    }
    
    return NextResponse.json({
      success: true,
      message: '✅ New connection successful!',
      state: states[newState]
    });
    
  } catch (error: any) {
    console.error('Test API - Error:', error.message);
    
    // Make sure we're disconnected
    try {
      await mongoose.disconnect();
    } catch (e) {
      // Ignore disconnect errors
    }
    
    return NextResponse.json({
      success: false,
      message: '❌ Connection failed!',
      error: error.message,
      state: 'disconnected'
    }, { status: 503 }); // 503 Service Unavailable
  }
}