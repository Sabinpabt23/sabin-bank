// lib/mongodb.ts
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI in .env file');
}

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
    if (cached.conn) {
      const state = mongoose.connection.readyState;
      if (state === 1) {
        return cached.conn;
      } else {
        cached.conn = null;
        cached.promise = null;
      }
    }

    if (!cached.promise) {
      const opts = {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000,
      };
      
      cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
        return mongoose;
      });
    }

    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
}

export async function checkDBHealth() {
  const state = mongoose.connection.readyState;
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return {
    isConnected: state === 1,
    state: states[state] || 'unknown',
    readyState: state,
  };
}

export default connectDB;