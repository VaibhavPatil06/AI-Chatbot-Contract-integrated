import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { WalletState, Transaction, NetworkInfo } from "@/types";
import { ethers } from "ethers";

interface ExtendedWalletState extends WalletState {
  transactions: Transaction[];
  networkInfo: NetworkInfo | null;
  error: string | null;
}

const initialState: ExtendedWalletState = {
  connected: false,
  address: null,
  balance: 0,
  network: "ethereum",
  connecting: false,
  transactions: [],
  networkInfo: null,
  error: null,
};

// Supported networks
const NETWORKS: Record<number, NetworkInfo> = {
  1: {
    name: "Ethereum Mainnet",
    chainId: 1,
    symbol: "ETH",
    explorer: "https://etherscan.io",
  },
  11155111: {
    name: "Sepolia Testnet",
    chainId: 11155111,
    symbol: "ETH",
    explorer: "https://sepolia.etherscan.io",
  },
  137: {
    name: "Polygon Mainnet",
    chainId: 137,
    symbol: "MATIC",
    explorer: "https://polygonscan.com",
  },
  80002: {
    name: "Polygon Amoy Testnet",
    chainId: 80002,
    symbol: "MATIC",
    explorer: "https://amoy.polygonscan.com",
  },
};

export const connectWallet = createAsyncThunk(
  "wallet/connect",
  async (_, { rejectWithValue }) => {
    try {
      if (!window.ethereum) {
        throw new Error(
          "MetaMask is not installed. Please install MetaMask extension.",
        );
      }

      const provider = new ethers.BrowserProvider(window.ethereum);

      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || accounts.length === 0) {
        throw new Error(
          "No accounts found. Please enable account access in MetaMask.",
        );
      }

      const address = accounts[0];
      const signer = await provider.getSigner();
      const balance = await provider.getBalance(address);
      const network = await provider.getNetwork();

      const networkInfo = NETWORKS[Number(network.chainId)] || {
        name: network.name,
        chainId: Number(network.chainId),
        symbol: "ETH",
        explorer: "",
      };

      return {
        address,
        balance: Number(ethers.formatEther(balance)),
        network: network.name,
        networkInfo,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to connect wallet");
    }
  },
);

export const disconnectWallet = createAsyncThunk(
  "wallet/disconnect",
  async () => {
    return true;
  },
);

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    updateBalance: (state, action: PayloadAction<number>) => {
      state.balance = action.payload;
    },
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.transactions.unshift(action.payload);
    },
    updateTransaction: (
      state,
      action: PayloadAction<{ id: string; status: Transaction["status"] }>,
    ) => {
      const transaction = state.transactions.find(
        (t) => t.id === action.payload.id,
      );
      if (transaction) {
        transaction.status = action.payload.status;
      }
    },
    setNetwork: (
      state,
      action: PayloadAction<{ network: string; networkInfo: NetworkInfo }>,
    ) => {
      state.network = action.payload.network;
      state.networkInfo = action.payload.networkInfo;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(connectWallet.pending, (state) => {
        state.connecting = true;
        state.error = null;
      })
      .addCase(connectWallet.fulfilled, (state, action) => {
        state.connecting = false;
        state.connected = true;
        state.address = action.payload.address;
        state.balance = action.payload.balance;
        state.network = action.payload.network;
        state.networkInfo = action.payload.networkInfo;
      })
      .addCase(connectWallet.rejected, (state, action) => {
        state.connecting = false;
        state.error = action.error.message || "Failed to connect wallet";
      })
      .addCase(disconnectWallet.fulfilled, (state) => {
        state.connected = false;
        state.address = null;
        state.balance = 0;
        state.transactions = [];
        state.networkInfo = null;
      });
  },
});

export const {
  updateBalance,
  addTransaction,
  updateTransaction,
  setNetwork,
  clearError,
} = walletSlice.actions;

export default walletSlice.reducer;
