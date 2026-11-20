import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths to artifact & address
const ARTIFACT_PATH = path.resolve(
  __dirname,
  '../../../blockchain/artifacts/contracts/ProofOfImpact.sol/ProofOfImpact.json'
);
const CONFIG_ADDRESS_PATH = path.resolve(__dirname, '../config/contractAddress.json');

let provider = null;
let adminSigner = null;
let verifierSigner = null;
let contractAbi = null;
let contractAddress = null;
let isInitialized = false;

/**
 * Initialize Blockchain Connection
 */
export const initializeBlockchain = () => {
  try {
    const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:8545';
    provider = new ethers.JsonRpcProvider(rpcUrl);

    // Resolve Contract Address
    if (process.env.CONTRACT_ADDRESS) {
      contractAddress = process.env.CONTRACT_ADDRESS;
    } else if (fs.existsSync(CONFIG_ADDRESS_PATH)) {
      const cfg = JSON.parse(fs.readFileSync(CONFIG_ADDRESS_PATH, 'utf8'));
      contractAddress = cfg.contractAddress;
    }

    // Resolve ABI
    if (fs.existsSync(ARTIFACT_PATH)) {
      const artifact = JSON.parse(fs.readFileSync(ARTIFACT_PATH, 'utf8'));
      contractAbi = artifact.abi;
    } else {
      console.warn('[Blockchain] Artifact not found at', ARTIFACT_PATH);
    }

    // Setup Admin Signer (Account #0)
    const adminKey = process.env.SIGNER_PRIVATE_KEY;
    if (adminKey && provider) {
      adminSigner = new ethers.Wallet(adminKey, provider);
    }

    // Setup Verifier Signer (Account #1)
    const verifierKey = process.env.VERIFIER_PRIVATE_KEY;
    if (verifierKey && provider) {
      verifierSigner = new ethers.Wallet(verifierKey, provider);
    }

    isInitialized = Boolean(provider && contractAddress && contractAbi && adminSigner);

    if (isInitialized) {
      console.log(`[Blockchain] Connected to ProofOfImpact at ${contractAddress}`);
      console.log(`[Blockchain] Admin Signer: ${adminSigner.address}`);
      if (verifierSigner) {
        console.log(`[Blockchain] Verifier Signer: ${verifierSigner.address}`);
        // Ensure verifier is authorized on-chain automatically
        ensureVerifierAuthorized(verifierSigner.address).catch((err) => {
          console.warn('[Blockchain] Verifier auto-authorization check warning:', err.message);
        });
      }
    } else {
      console.warn('[Blockchain] Not fully initialized. Check RPC, ABI, or keys.');
    }
  } catch (err) {
    console.error('[Blockchain] Initialization error:', err.message);
  }
};

/**
 * Ensure the default verifier signer is authorized on the smart contract
 */
export const ensureVerifierAuthorized = async (verifierAddress) => {
  if (!isInitialized || !adminSigner) return;
  try {
    const contract = new ethers.Contract(contractAddress, contractAbi, adminSigner);
    const alreadyVerifier = await contract.isVerifier(verifierAddress);
    if (!alreadyVerifier) {
      console.log(`[Blockchain] Authorizing verifier ${verifierAddress} on-chain...`);
      const tx = await contract.authorizeVerifier(verifierAddress);
      await tx.wait();
      console.log(`[Blockchain] Verifier ${verifierAddress} authorized successfully.`);
    }
  } catch (err) {
    console.warn(`[Blockchain] Could not auto-authorize verifier: ${err.message}`);
  }
};

/**
 * Get read-only contract instance
 */
const getReadOnlyContract = () => {
  if (!contractAddress || !contractAbi || !provider) {
    throw new Error('Blockchain service is not initialized.');
  }
  return new ethers.Contract(contractAddress, contractAbi, provider);
};

/**
 * Register Impact Report On-Chain
 * Converts MongoDB report ID string to bytes32 using keccak256
 */
export const registerReportOnChain = async (mongoReportId, evidenceManifestHash) => {
  if (!isInitialized || !adminSigner) {
    throw new Error('Blockchain signer not ready.');
  }

  // 1. Compute bytes32 report ID hash
  const reportIdHash = ethers.id(mongoReportId.toString());

  // 2. Format manifest hash as bytes32
  let manifestBytes32;
  if (!evidenceManifestHash) {
    manifestBytes32 = ethers.id(`manifest-${mongoReportId.toString()}`);
  } else if (evidenceManifestHash.startsWith('0x') && evidenceManifestHash.length === 66) {
    manifestBytes32 = evidenceManifestHash;
  } else {
    // If raw hex string without 0x or different length, format or hash
    manifestBytes32 = evidenceManifestHash.startsWith('0x')
      ? evidenceManifestHash
      : `0x${evidenceManifestHash}`;
    if (manifestBytes32.length !== 66) {
      manifestBytes32 = ethers.id(evidenceManifestHash);
    }
  }

  const contract = new ethers.Contract(contractAddress, contractAbi, adminSigner);
  console.log(`[Blockchain] Registering report ${mongoReportId} on-chain (${reportIdHash})...`);

  const tx = await contract.registerReport(reportIdHash, manifestBytes32);
  const receipt = await tx.wait();

  return {
    transactionHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    contractAddress,
    onChainReportId: reportIdHash,
    submittedBy: adminSigner.address,
  };
};

