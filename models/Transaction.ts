// models/Transaction.ts
import mongoose from 'mongoose';

export interface ITransaction {
  fromAccount: string;
  toAccount: string;
  fromPhone: string;
  toPhone: string;
  amount: number;
  type: 'transfer' | 'deposit' | 'withdrawal';
  status: 'completed' | 'pending' | 'failed';
  description: string;
  balance: number;
  createdAt: Date;
}

const TransactionSchema = new mongoose.Schema({
  fromAccount: {
    type: String,
    required: true,
  },
  toAccount: {
    type: String,
    required: true,
  },
  fromPhone: {
    type: String,
    required: true,
  },
  toPhone: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['transfer', 'deposit', 'withdrawal'],
    required: true,
  },
  status: {
    type: String,
    enum: ['completed', 'pending', 'failed'],
    default: 'completed',
  },
  description: {
    type: String,
    default: '',
  },
  balance: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);

export default Transaction;