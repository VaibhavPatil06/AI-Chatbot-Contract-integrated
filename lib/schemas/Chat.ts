import { Schema } from 'mongoose';

const MessageSchema = new Schema({
  id: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['user', 'assistant'], 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  },
  tokens: { 
    type: Number, 
    default: 0 
  }
});

export const ConversationSchema = new Schema({
  title: { 
    type: String, 
    required: true,
    maxlength: 100
  },
  messages: [MessageSchema],
  walletAddress: { 
    type: String, 
    required: true,
    lowercase: true
  },
  totalMessages: { 
    type: Number, 
    default: 0 
  },
  totalTokens: { 
    type: Number, 
    default: 0 
  },
  isArchived: { 
    type: Boolean, 
    default: false 
  },
  lastActivity: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

export type ConversationDocument = {
  _id: string;
  title: string;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    tokens: number;
  }>;
  walletAddress: string;
  totalMessages: number;
  totalTokens: number;
  isArchived: boolean;
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
};