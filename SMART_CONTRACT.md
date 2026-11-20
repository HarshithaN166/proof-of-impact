# Proof of Impact — Smart Contract Architecture & Documentation

## Overview

The `ProofOfImpact.sol` smart contract provides the decentralized verification registry for the Proof of Impact platform.

> [!NOTE]
> In accordance with privacy and on-chain storage best practices, **no personal information, raw photos, or large documents are stored on the blockchain**. Only cryptographic hashes (evidence manifest hash), unique report identifiers (MongoDB ObjectId hashes), verification statuses, timestamps, and address signatures are persisted on-chain.

---

## Contract Details

- **File Path:** [`blockchain/contracts/ProofOfImpact.sol`](file:///d:/Proof-of-Impact/blockchain/contracts/ProofOfImpact.sol)
- **Solidity Version:** `^0.8.20`
- **Compiler Target:** EVM Paris (with optimizer enabled: 200 runs)
- **Testing Framework:** Hardhat + Chai + Ethers.js v6

---

## Roles & Access Control

1. **Admin (`admin`)**
   - Address that deploys the contract.
   - Authorizes new verifiers (`authorizeVerifier`).
   - Revokes existing verifiers (`revokeVerifier`).

2. **Authorized Verifiers (`isVerifier[address] == true`)**
   - Authorized by the Admin.
   - Allowed to verify (`verifyReport`) or reject (`rejectReport`) pending impact reports.
   - Unauthorized addresses are strictly prevented from changing report statuses.

3. **Organizations / Backend Signer (`msg.sender`)**
   - Registers new impact reports with their unique report ID hash and evidence manifest hash (`registerReport`).
   - Reverts if a report with the same ID hash is registered more than once.

---

## Data Structures

### Status Enum
```solidity
enum Status {
    None,       // 0 - Not yet registered
    Pending,    // 1 - Submitted, awaiting review
    Approved,   // 2 - Verified & approved
    Rejected    // 3 - Rejected by verifier
}
```

### Report Struct
```solidity
struct Report {
    bytes32 reportIdHash;           // keccak256(mongoReportId)
    bytes32 evidenceManifestHash;   // SHA-256 hash of sorted evidence file hashes
    Status  status;                 // Status enum
    address submittedBy;            // Submitter/signer address
    address verifiedBy;             // Verifier address (0x0 until reviewed)
    uint256 submittedAt;            // Submission timestamp
    uint256 verifiedAt;             // Decision timestamp
    string  rejectionReason;        // Non-empty string if Rejected
}
```

### Append-Only Status History
```solidity
struct StatusChange {
    Status  status;
    address changedBy;
    uint256 timestamp;
    string  note;
}
```

---

## Events Emitted

- `event ReportRegistered(bytes32 indexed reportIdHash, bytes32 evidenceManifestHash, address indexed submittedBy, uint256 timestamp)`
- `event ReportVerified(bytes32 indexed reportIdHash, address indexed verifiedBy, uint256 timestamp)`
- `event ReportRejected(bytes32 indexed reportIdHash, address indexed rejectedBy, string reason, uint256 timestamp)`
- `event VerifierAuthorized(address indexed verifier)`
- `event VerifierRevoked(address indexed verifier)`

---

## Testing & Verification

All 12 automated unit test scenarios pass:
1. Successful report registration
2. Duplicate report registration rejection
3. Correct initial `Pending` status
4. Successful verifier authorization
5. Unauthorized verifier rejection
6. Successful report verification by authorized verifier
7. Successful report rejection with reason by authorized verifier
8. Unauthorized status update rejection
9. Correct report status history retrieval
10. Previous status history remains unchanged (append-only)
11. Verifier revocation and preventing further verifier actions
12. Correct blockchain event emission with all required parameters

### Commands to Run:
```bash
# In d:\Proof-of-Impact\blockchain
npm run compile
npm run test
npm run deploy:local
```

