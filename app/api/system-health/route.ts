import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Card from '@/models/Card';
import Transaction from '@/models/Transaction';
import os from 'os';

// Define types for health data
interface CollectionInfo {
  name: string;
  count?: number;
  size?: string;
}

interface DatabaseService {
  status: boolean;
  type: string;
  message: string;
  latency: number;
  collections: number;
  collectionsList: CollectionInfo[];
}

interface ApiService {
  status: boolean;
  auth: boolean;
  transactions: boolean;
  cards: boolean;
  admin: boolean;
}

interface ServerService {
  status: boolean;
  nodeVersion: string;
  nextVersion: string;
  environment: string;
  memory: string;
  uptime: string;
  platform: string;
  cpuCount: number;
}

interface StorageService {
  status: boolean;
  totalUsers: number;
  totalCards: number;
  totalTransactions: number;
  pendingRequests: number;
}

interface HealthError {
  time: string;
  message: string;
}

interface HealthData {
  overall: boolean;
  responseTime: number;
  services: {
    database: DatabaseService;
    api: ApiService;
    server: ServerService;
    storage: StorageService;
  };
  errors: HealthError[];
}

export async function GET() {
  const startTime = Date.now();
  
  // Initialize health data with proper types
  const health: HealthData = {
    overall: true,
    responseTime: 0,
    services: {
      database: {
        status: false,
        type: 'MongoDB',
        message: '',
        latency: 0,
        collections: 0,
        collectionsList: []
      },
      api: {
        status: false,
        auth: false,
        transactions: false,
        cards: false,
        admin: false
      },
      server: {
        status: true,
        nodeVersion: process.version,
        nextVersion: process.env.npm_package_version || 'N/A',
        environment: process.env.NODE_ENV || 'development',
        memory: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
        uptime: formatUptime(process.uptime()),
        platform: os.platform(),
        cpuCount: os.cpus().length
      },
      storage: {
        status: false,
        totalUsers: 0,
        totalCards: 0,
        totalTransactions: 0,
        pendingRequests: 0
      }
    },
    errors: []
  };

  try {
    // Check Database Connection
    const dbStart = Date.now();
    await connectDB();
    
    if (mongoose.connection.readyState === 1) {
      health.services.database.status = true;
      health.services.database.message = 'Connected';
      health.services.database.latency = Date.now() - dbStart;
      
      // Get collection stats safely
      try {
        if (mongoose.connection.db) {
          const collections = await mongoose.connection.db.listCollections().toArray();
          
          // Format collection info
          const collectionInfo: CollectionInfo[] = [];
          
          for (const collection of collections) {
            // Get document count for each collection
            const count = await mongoose.connection.db.collection(collection.name).countDocuments();
            
            collectionInfo.push({
              name: collection.name,
              count: count,
              size: 'N/A' // You can add size calculation if needed
            });
          }
          
          health.services.database.collectionsList = collectionInfo;
          health.services.database.collections = collectionInfo.length;
        }
      } catch (err) {
        console.error('Error getting collection stats:', err);
      }
      
      // Get storage stats
      try {
        health.services.storage.totalUsers = await User.countDocuments();
        health.services.storage.totalCards = await Card.countDocuments();
        health.services.storage.totalTransactions = await Transaction.countDocuments();
        health.services.storage.pendingRequests = await Card.countDocuments({ requestStatus: 'pending' });
        health.services.storage.status = true;
      } catch (err) {
        console.error('Error getting storage stats:', err);
      }
    } else {
      health.services.database.message = 'Disconnected';
      health.errors.push({
        time: new Date().toISOString(),
        message: 'Database connection lost'
      });
    }
  } catch (error: any) {
    health.services.database.message = error?.message || 'Unknown error';
    health.overall = false;
    health.errors.push({
      time: new Date().toISOString(),
      message: `Database error: ${error?.message || 'Unknown error'}`
    });
  }

  // Check API Endpoints
  try {
    // Test auth API
    try {
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const authRes = await fetch(`${baseUrl}/api/auth/test`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }).catch(() => null);
      
      health.services.api.auth = authRes?.ok || false;
    } catch {
      health.services.api.auth = false;
    }
    
    // For other APIs, check based on database status
    health.services.api.transactions = health.services.database.status;
    health.services.api.cards = health.services.database.status;
    health.services.api.admin = health.services.database.status;
    
    // Overall API status
    health.services.api.status = health.services.api.auth && health.services.database.status;
    
  } catch (error) {
    health.services.api.status = false;
    health.errors.push({
      time: new Date().toISOString(),
      message: 'API endpoints check failed'
    });
  }

  // Calculate overall status
  health.overall = health.services.database.status && health.services.api.status;
  health.responseTime = Date.now() - startTime;

  return NextResponse.json(health);
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0) parts.push(`${secs}s`);
  
  return parts.join(' ') || '0s';
}