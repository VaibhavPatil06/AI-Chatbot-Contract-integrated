import { Schema } from 'mongoose';

export const SubscriptionSchema = new Schema({
  walletAddress: { 
    type: String, 
    required: true,
    lowercase: true
  },
  planType: { 
    type: String, 
    enum: ['basic', 'premium', 'enterprise'], 
    required: true 
  },
  startDate: { 
    type: Date, 
    required: true 
  },
  endDate: { 
    type: Date, 
    required: true 
  },
  autoRenew: { 
    type: Boolean, 
    default: true 
  },
  paymentAmount: { 
    type: Number, 
    required: true 
  },
  paymentCurrency: { 
    type: String, 
    default: 'ETH' 
  },
  transactionHash: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['active', 'expired', 'cancelled', 'pending'], 
    default: 'pending' 
  },
  queriesUsed: { 
    type: Number, 
    default: 0 
  },
  queriesLimit: { 
    type: Number, 
    required: true 
  }
}, {
  timestamps: true
});

export type SubscriptionDocument = {
  _id: string;
  walletAddress: string;
  planType: 'basic' | 'premium' | 'enterprise';
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  paymentAmount: number;
  paymentCurrency: string;
  transactionHash: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  queriesUsed: number;
  queriesLimit: number;
  createdAt: Date;
  updatedAt: Date;
};