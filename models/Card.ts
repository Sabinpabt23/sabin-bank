import mongoose from 'mongoose';

export interface ICard {
  phoneNumber: string;
  cardNumber: string;
  cardHolder: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardType: 'VISA' | 'MASTERCARD' | 'AMEX';
  status: 'active' | 'blocked' | 'expired' | 'pending';  // Added 'pending' here
  requestStatus?: 'pending' | 'approved' | 'rejected';
  requestReason?: string;
  requestedAt?: Date;
  approvedAt?: Date;
  createdAt: Date;
}

const CardSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
  },
  cardNumber: {
    type: String,
    required: true,
    unique: true,
  },
  cardHolder: {
    type: String,
    required: true,
  },
  expiryMonth: {
    type: String,
    required: true,
  },
  expiryYear: {
    type: String,
    required: true,
  },
  cvv: {
    type: String,
    required: true,
  },
  cardType: {
    type: String,
    enum: ['VISA', 'MASTERCARD', 'AMEX'],
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'blocked', 'expired', 'pending'],  // Added 'pending' here
    default: 'pending',
  },
  requestStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
  },
  requestReason: {
    type: String,
  },
  requestedAt: {
    type: Date,
  },
  approvedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Card = mongoose.models.Card || mongoose.model('Card', CardSchema);

export default Card;