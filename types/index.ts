export interface User {
  id: string;
  walletAddress: string;
  subscriptionPlan: "basic" | "premium" | "enterprise";
  subscriptionExpiry: Date;
  queriesRemaining: number;
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  walletAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionPlan {
  id: string;
  name: "basic" | "premium" | "enterprise";
  displayName: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: string[];
  queryLimit: number;
  popular?: boolean;
}

export interface WalletState {
  connected: boolean;
  address: string | null;
  balance: number;
  network: string;
  connecting: boolean;
}

export interface UIState {
  theme: "light" | "dark";
  sidebarCollapsed: boolean;
  loading: boolean;
}

export interface Transaction {
  id: string;
  hash: string;
  type: "subscription" | "other";
  amount: number;
  status: "pending" | "confirmed" | "failed";
  timestamp: Date;
}

export interface NetworkInfo {
  name: string;
  chainId: number;
  symbol: string;
  explorer: string;
}
