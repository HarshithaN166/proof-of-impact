// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ProofOfImpact
 * @notice Records impact report identifiers, evidence hashes, and verification
 *         decisions on-chain. No personal data, photos, or large documents are
 *         stored here — only minimal identifiers, hashes, statuses, and
 *         timestamps needed to prove authenticity.
 * @dev    Reports are identified by bytes32 hashes derived from MongoDB ObjectIds
 *         (keccak256 of the hex string). Evidence is stored as a bytes32
 *         SHA-256 manifest hash computed off-chain.
 */
contract ProofOfImpact {
    // =========================================================================
    // Enums & Structs
    // =========================================================================

    /**
     * @notice Lifecycle status of an impact report.
     * @dev    None(0) is used as a sentinel to detect unregistered reports.
     */
    enum Status {
        None,       // 0 — not yet registered
        Pending,    // 1 — submitted, awaiting verifier review
        Approved,   // 2 — verified and approved by an authorised verifier
        Rejected    // 3 — rejected by an authorised verifier
    }

    /// @notice A single on-chain impact report record.
    struct Report {
        bytes32 reportIdHash;           // keccak256 of MongoDB ObjectId string
        bytes32 evidenceManifestHash;   // SHA-256 of sorted evidence file hashes
        Status  status;
        address submittedBy;            // backend signer who registered the report
        address verifiedBy;             // verifier who made the final decision
        uint256 submittedAt;            // block.timestamp at registration
        uint256 verifiedAt;             // block.timestamp at verification / rejection
        string  rejectionReason;        // only populated when status == Rejected
    }

    /// @notice An entry in the append-only status history of a report.
    struct StatusChange {
        Status  status;
        address changedBy;
        uint256 timestamp;
        string  note;                   // optional human-readable note
    }

    // =========================================================================
    // State Variables
    // =========================================================================

    /// @notice The deployer account — has exclusive access to verifier management.
    address public admin;

    /// @notice Tracks which addresses are authorised verifiers.
    mapping(address => bool) public isVerifier;

    /// @notice Primary store of all registered reports.
    mapping(bytes32 => Report) private reports;

    /// @notice Append-only audit trail of status changes per report.
    mapping(bytes32 => StatusChange[]) private reportHistory;

    // =========================================================================
    // Events
    // =========================================================================

    event ReportRegistered(
        bytes32 indexed reportIdHash,
        bytes32         evidenceManifestHash,
        address indexed submittedBy,
        uint256         timestamp
    );

    event ReportVerified(
        bytes32 indexed reportIdHash,
        address indexed verifiedBy,
        uint256         timestamp
    );

    event ReportRejected(
        bytes32 indexed reportIdHash,
        address indexed rejectedBy,
        string          reason,
        uint256         timestamp
    );

    event VerifierAuthorized(address indexed verifier);
    event VerifierRevoked(address indexed verifier);

    // =========================================================================
    // Modifiers
    // =========================================================================

    modifier onlyAdmin() {
        require(msg.sender == admin, "ProofOfImpact: caller is not admin");
        _;
    }

    modifier onlyVerifier() {
        require(isVerifier[msg.sender], "ProofOfImpact: caller is not an authorised verifier");
        _;
    }

    modifier onlyRegistered(bytes32 reportIdHash) {
        require(
            reports[reportIdHash].status != Status.None,
            "ProofOfImpact: report not registered"
        );
        _;
    }

    modifier notAlreadyReviewed(bytes32 reportIdHash) {
        Status s = reports[reportIdHash].status;
        require(
            s == Status.Pending,
            "ProofOfImpact: report has already been reviewed"
        );
        _;
    }

    // =========================================================================
    // Constructor
    // =========================================================================

    constructor() {
        admin = msg.sender;
    }

    // =========================================================================
    // Admin Functions
    // =========================================================================

    /**
     * @notice Grant verifier role to an address.
     * @param  verifier The address to authorise.
     */
    function authorizeVerifier(address verifier) external onlyAdmin {
        require(verifier != address(0), "ProofOfImpact: zero address");
        require(!isVerifier[verifier], "ProofOfImpact: already a verifier");
        isVerifier[verifier] = true;
        emit VerifierAuthorized(verifier);
    }

    /**
     * @notice Revoke verifier role from an address.
     * @param  verifier The address to revoke.
     */
    function revokeVerifier(address verifier) external onlyAdmin {
        require(isVerifier[verifier], "ProofOfImpact: address is not a verifier");
        isVerifier[verifier] = false;
        emit VerifierRevoked(verifier);
    }

    // =========================================================================
    // Report Functions
    // =========================================================================

    /**
     * @notice Register a new impact report on-chain.
     * @dev    Called by the backend signer on behalf of an organisation after
     *         the report is saved in MongoDB. Reverts if the same reportIdHash
     *         has already been registered.
     * @param  reportIdHash          keccak256 of the MongoDB ObjectId string.
     * @param  evidenceManifestHash  SHA-256 manifest hash computed off-chain.
     */
    function registerReport(
        bytes32 reportIdHash,
        bytes32 evidenceManifestHash
    ) external {
        require(reportIdHash != bytes32(0),          "ProofOfImpact: invalid reportIdHash");
        require(evidenceManifestHash != bytes32(0),  "ProofOfImpact: invalid evidenceManifestHash");
        require(
            reports[reportIdHash].status == Status.None,
            "ProofOfImpact: report already registered"
        );

        reports[reportIdHash] = Report({
            reportIdHash:          reportIdHash,
            evidenceManifestHash:  evidenceManifestHash,
            status:                Status.Pending,
            submittedBy:           msg.sender,
            verifiedBy:            address(0),
            submittedAt:           block.timestamp,
            verifiedAt:            0,
            rejectionReason:       ""
        });

        reportHistory[reportIdHash].push(StatusChange({
            status:    Status.Pending,
            changedBy: msg.sender,
            timestamp: block.timestamp,
            note:      "Report registered"
        }));

        emit ReportRegistered(reportIdHash, evidenceManifestHash, msg.sender, block.timestamp);
    }

    /**
     * @notice Approve a pending impact report.
     * @dev    Only an authorised verifier may call this. The report must be
     *         in Pending status — double-reviewing is not permitted.
     * @param  reportIdHash  The identifier of the report to approve.
     */
    function verifyReport(bytes32 reportIdHash)
        external
        onlyVerifier
        onlyRegistered(reportIdHash)
        notAlreadyReviewed(reportIdHash)
    {
        reports[reportIdHash].status     = Status.Approved;
        reports[reportIdHash].verifiedBy = msg.sender;
        reports[reportIdHash].verifiedAt = block.timestamp;

        reportHistory[reportIdHash].push(StatusChange({
            status:    Status.Approved,
            changedBy: msg.sender,
            timestamp: block.timestamp,
            note:      "Report verified and approved"
        }));

        emit ReportVerified(reportIdHash, msg.sender, block.timestamp);
    }

    /**
     * @notice Reject a pending impact report.
     * @dev    Only an authorised verifier may call this. The report must be
     *         in Pending status — double-reviewing is not permitted.
     * @param  reportIdHash  The identifier of the report to reject.
     * @param  reason        A human-readable explanation for the rejection.
     */
    function rejectReport(bytes32 reportIdHash, string calldata reason)
        external
        onlyVerifier
        onlyRegistered(reportIdHash)
        notAlreadyReviewed(reportIdHash)
    {
        require(bytes(reason).length > 0, "ProofOfImpact: rejection reason required");

        reports[reportIdHash].status          = Status.Rejected;
        reports[reportIdHash].verifiedBy      = msg.sender;
        reports[reportIdHash].verifiedAt      = block.timestamp;
        reports[reportIdHash].rejectionReason = reason;

        reportHistory[reportIdHash].push(StatusChange({
            status:    Status.Rejected,
            changedBy: msg.sender,
            timestamp: block.timestamp,
            note:      reason
        }));

        emit ReportRejected(reportIdHash, msg.sender, reason, block.timestamp);
    }

    // =========================================================================
    // View Functions
    // =========================================================================

    /**
     * @notice Retrieve the full record of a registered report.
     * @param  reportIdHash  The identifier of the report.
     * @return The Report struct.
     */
    function getReport(bytes32 reportIdHash)
        external
        view
        onlyRegistered(reportIdHash)
        returns (Report memory)
    {
        return reports[reportIdHash];
    }

    /**
     * @notice Retrieve the append-only status history for a report.
     * @param  reportIdHash  The identifier of the report.
     * @return An array of StatusChange entries in chronological order.
     */
    function getReportHistory(bytes32 reportIdHash)
        external
        view
        onlyRegistered(reportIdHash)
        returns (StatusChange[] memory)
    {
        return reportHistory[reportIdHash];
    }
}

