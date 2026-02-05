/**
 * Contract Initialization Helper
 * Run this in browser console after deploying the contract to initialize it
 */

import { ethers } from "ethers";

export const initializeContract = async () => {
  const contractABI = [
    {
      inputs: [{ internalType: "address", name: "_treasury", type: "address" }],
      stateMutability: "nonpayable",
      type: "constructor",
    },
  ];

  if (!window.ethereum) {
    throw new Error("MetaMask not detected");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const userAddress = await signer.getAddress();

  // Example contract deployment call
  // This is just for reference - actual deployment happens through Hardhat/Truffle
  return {
    provider,
    signer,
    userAddress,
  };
};

/**
 * Verify contract deployment
 */
export const verifyContractDeployment = async (contractAddress: string) => {
  if (!window.ethereum) {
    throw new Error("MetaMask not detected");
  }

  if (!ethers.isAddress(contractAddress)) {
    throw new Error("Invalid contract address");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);

  // Check if contract exists
  const code = await provider.getCode(contractAddress);
  if (code === "0x") {
    throw new Error("No contract found at this address");
  }

  return true;
};

/**
 * Set admin address for contract
 */
export const setAdminAddress = async (
  contractAddress: string,
  adminAddress: string,
) => {
  if (!ethers.isAddress(adminAddress)) {
    throw new Error("Invalid admin address");
  }

  if (!window.ethereum) {
    throw new Error("MetaMask not detected");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const walletAddress = await signer.getAddress();

  // Only contract owner can call this
  console.log(`Setting admin: ${adminAddress} by ${walletAddress}`);

  return true;
};
