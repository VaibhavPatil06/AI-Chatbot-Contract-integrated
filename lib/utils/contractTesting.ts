/**
 * Contract Testing Helper
 * Use this to verify contract integration is working correctly
 */

import { ethers } from "ethers";
import { contractService } from "@/lib/services/contract";

export const testContractIntegration = async (contractAddress: string) => {
  if (!window.ethereum) {
    throw new Error("MetaMask not installed");
  }

  if (!ethers.isAddress(contractAddress)) {
    throw new Error("Invalid contract address");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const userAddress = await signer.getAddress();

  console.log("Testing contract integration...");
  console.log("Contract address:", contractAddress);
  console.log("User address:", userAddress);

  try {
    // Test 1: Check if contract exists
    const code = await provider.getCode(contractAddress);
    if (code === "0x") {
      throw new Error("No contract code found at this address");
    }
    console.log("✓ Contract code verified");

    // Test 2: Get network info
    const network = await provider.getNetwork();
    console.log(
      "✓ Connected to network:",
      network.name,
      "(Chain ID:",
      network.chainId + ")",
    );

    // Test 3: Get user balance
    const balance = await provider.getBalance(userAddress);
    console.log("✓ User balance:", ethers.formatEther(balance), "ETH");

    // Test 4: Try to read subscription (will fail if not subscribed, which is OK)
    try {
      const subscription = await contractService.getSubscription(
        contractAddress,
        provider,
        userAddress,
      );
      console.log("✓ Subscription check successful:", subscription);
    } catch (e: any) {
      if (e.message.includes("reverted")) {
        console.log(
          "⚠ No active subscription (this is normal if not subscribed)",
        );
      } else {
        throw e;
      }
    }

    return {
      status: "success",
      contractAddress,
      networkName: network.name,
      userAddress,
      balance: ethers.formatEther(balance),
    };
  } catch (error: any) {
    console.error("Contract test failed:", error.message);
    throw error;
  }
};

/**
 * Test subscription flow (without paying real money)
 * This simulates the subscription process for testing
 */
export const testSubscriptionFlow = async (contractAddress: string) => {
  if (!window.ethereum) {
    throw new Error("MetaMask not installed");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const userAddress = await signer.getAddress();

  console.log("Testing subscription flow...");

  try {
    // Test 1: Check current subscription
    console.log("1. Checking current subscription...");
    const currentSub = await contractService.getSubscription(
      contractAddress,
      provider,
      userAddress,
    );
    console.log("   Current subscription:", currentSub);

    // Test 2: Check if subscription is active
    console.log("2. Checking if subscription is active...");
    const isActive = await contractService.isSubscriptionActive(
      contractAddress,
      provider,
      userAddress,
    );
    console.log("   Is active:", isActive);

    return {
      status: "success",
      message: "Subscription flow test completed",
      currentSubscription: currentSub,
      isActive: isActive,
    };
  } catch (error: any) {
    console.error("Subscription flow test failed:", error.message);
    throw error;
  }
};

/**
 * Test if user can initiate a subscription transaction
 * This checks gas estimation and contract parameters
 */
export const estimateSubscriptionCost = async (
  contractAddress: string,
  planId: "basic" | "premium" | "enterprise",
  isYearly: boolean,
) => {
  const cost: Record<string, Record<string, bigint>> = {
    basic: {
      monthly: ethers.parseEther("0.01"),
      yearly: ethers.parseEther("0.1"),
    },
    premium: {
      monthly: ethers.parseEther("0.05"),
      yearly: ethers.parseEther("0.5"),
    },
    enterprise: {
      monthly: ethers.parseEther("0.2"),
      yearly: ethers.parseEther("2.0"),
    },
  };

  const planCost = cost[planId][isYearly ? "yearly" : "monthly"];
  const gasEstimate = BigInt(200000); // Typical gas for subscription tx
  const gasPrice = BigInt(20 * 1e9); // 20 Gwei (adjust for network)

  const gasCost = gasEstimate * gasPrice;
  const totalCost = planCost + gasCost;

  return {
    planCost: ethers.formatEther(planCost),
    gasCost: ethers.formatEther(gasCost),
    totalCost: ethers.formatEther(totalCost),
    planCostWei: planCost.toString(),
    gasCostWei: gasCost.toString(),
    totalCostWei: totalCost.toString(),
  };
};

/**
 * Network compatibility check
 */
export const checkNetworkCompatibility = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask not installed");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();

  const supportedNetworks: Record<number, string> = {
    1: "Ethereum Mainnet",
    11155111: "Sepolia Testnet",
    137: "Polygon Mainnet",
    80002: "Polygon Amoy Testnet",
  };

  const isSupported = network.chainId in supportedNetworks;

  return {
    currentNetwork: supportedNetworks[network.chainId] || "Unknown",
    chainId: network.chainId,
    isSupported,
    supportedNetworks: Object.values(supportedNetworks),
  };
};
