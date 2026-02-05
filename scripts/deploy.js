// Hardhat deployment script
// Place this in scripts/deploy.js

async function main() {
  console.log("🚀 Deploying SubscriptionManager contract...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Get account balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  // Deploy contract with treasury address
  const treasuryAddress = process.env.TREASURY_ADDRESS || deployer.address;

  console.log(
    "Deploying to network:",
    (await ethers.provider.getNetwork()).name,
  );
  console.log("Treasury address:", treasuryAddress);

  // Compile and deploy
  const SubscriptionManager = await ethers.getContractFactory(
    "SubscriptionManager",
  );
  const contract = await SubscriptionManager.deploy(treasuryAddress);

  // Wait for deployment
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("✅ SubscriptionManager deployed to:", contractAddress);

  // Verify on Etherscan (optional)
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    await contract.deploymentTransaction()?.wait(6);

    console.log("Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [treasuryAddress],
      });
    } catch (err) {
      if (err.message.includes("Already Verified")) {
        console.log("Contract already verified");
      } else {
        console.log("Verification failed:", err.message);
      }
    }
  }

  // Save deployment info
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId,
    contractAddress: contractAddress,
    treasuryAddress: treasuryAddress,
    deployedBy: deployer.address,
    deployedAt: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber(),
  };

  console.log("\n📋 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  return contractAddress;
}

// Run deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

/*
USAGE:
  
1. Install Hardhat:
   npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

2. Initialize Hardhat project:
   npx hardhat

3. Copy SubscriptionManager.sol to contracts/SubscriptionManager.sol

4. Create .env file with:
   PRIVATE_KEY=your_private_key
   SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
   ETHERSCAN_API_KEY=your_etherscan_api_key
   TREASURY_ADDRESS=0x... (optional, defaults to deployer)

5. Deploy to Sepolia testnet:
   npx hardhat run scripts/deploy.js --network sepolia

6. Copy the contract address and update .env.local:
   NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA=0x...

7. Verify on Etherscan:
   npx hardhat verify --network sepolia DEPLOYED_ADDRESS TREASURY_ADDRESS

HARDHAT CONFIG (hardhat.config.js):
module.exports = {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
    mainnet: {
      url: process.env.MAINNET_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
    polygon: {
      url: process.env.POLYGON_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};
*/
