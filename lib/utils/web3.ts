import { ethers } from "ethers";

/**
 * Get the contract address for the current network
 */
export function getContractAddress(chainId: number): string | null {
  const addresses: Record<number, string> = {
    1: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_MAINNET || "",
    11155111: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA || "",
    137: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_POLYGON || "",
    80002: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_AMOY || "",
  };

  const address = addresses[chainId];
  return address && address !== "0x" ? address : null;
}

/**
 * Validate if contract address is set for network
 */
export function isContractConfigured(chainId: number): boolean {
  const address = getContractAddress(chainId);
  return address !== null && address !== "0x" && ethers.isAddress(address);
}

/**
 * Format contract error messages for user display
 */
export function formatContractError(error: any): string {
  if (error.code === "ACTION_REJECTED") {
    return "Transaction rejected by user";
  }
  if (error.code === "INSUFFICIENT_FUNDS") {
    return "Insufficient funds for transaction";
  }
  if (error.reason?.includes("Subscription not active")) {
    return "You do not have an active subscription";
  }
  if (error.reason?.includes("Insufficient query quota")) {
    return "You have exceeded your query quota for this month";
  }
  if (error.message?.includes("execution reverted")) {
    return "Transaction failed: Please check your subscription status and retry";
  }
  return error.message || "Contract interaction failed. Please try again.";
}

/**
 * Wait for transaction confirmation
 */
export async function waitForTransaction(
  transactionHash: string,
  provider: ethers.Provider,
  confirmations: number = 1,
): Promise<ethers.TransactionReceipt | null> {
  try {
    const receipt = await provider.waitForTransaction(
      transactionHash,
      confirmations,
      60000,
    );
    return receipt;
  } catch (error) {
    console.error("Failed waiting for transaction:", error);
    return null;
  }
}

/**
 * Get transaction status from hash
 */
export async function getTransactionStatus(
  transactionHash: string,
  provider: ethers.Provider,
): Promise<"pending" | "success" | "failed" | "not_found"> {
  try {
    const receipt = await provider.getTransactionReceipt(transactionHash);
    if (!receipt) return "pending";
    if (receipt.status === null) return "pending";
    return receipt.status === 1 ? "success" : "failed";
  } catch {
    return "not_found";
  }
}

/**
 * Get gas estimate for subscription transaction
 */
export async function estimateGas(
  provider: ethers.Provider,
  contractAddress: string,
  functionName: string,
  params: any[],
): Promise<bigint | null> {
  try {
    // This is a placeholder - actual implementation would depend on contract ABI
    // and specific function parameters
    return BigInt(200000); // Default estimate
  } catch (error) {
    console.error("Failed to estimate gas:", error);
    return null;
  }
}

/**
 * Format wei to ETH
 */
export function formatWeiToEth(wei: bigint | string): string {
  try {
    const eth = ethers.formatEther(wei);
    return parseFloat(eth).toFixed(4);
  } catch {
    return "0";
  }
}

/**
 * Parse ETH to wei
 */
export function parseEthToWei(eth: string | number): bigint {
  try {
    return ethers.parseEther(eth.toString());
  } catch {
    return BigInt(0);
  }
}

/**
 * Switch network in MetaMask
 */
export async function switchNetwork(chainId: number): Promise<boolean> {
  if (!window.ethereum) return false;

  const chainIdHex = "0x" + chainId.toString(16);

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainIdHex }],
    });
    return true;
  } catch (error: any) {
    if (error.code === 4902) {
      // Network not added to MetaMask
      console.log(
        "Network not found in MetaMask. You may need to add it manually.",
      );
      return false;
    }
    console.error("Failed to switch network:", error);
    return false;
  }
}

/**
 * Get user's account balance on specific token or native
 */
export async function getBalance(
  userAddress: string,
  provider: ethers.Provider,
): Promise<string> {
  try {
    const balance = await provider.getBalance(userAddress);
    return ethers.formatEther(balance);
  } catch {
    return "0";
  }
}
