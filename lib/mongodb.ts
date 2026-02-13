// lib/mongodb.ts
import mongoose from 'mongoose';

// Check if MONGODB_URI exists and is a string
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI in .env file');
}

// Now TypeScript knows MONGODB_URI is definitely a string
const uri: string = MONGODB_URI;

// Define the cached type
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Declare global mongoose cache
declare global {
  var mongoose: MongooseCache | undefined;
}

// Initialize cache
const cached: MongooseCache = global.mongoose || { conn: null, promise: null };
global.mongoose = cached;

// Connection options optimized for Windows/Node.js v24
const options = {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  family: 4, // Force IPv4
  retryWrites: true,
  retryReads: true,
  directConnection: false,
  maxPoolSize: 10,
  minPoolSize: 0
};

async function connectDB() {
  if (cached.conn) {
    console.log('✅ Using cached MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('🔄 Connecting to MongoDB...');
    cached.promise = mongoose.connect(uri, options)
      .then((mongoose) => {
        console.log('✅ MongoDB connected successfully');
        return mongoose;
      })
      .catch((error) => {
        console.error('❌ MongoDB connection error:', error.message);
        cached.promise = null;
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;