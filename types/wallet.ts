export interface Transaction {
  id: string;
  type: 'subscription' | 'payment' | 'renewal';
  amount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: Date;
  blockHash?: string;
}

export interface NetworkInfo {
  name: string;
  chainId: number;
  symbol: string;
  explorer: string;
}