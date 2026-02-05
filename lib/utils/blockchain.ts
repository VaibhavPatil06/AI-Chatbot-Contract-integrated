import { Transaction, NetworkInfo } from '@/types';

// Mock blockchain networks
const networks: NetworkInfo[] = [
  {
    name: 'Ethereum Mainnet',
    chainId: 1,
    symbol: 'ETH',
    explorer: 'https://etherscan.io',
  },
  {
    name: 'Polygon',
    chainId: 137,
    symbol: 'MATIC',
    explorer: 'https://polygonscan.com',
  },
  {
    name: 'Binance Smart Chain',
    chainId: 56,
    symbol: 'BNB',
    explorer: 'https://bscscan.com',
  },
];

export const blockchainService = {
  // Simulate wallet connection
  async connectWallet(): Promise<{ address: string; network: NetworkInfo }> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const address = '0x' + Math.random().toString(16).substr(2, 40);
    const network = networks[0];
    
    return { address, network };
  },

  // Simulate transaction creation
  async createTransaction(
    amount: number,
    recipient: string,
    type: Transaction['type']
  ): Promise<Transaction> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const transaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      amount,
      currency: 'ETH',
      status: 'pending',
      timestamp: new Date(),
      blockHash: '0x' + Math.random().toString(16).substr(2, 64),
    };

    // Simulate transaction confirmation after delay
    setTimeout(() => {
      transaction.status = Math.random() > 0.1 ? 'confirmed' : 'failed';
    }, 3000);

    return transaction;
  },

  // Simulate smart contract interaction
  async executeSmartContract(
    contractAddress: string,
    method: string,
    params: any[]
  ): Promise<{ success: boolean; txHash: string }> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const success = Math.random() > 0.05; // 95% success rate
    const txHash = '0x' + Math.random().toString(16).substr(2, 64);
    
    return { success, txHash };
  },

  // Get network info
  getNetworkInfo(chainId: number): NetworkInfo | null {
    return networks.find(n => n.chainId === chainId) || null;
  },

  // Simulate gas estimation
  async estimateGas(transaction: any): Promise<number> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return Math.floor(Math.random() * 100000) + 21000;
  },

  // Validate wallet address
  isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  },

  // Format address for display
  formatAddress(address: string): string {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  },

  // Convert Wei to Ether (simulated)
  weiToEther(wei: number): number {
    return wei / Math.pow(10, 18);
  },

  // Convert Ether to Wei (simulated)
  etherToWei(ether: number): number {
    return ether * Math.pow(10, 18);
  },
};