/**
 * Verify / Approve Report On-Chain
 */
export const verifyReportOnChain = async (mongoReportId) => {
  if (!verifierSigner) {
    throw new Error('Verifier blockchain signer is not configured.');
  }

  const reportIdHash = ethers.id(mongoReportId.toString());
  const contract = new ethers.Contract(contractAddress, contractAbi, verifierSigner);
  console.log(`[Blockchain] Verifying report ${mongoReportId} on-chain by ${verifierSigner.address}...`);

  const tx = await contract.verifyReport(reportIdHash);
  const receipt = await tx.wait();

  return {
    transactionHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    verifierAddress: verifierSigner.address,
    verifiedAt: new Date(),
  };
};

/**
 * Reject Report On-Chain
 */
export const rejectReportOnChain = async (mongoReportId, reason) => {
  if (!verifierSigner) {
    throw new Error('Verifier blockchain signer is not configured.');
  }

  const reportIdHash = ethers.id(mongoReportId.toString());
  const contract = new ethers.Contract(contractAddress, contractAbi, verifierSigner);
  console.log(`[Blockchain] Rejecting report ${mongoReportId} on-chain with reason "${reason}"...`);

  const tx = await contract.rejectReport(reportIdHash, reason || 'Rejected by auditor');
  const receipt = await tx.wait();

  return {
    transactionHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    verifierAddress: verifierSigner.address,
    verifiedAt: new Date(),
  };
};

/**
 * Get On-Chain Report Details and Status History
 */
export const getOnChainReportDetails = async (mongoReportId) => {
  const contract = getReadOnlyContract();
  const reportIdHash = ethers.id(mongoReportId.toString());

  const statusEnumMap = ['None', 'PENDING', 'APPROVED', 'REJECTED'];

  try {
    const reportData = await contract.getReport(reportIdHash);
    const historyData = await contract.getReportHistory(reportIdHash);

    const statusIndex = Number(reportData.status);

    const history = historyData.map((item) => ({
      status: statusEnumMap[Number(item.status)] || 'UNKNOWN',
      changedBy: item.changedBy,
      timestamp: new Date(Number(item.timestamp) * 1000).toISOString(),
      note: item.note,
    }));

    return {
      exists: true,
      reportIdHash: reportData.reportIdHash,
      evidenceManifestHash: reportData.evidenceManifestHash,
      status: statusEnumMap[statusIndex] || 'UNKNOWN',
      submittedBy: reportData.submittedBy,
      verifiedBy: reportData.verifiedBy,
      submittedAt: reportData.submittedAt > 0n
        ? new Date(Number(reportData.submittedAt) * 1000).toISOString()
        : null,
      verifiedAt: reportData.verifiedAt > 0n
        ? new Date(Number(reportData.verifiedAt) * 1000).toISOString()
        : null,
      rejectionReason: reportData.rejectionReason,
      history,
    };
  } catch (err) {
    if (err.message.includes('report not registered')) {
      return { exists: false, error: 'Report not registered on-chain' };
    }
    throw err;
  }
};

/**
 * Authorize a verifier by admin
 */
export const authorizeVerifierOnChain = async (verifierAddress) => {
  if (!adminSigner) throw new Error('Admin signer not configured.');
  const contract = new ethers.Contract(contractAddress, contractAbi, adminSigner);
  const tx = await contract.authorizeVerifier(verifierAddress);
  const receipt = await tx.wait();
  return { transactionHash: receipt.hash, verifierAddress };
};

/**
 * Revoke a verifier by admin
 */
export const revokeVerifierOnChain = async (verifierAddress) => {
  if (!adminSigner) throw new Error('Admin signer not configured.');
  const contract = new ethers.Contract(contractAddress, contractAbi, adminSigner);
  const tx = await contract.revokeVerifier(verifierAddress);
  const receipt = await tx.wait();
  return { transactionHash: receipt.hash, verifierAddress };
};

/**
 * Get Blockchain status info
 */
export const getBlockchainStatus = async () => {
  try {
    const isOnline = Boolean(provider);
    let blockNumber = null;
    if (provider) {
      blockNumber = await provider.getBlockNumber();
    }
    return {
      connected: isInitialized,
      network: 'Hardhat Localhost (31337)',
      contractAddress,
      blockNumber,
      adminAddress: adminSigner ? adminSigner.address : null,
      verifierAddress: verifierSigner ? verifierSigner.address : null,
    };
  } catch (err) {
    return {
      connected: false,
      error: err.message,
    };
  }
};

