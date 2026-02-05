import { ethers } from 'ethers';

// Subscription Smart Contract ABI
const SUBSCRIPTION_CONTRACT_ABI = [
  {
    inputs: [
      { internalType: 'string', name: 'planId', type: 'string' },
      { internalType: 'bool', name: 'isYearly', type: 'bool' },
    ],
    name: 'subscribe',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'getSubscription',
    outputs: [
      { internalType: 'string', name: 'planId', type: 'string' },
      { internalType: 'uint256', name: 'expiryDate', type: 'uint256' },
      { internalType: 'bool', name: 'active', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'cancelSubscription',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'user', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'deductQueries',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

// Plan prices in ETH (wei)
export const PLAN_PRICES = {
  basic: {
    monthly: ethers.parseEther('0.01'),
    yearly: ethers.parseEther('0.1'),
  },
  premium: {
    monthly: ethers.parseEther('0.05'),
    yearly: ethers.parseEther('0.5'),
  },
  enterprise: {
    monthly: ethers.parseEther('0.2'),
    yearly: ethers.parseEther('2.0'),
  },
};

export interface SubscriptionData {
  planId: string;
  expiryDate: number;
  active: boolean;
}

export const contractService = {
  // Initialize contract
  getContract: (contractAddress: string, provider: ethers.Provider | ethers.Signer) => {
    return new ethers.Contract(
      contractAddress,
      SUBSCRIPTION_CONTRACT_ABI,
      provider
    );
  },

  // Subscribe to a plan
  subscribe: async (
    contractAddress: string,
    signer: ethers.Signer,
    planId: 'basic' | 'premium' | 'enterprise',
    isYearly: boolean
  ) => {
    try {
      const contract = contractService.getContract(contractAddress, signer);
      const price = PLAN_PRICES[planId][isYearly ? 'yearly' : 'monthly'];

      const tx = await contract.subscribe(planId, isYearly, {
        value: price,
        gasLimit: 200000,
      });

      const receipt = await tx.wait();
      return {
        transactionHash: receipt?.hash,
        blockNumber: receipt?.blockNumber,
        status: receipt?.status,
      };
    } catch (error: any) {
      throw new Error(`Subscription failed: ${error.message}`);
    }
  },

  // Get user subscription
  getSubscription: async (
    contractAddress: string,
    provider: ethers.Provider,
    userAddress: string
  ): Promise<SubscriptionData | null> => {
    try {
      const contract = contractService.getContract(contractAddress, provider);
      const [planId, expiryDate, active] = await contract.getSubscription(userAddress);

      return {
        planId,
        expiryDate: Number(expiryDate),
        active,
      };
    } catch (error: any) {
      console.error('Failed to get subscription:', error);
      return null;
    }
  },

  // Cancel subscription
  cancelSubscription: async (
    contractAddress: string,
    signer: ethers.Signer,
    userAddress: string
  ) => {
    try {
      const contract = contractService.getContract(contractAddress, signer);
      const tx = await contract.cancelSubscription();
      const receipt = await tx.wait();

      return {
        transactionHash: receipt?.hash,
        status: receipt?.status,
      };
    } catch (error: any) {
      throw new Error(`Cancel subscription failed: ${error.message}`);
    }
  },

  // Deduct queries from user
  deductQueries: async (
    contractAddress: string,
    signer: ethers.Signer,
    userAddress: string,
    amount: number
  ) => {
    try {
      const contract = contractService.getContract(contractAddress, signer);
      const tx = await contract.deductQueries(userAddress, amount);
      const receipt = await tx.wait();

      return {
        transactionHash: receipt?.hash,
        status: receipt?.status,
      };
    } catch (error: any) {
      throw new Error(`Deduct queries failed: ${error.message}`);
    }
  },

  // Check if user has active subscription
  isSubscriptionActive: async (
    contractAddress: string,
    provider: ethers.Provider,
    userAddress: string
  ): Promise<boolean> => {
    try {
      const subscription = await contractService.getSubscription(
        contractAddress,
        provider,
        userAddress
      );
      if (!subscription) return false;

      const now = Math.floor(Date.now() / 1000);
      return subscription.active && subscription.expiryDate > now;
    } catch {
      return false;
    }
  },

  // Get network from signer
  getNetwork: async (provider: ethers.Provider) => {
    return await provider.getNetwork();
  },
};
