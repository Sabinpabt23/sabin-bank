// lib/mongodb.ts
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

console.log('🔍 MONGODB_URI from env:', MONGODB_URI);

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI in .env file');
}

// Now TypeScript knows MONGODB_URI is definitely a string
const uri: string = MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache;
}

global.mongoose = global.mongoose || { conn: null, promise: null };
const cached = global.mongoose;

async function connectDB() {
  try {
    console.log('🔄 connectDB called');
    
    // Check if mongoose is actually connected
    if (cached.conn) {
      console.log('🔍 Found cached connection, checking state...');
      const state = mongoose.connection.readyState;
      // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
      console.log('📊 Current readyState:', state);
      
      if (state === 1) {
        console.log('✅ Using existing MongoDB connection');
        return cached.conn;
      } else {
        console.log('⚠️ Connection stale (state ' + state + '), reconnecting...');
        cached.conn = null;
        cached.promise = null;
      }
    }

    if (!cached.promise) {
      console.log('🔄 Creating new MongoDB connection to:', uri);
      const opts = {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000,
      };
      
      cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
        console.log('✅ MongoDB connected successfully');
        console.log('📊 Connection state after connect:', mongoose.connection.readyState);
        return mongoose;
      }).catch(err => {
        console.error('❌ Connection promise rejected:', err.message);
        cached.promise = null;
        throw err;
      });
    }

    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    cached.promise = null;
    throw error;
  }
}

// Add a health check function
export async function checkDBHealth() {
  const state = mongoose.connection.readyState;
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return {
    isConnected: state === 1,
    state: states[state] || 'unknown',
    readyState: state,
    hasCachedConnection: !!cached.conn,
    hasCachedPromise: !!cached.promise,
  };
}

export default connectDB;