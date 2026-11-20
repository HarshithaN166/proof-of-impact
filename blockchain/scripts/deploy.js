// scripts/deploy.js
// Hardhat deployment script for ProofOfImpact.sol
// Run with: npx hardhat run scripts/deploy.js --network localhost

const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("=".repeat(60));
  console.log("  Proof of Impact — Smart Contract Deployment");
  console.log("=".repeat(60));

  // --- deployer info ---
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`\nDeployer address : ${deployer.address}`);
  console.log(`Deployer balance : ${ethers.formatEther(balance)} ETH`);

  // --- deploy ---
  console.log("\nDeploying ProofOfImpact...");
  const ProofOfImpact = await ethers.getContractFactory("ProofOfImpact");
  const contract = await ProofOfImpact.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log(`\n✅  Contract deployed successfully!`);
  console.log(`    Contract address : ${contractAddress}`);
  console.log(`    Admin (deployer) : ${deployer.address}`);

  // --- persist address for backend (Milestone 7) ---
  const configDir = path.resolve(__dirname, "../../server/src/config");
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  const addressFile = path.join(configDir, "contractAddress.json");
  const payload = {
    network: "localhost",
    chainId: 31337,
    contractAddress,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
  };
  fs.writeFileSync(addressFile, JSON.stringify(payload, null, 2));
  console.log(`\n📄  Contract address saved to:`);
  console.log(`    ${addressFile}`);

  console.log("\n" + "=".repeat(60));
  console.log("  Deployment complete — Milestone 6 ✓");
  console.log("=".repeat(60) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\n❌  Deployment failed:", err.message);
    process.exit(1);
  });

