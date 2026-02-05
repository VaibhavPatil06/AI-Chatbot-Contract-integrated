import { Schema } from 'mongoose';

export const UserSchema = new Schema({
  walletAddress: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    match: /^0x[a-fA-F0-9]{40}$/
  },
  subscriptionPlan: { 
    type: String, 
    enum: ['basic', 'premium', 'enterprise'], 
    default: 'basic' 
  },
  subscriptionExpiry: { 
    type: Date, 
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  },
  queriesRemaining: { 
    type: Number, 
    default: 100 
  },
  totalQueries: { 
    type: Number, 
    default: 0 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  lastActive: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

export type UserDocument = {
  _id: string;
  walletAddress: string;
  subscriptionPlan: 'basic' | 'premium' | 'enterprise';
  subscriptionExpiry: Date;
  queriesRemaining: number;
  totalQueries: number;
  createdAt: Date;
  lastActive: Date;
  updatedAt: Date;
};