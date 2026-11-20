// test/ProofOfImpact.test.js
// Automated Hardhat tests for the ProofOfImpact smart contract.
// All test data is isolated — no connection to the application database.

const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Simulate the backend: derive a bytes32 report ID from a MongoDB ObjectId
 * string using keccak256, exactly as the backend will do in Milestone 7.
 */
function reportIdHash(mongoId) {
  return ethers.id(mongoId); // ethers.id == keccak256(toUtf8Bytes(str))
}

/**
 * Simulate an off-chain SHA-256 manifest hash as a bytes32 hex value.
 */
function fakeManifestHash(seed) {
  return ethers.id(`manifest-${seed}`);
}

// ---------------------------------------------------------------------------
// Fixture — deploys a fresh contract before each test
// ---------------------------------------------------------------------------

async function deployFixture() {
  const [admin, verifier, otherAccount, anotherAccount] =
    await ethers.getSigners();

  const ProofOfImpact = await ethers.getContractFactory("ProofOfImpact");
  const contract = await ProofOfImpact.deploy();
  await contract.waitForDeployment();

  return { contract, admin, verifier, otherAccount, anotherAccount };
}

// ---------------------------------------------------------------------------
// Test Suite
// ---------------------------------------------------------------------------

describe("ProofOfImpact", function () {
  // -------------------------------------------------------------------------
  // Test 1 — Successful report registration
  // -------------------------------------------------------------------------
  it("1. Should register a new impact report successfully", async function () {
    const { contract, admin } = await loadFixture(deployFixture);

    const rid = reportIdHash("6650aabbccdd001122334455");
    const mhash = fakeManifestHash("test-1");

    const tx = await contract.connect(admin).registerReport(rid, mhash);
    const receipt = await tx.wait();
    const block = await ethers.provider.getBlock(receipt.blockHash);

    await expect(tx)
      .to.emit(contract, "ReportRegistered")
      .withArgs(rid, mhash, admin.address, block.timestamp);

    const report = await contract.connect(admin).getReport(rid);
    expect(report.reportIdHash).to.equal(rid);
    expect(report.evidenceManifestHash).to.equal(mhash);
    expect(report.submittedBy).to.equal(admin.address);
    expect(Number(report.status)).to.equal(1); // Status.Pending
  });

  // -------------------------------------------------------------------------
  // Test 2 — Duplicate report registration rejection
  // -------------------------------------------------------------------------
  it("2. Should revert when registering a duplicate report ID", async function () {
    const { contract, admin } = await loadFixture(deployFixture);

    const rid = reportIdHash("6650aabbccdd001122334456");
    const mhash = fakeManifestHash("test-2");

    await contract.connect(admin).registerReport(rid, mhash);

    await expect(
      contract.connect(admin).registerReport(rid, fakeManifestHash("test-2b"))
    ).to.be.revertedWith("ProofOfImpact: report already registered");
  });

  // -------------------------------------------------------------------------
  // Test 3 — Correct initial PENDING status
  // -------------------------------------------------------------------------
  it("3. Should set initial status to Pending (1) on registration", async function () {
    const { contract, admin } = await loadFixture(deployFixture);

    const rid = reportIdHash("6650aabbccdd001122334457");
    await contract.connect(admin).registerReport(rid, fakeManifestHash("test-3"));

    const report = await contract.getReport(rid);
    expect(Number(report.status)).to.equal(1); // Status.Pending
    expect(report.verifiedBy).to.equal(ethers.ZeroAddress);
    expect(Number(report.verifiedAt)).to.equal(0);
  });

  // -------------------------------------------------------------------------
  // Test 4 — Successful verifier authorization
  // -------------------------------------------------------------------------
  it("4. Should allow admin to authorize a verifier", async function () {
    const { contract, admin, verifier } = await loadFixture(deployFixture);

    expect(await contract.isVerifier(verifier.address)).to.be.false;

    await expect(contract.connect(admin).authorizeVerifier(verifier.address))
      .to.emit(contract, "VerifierAuthorized")
      .withArgs(verifier.address);

    expect(await contract.isVerifier(verifier.address)).to.be.true;
  });

  // -------------------------------------------------------------------------
  // Test 5 — Unauthorized verifier rejection
  // -------------------------------------------------------------------------
  it("5. Should revert when a non-admin tries to authorize a verifier", async function () {
    const { contract, otherAccount, verifier } = await loadFixture(deployFixture);

    await expect(
      contract.connect(otherAccount).authorizeVerifier(verifier.address)
    ).to.be.revertedWith("ProofOfImpact: caller is not admin");
  });

  // -------------------------------------------------------------------------
  // Test 6 — Successful report verification
  // -------------------------------------------------------------------------
  it("6. Should allow an authorised verifier to approve a Pending report", async function () {
    const { contract, admin, verifier } = await loadFixture(deployFixture);

    // Setup: authorise verifier, register report
    await contract.connect(admin).authorizeVerifier(verifier.address);
    const rid = reportIdHash("6650aabbccdd001122334458");
    await contract.connect(admin).registerReport(rid, fakeManifestHash("test-6"));

    // Act
    const tx = await contract.connect(verifier).verifyReport(rid);
    const receipt = await tx.wait();
    const block = await ethers.provider.getBlock(receipt.blockHash);

    await expect(tx)
      .to.emit(contract, "ReportVerified")
      .withArgs(rid, verifier.address, block.timestamp);

    // Assert
    const report = await contract.getReport(rid);
    expect(Number(report.status)).to.equal(2);    // Status.Approved
    expect(report.verifiedBy).to.equal(verifier.address);
  });

  // -------------------------------------------------------------------------
  // Test 7 — Successful report rejection
  // -------------------------------------------------------------------------
  it("7. Should allow an authorised verifier to reject a Pending report", async function () {
    const { contract, admin, verifier } = await loadFixture(deployFixture);

    await contract.connect(admin).authorizeVerifier(verifier.address);
    const rid = reportIdHash("6650aabbccdd001122334459");
    await contract.connect(admin).registerReport(rid, fakeManifestHash("test-7"));

    const reason = "Insufficient photographic evidence";
    const tx = await contract.connect(verifier).rejectReport(rid, reason);
    const receipt = await tx.wait();
    const block = await ethers.provider.getBlock(receipt.blockHash);

    await expect(tx)
      .to.emit(contract, "ReportRejected")
      .withArgs(rid, verifier.address, reason, block.timestamp);

    const report = await contract.getReport(rid);
    expect(Number(report.status)).to.equal(3);    // Status.Rejected
    expect(report.rejectionReason).to.equal(reason);
  });

  // -------------------------------------------------------------------------
  // Test 8 — Unauthorized status update rejection
  // -------------------------------------------------------------------------
  it("8. Should revert when a non-verifier tries to verify or reject a report", async function () {
    const { contract, admin, otherAccount } = await loadFixture(deployFixture);

    const rid = reportIdHash("6650aabbccdd00112233445a");
    await contract.connect(admin).registerReport(rid, fakeManifestHash("test-8"));

    await expect(
      contract.connect(otherAccount).verifyReport(rid)
    ).to.be.revertedWith("ProofOfImpact: caller is not an authorised verifier");

    await expect(
      contract.connect(otherAccount).rejectReport(rid, "some reason")
    ).to.be.revertedWith("ProofOfImpact: caller is not an authorised verifier");
  });

  // -------------------------------------------------------------------------
  // Test 9 — Correct report history retrieval
  // -------------------------------------------------------------------------
  it("9. Should return a correct status history array after registration and verification", async function () {
    const { contract, admin, verifier } = await loadFixture(deployFixture);

    await contract.connect(admin).authorizeVerifier(verifier.address);
    const rid = reportIdHash("6650aabbccdd00112233445b");
    await contract.connect(admin).registerReport(rid, fakeManifestHash("test-9"));
    await contract.connect(verifier).verifyReport(rid);

    const history = await contract.getReportHistory(rid);
    expect(history.length).to.equal(2);
    expect(Number(history[0].status)).to.equal(1); // Pending
    expect(Number(history[1].status)).to.equal(2); // Approved
    expect(history[0].changedBy).to.equal(admin.address);
    expect(history[1].changedBy).to.equal(verifier.address);
  });

  // -------------------------------------------------------------------------
  // Test 10 — Previous status history remains unchanged after decision
  // -------------------------------------------------------------------------
  it("10. Should preserve the original Pending entry in history after rejection", async function () {
    const { contract, admin, verifier } = await loadFixture(deployFixture);

    await contract.connect(admin).authorizeVerifier(verifier.address);
    const rid = reportIdHash("6650aabbccdd00112233445c");
    await contract.connect(admin).registerReport(rid, fakeManifestHash("test-10"));
    await contract.connect(verifier).rejectReport(rid, "Missing location data");

    const history = await contract.getReportHistory(rid);
    expect(history.length).to.equal(2);

    // First entry must still be Pending — it was not overwritten
    expect(Number(history[0].status)).to.equal(1); // Pending
    expect(Number(history[1].status)).to.equal(3); // Rejected
  });

  // -------------------------------------------------------------------------
  // Test 11 — Verifier revocation
  // -------------------------------------------------------------------------
  it("11. Should allow admin to revoke a verifier and prevent further actions", async function () {
    const { contract, admin, verifier } = await loadFixture(deployFixture);

    // Authorise then revoke
    await contract.connect(admin).authorizeVerifier(verifier.address);
    await expect(contract.connect(admin).revokeVerifier(verifier.address))
      .to.emit(contract, "VerifierRevoked")
      .withArgs(verifier.address);

    expect(await contract.isVerifier(verifier.address)).to.be.false;

    // Revoked verifier must not be able to review reports
    const rid = reportIdHash("6650aabbccdd00112233445d");
    await contract.connect(admin).registerReport(rid, fakeManifestHash("test-11"));

    await expect(
      contract.connect(verifier).verifyReport(rid)
    ).to.be.revertedWith("ProofOfImpact: caller is not an authorised verifier");
  });

  // -------------------------------------------------------------------------
  // Test 12 — Correct blockchain event emission
  // -------------------------------------------------------------------------
  it("12. Should emit all required events with correct arguments", async function () {
    const { contract, admin, verifier, otherAccount } =
      await loadFixture(deployFixture);

    // VerifierAuthorized
    await expect(contract.connect(admin).authorizeVerifier(verifier.address))
      .to.emit(contract, "VerifierAuthorized")
      .withArgs(verifier.address);

    const rid = reportIdHash("6650aabbccdd00112233445e");
    const mhash = fakeManifestHash("test-12");

    // ReportRegistered
    const registerTx = await contract.connect(admin).registerReport(rid, mhash);
    const regReceipt = await registerTx.wait();
    const regBlock = await ethers.provider.getBlock(regReceipt.blockHash);
    await expect(registerTx)
      .to.emit(contract, "ReportRegistered")
      .withArgs(rid, mhash, admin.address, regBlock.timestamp);

    // ReportVerified
    const verifyTx = await contract.connect(verifier).verifyReport(rid);
    const verReceipt = await verifyTx.wait();
    const verBlock = await ethers.provider.getBlock(verReceipt.blockHash);
    await expect(verifyTx)
      .to.emit(contract, "ReportVerified")
      .withArgs(rid, verifier.address, verBlock.timestamp);

    // VerifierRevoked
    await expect(contract.connect(admin).revokeVerifier(verifier.address))
      .to.emit(contract, "VerifierRevoked")
      .withArgs(verifier.address);

    // ReportRejected — register a new report and reject it
    const rid2 = reportIdHash("6650aabbccdd00112233445f");
    await contract.connect(admin).authorizeVerifier(otherAccount.address);
    await contract.connect(admin).registerReport(rid2, fakeManifestHash("test-12b"));
    const rejectTx = await contract
      .connect(otherAccount)
      .rejectReport(rid2, "Event test rejection");
    const rejReceipt = await rejectTx.wait();
    const rejBlock = await ethers.provider.getBlock(rejReceipt.blockHash);
    await expect(rejectTx)
      .to.emit(contract, "ReportRejected")
      .withArgs(rid2, otherAccount.address, "Event test rejection", rejBlock.timestamp);
  });
});

// ---------------------------------------------------------------------------
// Utility — returns current block timestamp (approximate; fine for chai checks)
// ---------------------------------------------------------------------------
async function getTimestamp() {
  const block = await ethers.provider.getBlock("latest");
  return block.timestamp;
}

