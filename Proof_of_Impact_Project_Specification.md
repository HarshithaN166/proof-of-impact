# PROOF OF IMPACT

## Complete Project Specification and Build Guide for Anti-Gravity

**Project type:** Full-stack blockchain application\
**Project title:** Proof of Impact\
**Tagline:** *Don't Just Claim Impact. Prove It.*\
**Document purpose:** This file is the single source of truth for
planning, building, testing, and presenting the Proof of Impact
prototype in Anti-Gravity.

------------------------------------------------------------------------

# 1. Project Overview

Proof of Impact is a blockchain-based platform for submitting,
reviewing, verifying, and publicly tracking social and environmental
impact activities.

Examples include: - Tree-plantation drives - Food distribution -
Blood-donation camps - Community clean-up drives - Educational support
programmes - Clothing or essential-item distribution -
Water-conservation initiatives - Animal-welfare activities

An organization creates a campaign and submits an impact report with
supporting evidence. An authorized verifier reviews the claim and either
approves or rejects it. When approved, the application records a
verification event on a blockchain smart contract. The public can
inspect the campaign, its reported outcome, verification status,
evidence reference, and blockchain transaction.

**Important scope statement:** The blockchain makes the recorded data
and verification history tamper-evident. It does not independently prove
that a real-world event happened. Real-world truth still depends on
evidence quality and the reliability of the verification process.

## 1.1 One-line explanation

A platform where organizations submit evidence-backed social impact
claims, authorized verifiers review them, and approved records are
stored on a blockchain so the public can inspect the verification
history.

## 1.2 Demonstration scenario

An organization runs a tree-plantation campaign and reports that 100
saplings were planted.

1.  The organization registers and signs in.
2.  It creates a campaign called **Green Campus Drive**.
3.  It submits an impact report: **100 saplings planted**.
4.  It uploads photographs and supporting information.
5.  A verifier opens the claim and checks the evidence.
6.  The verifier approves or rejects the claim.
7.  If approved, the smart contract records the verification status and
    evidence hash.
8.  The application displays the transaction hash and verified status.
9.  A public visitor opens the campaign page and inspects its details.

Use clearly labelled sample/demo data during development. Do not present
fictional demonstration activity as independently verified real-world
impact.

------------------------------------------------------------------------

# 2. Problem Statement

Organizations, charities, student groups, and community initiatives
often publish claims about their social or environmental work. Donors
and members of the public may find it difficult to determine whether
those claims are accurate, whether the same activity has been reported
more than once, or whether a report was altered after approval.

Common problems: - Impact reports may be unsupported or difficult to
validate. - Evidence may be changed after a report is submitted. -
Similar activities may be submitted more than once. - Verification
decisions may not have a transparent history. - The public may not have
a convenient way to inspect campaign outcomes. - Records may be
scattered across spreadsheets, documents, and social-media posts.

**Proposed solution:** Build a web platform that organizes impact
campaigns, accepts supporting evidence, provides a verifier review
workflow, and records approved verification events and evidence
fingerprints on a blockchain.

------------------------------------------------------------------------

# 3. Goals and Objectives

1.  Provide a structured way to create and manage impact campaigns.
2.  Allow organizations to submit measurable impact reports.
3.  Allow evidence files and descriptions to be attached to reports.
4.  Generate a cryptographic hash for each submitted evidence file.
5.  Allow only authorized verifiers to approve or reject claims.
6.  Record approval/rejection events and relevant hashes on-chain.
7.  Provide a public dashboard for browsing campaign records.
8.  Make changes to evidence detectable by comparing hashes.
9.  Provide a simple, understandable demonstration of blockchain beyond
    cryptocurrency.
10. Keep the prototype small enough to build, test, and demonstrate as a
    student project.

## 3.1 Non-goals for the first prototype

Do not attempt to solve every real-world verification problem in version
1.

-   Do not claim that blockchain itself confirms a photograph is
    genuine.
-   Do not claim that GPS proves an activity happened.
-   Do not build cryptocurrency, tokens, or a donation-payment system.
-   Do not add AI verification unless the core workflow is complete.
-   Do not deploy to mainnet or spend real cryptocurrency.
-   Do not store private personal information or raw sensitive documents
    on a public blockchain.
-   Do not promise that duplicate-claim detection is perfect.

------------------------------------------------------------------------

# 4. Users and Roles

## 4.1 Public visitor

Can: - View public campaigns. - Search and filter campaigns. - Open
campaign details. - See reported impact and current status. - View
verification information and transaction hash for on-chain records. -
Compare the displayed evidence hash with a locally calculated file hash,
where evidence is made available.

Cannot: - Create campaigns. - Submit claims. - Approve or reject
claims. - Access private organization information.

## 4.2 Organization

Can: - Register and sign in. - Create campaigns. - Edit a draft
campaign. - Submit an impact report. - Upload evidence. - View its own
campaigns and report statuses. - View verifier feedback. - See
transaction details after an on-chain action.

Cannot: - Approve its own claims. - Change a verified on-chain record. -
Assign itself the verifier role.

## 4.3 Verifier

Can: - Sign in to the verifier dashboard. - View pending impact
claims. - Inspect campaign details and evidence. - Approve a claim. -
Reject a claim with a reason. - See the history of its decisions.

Cannot: - Change the submitted evidence. - Approve a claim from an
unauthorized account. - Alter a past blockchain transaction.

## 4.4 Administrator

Can: - Manage application users and roles. - Register or authorize
verifier accounts. - Review campaign activity. - Disable accounts where
necessary. - View audit information.

For a short student prototype, the administrator can be a seeded account
rather than a complete admin-management product.

------------------------------------------------------------------------

# 5. Main Features and Functional Requirements

## 5.1 Authentication and roles

-   Registration and login.
-   Passwords must be securely hashed by the backend.
-   Role-based authorization: `organization`, `verifier`, `admin`.
-   Public browsing does not require login.
-   Do not trust a role value sent by the browser. The backend must
    check the authenticated user's role.
-   Provide a logout action.

## 5.2 Campaign management

Each campaign should contain: - Campaign ID - Campaign title - Short
description - Impact category - Organization name and owner ID -
Location label (optional; avoid collecting exact private addresses) -
Start date and end date - Campaign image (optional) - Target amount or
target count (optional) - Unit (for example, saplings, meals, books,
kilograms) - Creation timestamp - Campaign status

Suggested categories: - Environment - Food and Nutrition - Education -
Health and Community - Cleanliness - Animal Welfare - Other

Campaign statuses: - `DRAFT` - `ACTIVE` - `COMPLETED` - `ARCHIVED`

## 5.3 Impact report submission

Each report should contain: - Report ID - Campaign ID - Organization
ID - Impact statement - Numeric quantity - Unit - Activity date or date
range - Description of how the quantity was counted - Evidence file
references - Evidence file hashes - Submission timestamp - Current
review status

Report statuses: - `PENDING` - `APPROVED` - `REJECTED` -
`REVISION_REQUESTED` (optional future enhancement)

A report should become read-only after submission, except for a
controlled resubmission flow. Preserve the original submission and
record any resubmission as a new version or new report event.

## 5.4 Evidence management

-   Accept common image formats such as JPG, JPEG, and PNG.
-   Optionally accept PDF documents.
-   Enforce a file-size limit, such as 5 MB per file, for the prototype.
-   Validate file type on the server; do not rely only on the filename
    or browser.
-   Calculate SHA-256 for each file.
-   Store the file off-chain (local upload directory for local demo, or
    IPFS as a later option).
-   Store the file reference and SHA-256 hash in the application
    database.
-   Store the evidence hash or a hash of the evidence manifest on-chain
    when the claim is approved.
-   Do not upload private or sensitive personal information to public
    IPFS or a public blockchain.

**Hash limitation:** A matching SHA-256 hash indicates that the checked
file has the same bytes as the file originally hashed. It does not prove
who took the photograph, when it was taken, or whether the scene itself
is truthful.

## 5.5 Verification workflow

-   A verifier sees all pending reports.
-   The verifier can open the report and inspect evidence.
-   The verifier chooses Approve or Reject.
-   A rejection must include a reason.
-   The backend checks the verifier's role.
-   The smart contract checks that the caller has verifier permission.
-   The decision is written to the blockchain.
-   The database is updated after the transaction succeeds.
-   The user interface shows transaction status and transaction hash.

Do not show `APPROVED` as final until the blockchain transaction is
confirmed by the local network. If the transaction fails, show an error
or pending/retry state.

## 5.6 Public transparency dashboard

Show: - Total campaigns - Total submitted reports - Approved reports -
Pending reports - Rejected reports - Total approved quantity, grouped by
unit or category (do not add unlike units together) - Recent verified
campaigns - Search and category filters - Campaign details -
Verification timestamp - Verifier address or public verifier
identifier - Transaction hash and contract address - Evidence hash or
evidence manifest hash

The dashboard must distinguish **reported impact** from **approved
impact**. Do not include pending or rejected quantities in the approved
total.

## 5.7 Duplicate-claim checks

For the prototype, implement a basic warning using: - Same campaign -
Same organization - Same activity date - Same impact category - Same
evidence hash

A duplicate warning should prompt review rather than automatically
accuse a user of fraud. Two legitimate reports can share some
attributes.

------------------------------------------------------------------------

# 6. Recommended Technology Stack

Use a local development setup to avoid real transaction costs.

  -----------------------------------------------------------------------
  Layer                   Recommended technology  Purpose
  ----------------------- ----------------------- -----------------------
  Frontend                React + Vite            User interface

  Styling                 Tailwind CSS or simple  Responsive design
                          CSS                     

  Backend                 Node.js + Express       API and business logic

  Database                MongoDB                 Users, campaigns,
                                                  report metadata

  Blockchain              Local Hardhat Network   Local EVM blockchain

  Smart contracts         Solidity                On-chain permissions
                                                  and verification
                                                  records

  Contract tools          Hardhat                 Compile, deploy, test
                                                  contracts

  Blockchain connection   Ethers.js               Frontend/backend
                                                  contract interaction

  File hashing            Node.js `crypto`        SHA-256 evidence
                                                  fingerprints

  Evidence storage        Local uploads initially Store demo files
                                                  off-chain

  Later storage option    IPFS                    Content-addressed
                                                  evidence storage

  Version control         Git                     Track project changes
  -----------------------------------------------------------------------

**Keep the first version simple:** React + Express + MongoDB +
Solidity + Hardhat + local evidence storage. Add IPFS only after the
complete end-to-end workflow works.

------------------------------------------------------------------------

# 7. System Architecture

``` text
                    PUBLIC VISITOR
                          |
                          v
ORGANIZATION ------> REACT FRONTEND <------ VERIFIER
                          |
                          v
                   EXPRESS BACKEND
                    /           \
                   /             \
                  v               v
           MONGODB DATABASE   EVIDENCE STORAGE
           - Users            - Uploaded files
           - Campaigns        - File references
           - Reports          - SHA-256 hashes
           - Audit metadata
                  |
                  v
             ETHERS.JS
                  |
                  v
          SOLIDITY SMART CONTRACT
          - Campaign/report reference
          - Evidence hash
          - Verification status
          - Verifier identity
          - Timestamp
                  |
                  v
          LOCAL HARDHAT BLOCKCHAIN
                  |
                  v
          TRANSACTION HASH / EVENT
                  |
                  v
          PUBLIC IMPACT DASHBOARD
```

## 7.1 On-chain versus off-chain data

**Store on-chain:** - Unique report reference (non-sensitive ID or
hash) - Evidence manifest hash - Approval/rejection status - Verifier
wallet address - Verification timestamp - Relevant event logs

**Store off-chain:** - User profiles - Password hashes - Campaign
descriptions - Full report text - Uploaded photographs and PDFs -
Private organization information - Verifier comments that should not be
public

Reason: Blockchain data is difficult to remove and may be publicly
visible. Store only the minimum information needed to prove the record's
integrity and verification history.

------------------------------------------------------------------------

# 8. End-to-End Workflow

## 8.1 Organization workflow

1.  Organization registers.
2.  Organization signs in.
3.  Organization opens its dashboard.
4.  Organization creates a campaign.
5.  Organization fills in campaign details.
6.  Organization saves the campaign.
7.  Organization opens the campaign and selects Submit Impact.
8.  Organization enters the reported quantity, unit, activity date, and
    explanation.
9.  Organization uploads evidence.
10. Backend validates the files and calculates SHA-256 hashes.
11. Backend saves report metadata and evidence references.
12. Report status becomes `PENDING`.
13. The verifier dashboard displays the report.

## 8.2 Verifier workflow

1.  Verifier signs in.
2.  Backend confirms the verifier role.
3.  Verifier opens the pending report.
4.  Verifier checks the report fields and evidence.
5.  Verifier selects Approve or Reject.
6.  For rejection, verifier enters a reason.
7.  Backend calls the smart contract.
8.  Smart contract checks verifier permission.
9.  Smart contract records the decision and emits an event.
10. Backend waits for transaction confirmation.
11. Backend updates the database.
12. The report status and transaction hash appear in the application.

## 8.3 Public workflow

1.  Visitor opens the home page.
2.  Visitor views the public impact statistics.
3.  Visitor searches or filters campaigns.
4.  Visitor opens a campaign.
5.  Visitor sees submitted reports and their statuses.
6.  For an approved report, visitor sees verification details and
    blockchain transaction information.
7.  Visitor can inspect the transaction on the local block explorer if
    one is configured, or see the transaction hash in the application.

------------------------------------------------------------------------

# 9. Data Model

The following is a practical starting schema. Adjust fields as
implementation develops.

## 9.1 User

``` json
{
  "_id": "database-id",
  "name": "Demo Organization",
  "email": "organization@example.com",
  "passwordHash": "server-generated-password-hash",
  "role": "organization",
  "organizationName": "Green Future Group",
  "createdAt": "ISO-8601 timestamp",
  "isActive": true
}
```

Allowed roles: `organization`, `verifier`, `admin`.

Never store a plaintext password.

## 9.2 Campaign

``` json
{
  "_id": "campaign-id",
  "title": "Green Campus Drive",
  "description": "A demonstration tree-plantation campaign.",
  "category": "Environment",
  "organizationId": "user-id",
  "organizationName": "Green Future Group",
  "locationLabel": "Campus demonstration area",
  "startDate": "2026-11-01",
  "endDate": "2026-11-10",
  "targetQuantity": 150,
  "unit": "saplings",
  "status": "ACTIVE",
  "createdAt": "ISO-8601 timestamp"
}
```

## 9.3 Impact report

``` json
{
  "_id": "report-id",
  "campaignId": "campaign-id",
  "organizationId": "user-id",
  "impactStatement": "100 saplings planted during the activity.",
  "quantity": 100,
  "unit": "saplings",
  "activityDate": "2026-11-03",
  "methodology": "Count recorded by the campaign team.",
  "evidence": [
    {
      "fileName": "plantation-demo.jpg",
      "storageReference": "uploads/generated-file-name",
      "sha256": "server-calculated-sha256"
    }
  ],
  "status": "PENDING",
  "submittedAt": "ISO-8601 timestamp",
  "reviewReason": null,
  "blockchain": {
    "transactionHash": null,
    "contractAddress": null,
    "onChainReportId": null,
    "evidenceManifestHash": null,
    "verifiedAt": null,
    "verifierAddress": null
  }
}
```

## 9.4 Audit event

Record important off-chain application actions for debugging and
accountability.

``` json
{
  "_id": "audit-id",
  "actorUserId": "user-id",
  "action": "IMPACT_SUBMITTED",
  "targetType": "ImpactReport",
  "targetId": "report-id",
  "createdAt": "ISO-8601 timestamp",
  "metadata": {
    "status": "PENDING"
  }
}
```

Do not put passwords, authentication tokens, or sensitive information in
audit metadata.

------------------------------------------------------------------------

# 10. Smart Contract Design

Suggested contract name: `ProofOfImpact.sol`.

The smart contract should: - Assign an administrator at deployment. -
Allow the administrator to authorize verifier wallet addresses. - Allow
a permitted organization wallet or trusted backend signer to register a
report reference, depending on the selected account model. - Allow only
authorized verifiers to approve or reject a report. - Prevent a report
from being verified more than once. - Store the evidence manifest
hash. - Store the verifier address and timestamp. - Emit events for
public inspection. - Reject empty report IDs or empty evidence hashes. -
Avoid storing personal data or full evidence files.

## 10.1 Suggested data structure

``` solidity
enum Status {
    None,
    Pending,
    Approved,
    Rejected
}

struct ImpactRecord {
    bytes32 reportIdHash;
    bytes32 evidenceManifestHash;
    Status status;
    address submittedBy;
    address verifiedBy;
    uint256 submittedAt;
    uint256 verifiedAt;
    string rejectionReason;
}
```

For a public-chain production system, reconsider whether rejection
reasons or any strings should be stored on-chain. For the local demo,
keep reasons short and non-sensitive or store them off-chain.

## 10.2 Suggested functions

``` solidity
function setVerifier(address verifier, bool allowed) external;

function submitImpact(
    bytes32 reportIdHash,
    bytes32 evidenceManifestHash
) external;

function verifyImpact(
    bytes32 reportIdHash,
    bool approve,
    string calldata reason
) external;

function getImpact(
    bytes32 reportIdHash
) external view returns (...);
```

Suggested events: - `VerifierUpdated` - `ImpactSubmitted` -
`ImpactReviewed`

**Important design choice:** A blockchain contract cannot know whether
an uploaded photograph is truthful. It can record which authorized
account approved a particular report and which evidence hash was
reviewed.

## 10.3 Account model for the prototype

Choose one implementation and keep it consistent:

**Simpler student-demo option:** Use a dedicated local backend signer
for organization submissions and verifier actions, with role checks
enforced by the backend and verifier permissions enforced by the
contract. Explain that this is a controlled prototype architecture, not
a fully decentralized identity system.

**Wallet-based option:** Connect MetaMask for organization and verifier
accounts. The contract checks wallet permissions directly. This is
closer to a user-controlled blockchain workflow but requires wallet
setup and transaction handling.

Do not silently mix these approaches. Document which one the project
actually implements.

------------------------------------------------------------------------

# 11. Evidence Hashing

Use SHA-256 to fingerprint uploaded files.

Conceptual process:

1.  Receive an uploaded file.
2.  Validate its MIME type and file size on the server.
3.  Read the file bytes.
4.  Calculate SHA-256.
5.  Store the file off-chain.
6.  Save the hash with the report.
7.  Build a deterministic evidence manifest from the sorted file hashes
    and report reference.
8.  Hash the manifest.
9.  Record the manifest hash on-chain when the verifier makes a
    decision.

Example Node.js logic:

``` javascript
import crypto from "crypto";
import fs from "fs";

function calculateSha256(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto
    .createHash("sha256")
    .update(fileBuffer)
    .digest("hex");
}
```

For large files, use a streaming hash rather than reading the entire
file into memory.

**Manifest consistency:** Use a deterministic format. For example, sort
evidence hashes alphabetically and join them with a documented separator
before hashing. Do not depend on object-property order or arbitrary
upload order.

------------------------------------------------------------------------

# 12. Backend API Plan

Suggested REST API routes:

  --------------------------------------------------------------------------------------
  Method            Endpoint                       Access              Purpose
  ----------------- ------------------------------ ------------------- -----------------
  POST              `/api/auth/register`           Public              Register an
                                                                       organization

  POST              `/api/auth/login`              Public              Sign in

  GET               `/api/auth/me`                 Signed-in           Get current user

  POST              `/api/campaigns`               Organization        Create campaign

  GET               `/api/campaigns`               Public              List public
                                                                       campaigns

  GET               `/api/campaigns/:id`           Public              Get campaign
                                                                       details

  PATCH             `/api/campaigns/:id`           Owner               Edit an eligible
                                                                       draft

  POST              `/api/campaigns/:id/reports`   Organization owner  Submit impact
                                                                       report

  GET               `/api/reports/mine`            Organization        List own reports

  GET               `/api/verifier/pending`        Verifier            List pending
                                                                       reports

  GET               `/api/reports/:id`             Authorized/public   Get report
                                                   as appropriate      details

  POST              `/api/reports/:id/approve`     Verifier            Approve report

  POST              `/api/reports/:id/reject`      Verifier            Reject report

  GET               `/api/dashboard/stats`         Public              Get public
                                                                       statistics

  GET               `/api/reports/:id/verify`      Public              Get public
                                                                       verification data
  --------------------------------------------------------------------------------------

API implementation requirements: - Validate all request bodies. - Use
authentication middleware for protected routes. - Use role middleware
for role-restricted routes. - Check campaign ownership before editing or
submitting. - Check report status before reviewing. - Handle blockchain
transaction failures. - Return useful error messages without leaking
stack traces. - Add pagination to list endpoints if needed. - Rate-limit
authentication and upload endpoints. - Configure CORS for the actual
frontend origin.

------------------------------------------------------------------------

# 13. Frontend Pages and UI Requirements

Use a clean, modern, professional design. Recommended visual
direction: - White or very light background. - Deep green as the primary
accent, with restrained blue/neutral tones. - Clear cards, simple
charts, readable typography. - Consistent spacing and navigation. -
Responsive layout for laptop and mobile screens. - Accessible contrast
and clear form labels. - Avoid clutter and excessive animation.

## 13.1 Home page

Include: - Project name and tagline. - Short explanation. - "Explore
Impact" button. - "Organization Login" button. - Public statistics. -
Recent verified campaigns. - How it works: Submit → Verify → Record →
View.

## 13.2 Login and registration

Include: - Name - Email - Password - Organization name (for organization
registration) - Login and register validation - Helpful error messages

For the prototype, verifier and admin accounts should be created through
a seed script or admin process, not by allowing anyone to select those
roles in public registration.

## 13.3 Organization dashboard

Include: - Welcome section. - Create Campaign button. - Campaign
count. - Pending report count. - Approved report count. - Campaign
list. - Report status labels. - Links to campaign and report details.

## 13.4 Create campaign page

Fields: - Campaign title - Description - Category - Location label -
Start date - End date - Optional target quantity - Unit - Optional cover
image

Buttons: - Save Draft - Publish Campaign

## 13.5 Submit impact page

Fields: - Campaign selector - Impact statement - Quantity - Unit -
Activity date - Methodology / counting explanation - Evidence upload -
Submit for Verification

Show accepted file types and file-size limit before upload.

## 13.6 Verifier dashboard

Include: - Pending reports table or cards. - Campaign title. -
Organization. - Reported quantity and unit. - Submission date. - Open
Review button. - Filters by category and date.

## 13.7 Review details page

Include: - Campaign information. - Impact statement. - Quantity and
unit. - Activity date. - Methodology. - Evidence preview/download. -
Evidence SHA-256 fingerprint. - Approve button. - Reject button. -
Required rejection reason. - Confirmation before submitting decision.

## 13.8 Public impact dashboard

Include: - Total campaigns. - Approved reports. - Pending reports
(clearly labelled as not yet approved). - Approved impact totals grouped
by category and unit. - Search bar. - Category filter. - Recent verified
activities. - Campaign details and transaction information.

## 13.9 Campaign detail page

Include: - Campaign title and description. - Organization name. -
Category and location label. - Campaign dates. - Reports and their
statuses. - Approved quantities. - Verification date. - Evidence
manifest hash. - Transaction hash. - Contract address. - Network label,
such as "Local Hardhat Network --- Demo".

------------------------------------------------------------------------

# 14. Suggested Folder Structure

``` text
proof-of-impact/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── StatCard.jsx
│   │   │   ├── CampaignCard.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── OrganizationDashboard.jsx
│   │   │   ├── CreateCampaign.jsx
│   │   │   ├── SubmitImpact.jsx
│   │   │   ├── VerifierDashboard.jsx
│   │   │   ├── ReviewReport.jsx
│   │   │   ├── PublicDashboard.jsx
│   │   │   └── CampaignDetails.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── contract.js
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── blockchain.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── roles.js
│   │   │   └── errorHandler.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Campaign.js
│   │   │   ├── ImpactReport.js
│   │   │   └── AuditEvent.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── campaignRoutes.js
│   │   │   ├── reportRoutes.js
│   │   │   └── dashboardRoutes.js
│   │   ├── controllers/
│   │   ├── services/
│   │   │   ├── evidenceService.js
│   │   │   └── blockchainService.js
│   │   ├── uploads/
│   │   ├── app.js
│   │   └── server.js
│   └── package.json
│
├── blockchain/
│   ├── contracts/
│   │   └── ProofOfImpact.sol
│   ├── scripts/
│   │   └── deploy.js
│   ├── test/
│   │   └── ProofOfImpact.test.js
│   ├── hardhat.config.js
│   └── package.json
│
├── docs/
│   ├── ARCHITECTURE.md
│   └── TESTING.md
│
├── .env.example
├── .gitignore
└── README.md
```

This is a target structure, not a requirement to generate every file
before the first working milestone. Build in small steps.

------------------------------------------------------------------------

# 15. Environment Variables

Create `.env.example` files with placeholders. Never commit real
secrets.

Example backend environment:

``` env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/proof_of_impact
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_ORIGIN=http://localhost:5173

BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=replace_after_deployment
BACKEND_SIGNER_PRIVATE_KEY=local_demo_key_only
```

Security rules: - Use only Hardhat-generated local test accounts for the
local prototype. - Never use a real wallet's private key. - Never commit
`.env`. - Never expose a private key through React/Vite environment
variables. - Keep secrets on the backend. - Use a strong random JWT
secret. - Do not deploy with demo keys or demo credentials.

------------------------------------------------------------------------

# 16. Step-by-Step Build Plan in Anti-Gravity

**Build one milestone at a time. Do not ask the coding assistant to
generate the entire application in one enormous step.** After each
milestone, run the application, inspect the files, and fix errors before
moving forward.

## Milestone 0 --- Project setup and planning

1.  Open Anti-Gravity.
2.  Create a new workspace named `proof-of-impact`.
3.  Place this specification file in the project root as
    `PROJECT_SPEC.md`.
4.  Ask Anti-Gravity to read the entire specification before coding.
5.  Ask it to summarize the architecture and propose a milestone plan.
6.  Confirm that it will use the selected stack and will not silently
    replace blockchain with a normal database.

**Prompt for Anti-Gravity:**

> Read PROJECT_SPEC.md completely. This is the source of truth for my
> Proof of Impact project. Do not start generating the whole application
> yet. First summarize the requirements, architecture, user roles, data
> flow, smart-contract responsibilities, and proposed folder structure.
> Identify dependencies and implementation risks. Then propose a
> milestone-by-milestone build plan. The prototype must use a real
> Solidity smart contract on a local Hardhat blockchain. Do not fake
> blockchain functionality or use a database as a substitute for the
> smart contract.

## Milestone 1 --- Scaffold the application

Ask Anti-Gravity:

> Create the initial monorepo folder structure from PROJECT_SPEC.md with
> separate client, server, and blockchain folders. Set up React with
> Vite for the frontend, Node.js with Express for the backend, and
> Hardhat for the blockchain project. Add basic scripts, .gitignore, and
> .env.example. Do not implement all features yet. Ensure each part can
> be started independently and document the commands.

Acceptance checks: - Frontend starts successfully. - Backend starts
successfully. - Hardhat compiles a minimal sample contract. - No secrets
are committed.

## Milestone 2 --- Build the user interface with sample data

Ask:

> Build the responsive React UI for the Home, Login, Register,
> Organization Dashboard, Create Campaign, Submit Impact, Verifier
> Dashboard, Review Report, Public Dashboard, and Campaign Details
> pages. Follow the design requirements in PROJECT_SPEC.md. Use clearly
> labelled sample data temporarily. Create reusable components and
> working navigation. Clearly mark sample data as demo data. Do not
> claim that sample records are on-chain.

Acceptance checks: - All pages load. - Navigation works. - Layout is
responsive. - Status labels are consistent. - Forms show validation
messages.

## Milestone 3 --- Backend, database, and authentication

Ask:

> Implement the Express backend and MongoDB models for User, Campaign,
> ImpactReport, and AuditEvent based on PROJECT_SPEC.md. Add
> registration, login, secure password hashing, authentication
> middleware, and role-based authorization. Public registration must not
> allow a user to choose verifier or admin. Add validation and safe
> error handling. Provide a seed script for demo verifier and admin
> accounts, and document how to run it.

Acceptance checks: - Organization registration and login work. -
Passwords are hashed. - Protected endpoints reject unauthenticated
requests. - Organization endpoints enforce ownership. - Verifier routes
reject organization accounts. - Admin and verifier accounts are created
only through the seed/admin process.

## Milestone 4 --- Campaign management

Ask:

> Implement campaign creation, listing, viewing, and editing of eligible
> drafts. An organization can manage only its own campaigns. Public
> users can view published campaigns. Validate required fields, dates,
> categories, and quantities. Connect the frontend forms to the backend
> APIs.

Acceptance checks: - Organization can create a campaign. - Campaign is
saved in MongoDB. - Public campaign list displays published campaigns. -
One organization cannot edit another organization's campaign.

## Milestone 5 --- Impact report and evidence upload

Ask:

> Implement impact report submission and evidence upload. Validate file
> type and size on the server. Store files off-chain in the local
> uploads directory for the first version. Calculate SHA-256 for every
> file on the server using Node.js crypto. Store file references and
> hashes in MongoDB. Create a deterministic evidence manifest hash. Set
> new reports to PENDING. Add a basic duplicate-claim warning using the
> matching rules in PROJECT_SPEC.md. Never trust a hash supplied by the
> browser.

Acceptance checks: - Organization submits a report. - Evidence is stored
off-chain. - SHA-256 is calculated on the server. - Report appears as
PENDING. - Invalid file types and oversized files are rejected. -
Duplicate warning works without automatically rejecting legitimate
reports.

## Milestone 6 --- Smart contract

Ask:

> Implement ProofOfImpact.sol using Solidity. Include
> administrator-controlled verifier authorization, report
> submission/registration, verifier-only approval and rejection,
> protection against duplicate review, report retrieval, and events. Use
> hashes and non-sensitive identifiers only. Add comprehensive Hardhat
> tests for authorized and unauthorized callers, invalid inputs,
> duplicate review, and emitted events. Explain the contract functions
> before integrating them.

Acceptance checks: - Contract compiles. - Tests pass. - Unauthorized
accounts cannot verify. - A report cannot be reviewed twice. - Events
are emitted correctly.

## Milestone 7 --- Deploy local contract and connect the backend

Ask:

> Add a Hardhat local deployment script. Deploy ProofOfImpact.sol to the
> local Hardhat network. Save the contract address and ABI in a
> documented way. Implement a backend blockchain service using Ethers.js
> that connects to the local RPC and calls the contract. Keep the local
> demo signer private key only on the backend in an ignored .env file.
> Do not expose it to the frontend. Add clear transaction error
> handling.

Acceptance checks: - Local Hardhat node starts. - Contract deploys. -
Backend connects to the deployed address. - Backend can read contract
data. - Backend can submit a transaction and receive a transaction hash.

## Milestone 8 --- Complete verifier workflow

Ask:

> Connect the verifier dashboard to pending reports. Implement review
> details, evidence inspection, approve, and reject with a required
> rejection reason. The backend must enforce verifier role and the smart
> contract must enforce verifier permission. Wait for transaction
> confirmation before marking the report as finally approved or rejected
> in MongoDB. Save transaction hash, contract address, on-chain report
> reference, verifier address, and timestamp. Handle failed transactions
> without falsely updating the report status.

Acceptance checks: - Verifier sees pending reports. - Organization
cannot approve a report. - Approval creates a blockchain transaction. -
Rejection creates a blockchain transaction. - Transaction hash appears
in the UI. - Database status changes only after transaction
confirmation.

## Milestone 9 --- Public dashboard and transparency

Ask:

> Connect the public dashboard to real backend and blockchain data.
> Display campaign counts and report counts accurately. Calculate
> approved impact totals separately by category and unit. Show pending
> and rejected claims separately. Display on-chain verification details
> and transaction hashes for reviewed reports. Clearly label the network
> as a local demo network. Do not use hardcoded statistics after API
> integration.

Acceptance checks: - Public dashboard reads actual application data. -
Approved totals exclude pending and rejected reports. - Different units
are never incorrectly added together. - Transaction details match the
contract. - Search and filters work.

## Milestone 10 --- End-to-end testing and polish

Ask:

> Review the complete project against PROJECT_SPEC.md. Run frontend
> checks, backend checks, smart-contract tests, and an end-to-end
> workflow. Fix errors, missing authorization checks, inconsistent
> statuses, and broken navigation. Add loading, empty, success, and
> error states. Create a final README with setup, environment variables,
> deployment, demo accounts, test commands, architecture, and
> limitations. Do not claim any feature is complete unless it has been
> tested.

Acceptance checks: - Complete demo workflow succeeds. - Unauthorized
actions fail. - Evidence hash is reproducible. - Blockchain transaction
is confirmed. - Public dashboard displays the verified record. - Setup
instructions work from a clean start.

------------------------------------------------------------------------

# 17. Testing Plan

## 17.1 Functional tests

  -----------------------------------------------------------------------
  Test                    Action                  Expected result
  ----------------------- ----------------------- -----------------------
  Organization            Register organization   Account created
  registration                                    

  Login                   Sign in with valid      Dashboard opens
                          details                 

  Invalid login           Wrong password          Safe error displayed

  Campaign creation       Submit valid campaign   Campaign saved

  Campaign validation     Leave required title    Validation error
                          empty                   

  Report submission       Submit valid impact     Report becomes PENDING
                          report                  

  Evidence upload         Upload supported image  File saved and hashed

  Invalid upload          Upload unsupported file Rejected

  Verifier access         Sign in as verifier     Verifier dashboard
                                                  opens

  Organization approval   Try verifier API as     403 Forbidden
  attempt                 organization            

  Approve report          Verifier approves       On-chain approval
                          pending report          recorded

  Reject report           Verifier rejects with   On-chain rejection
                          reason                  recorded

  Duplicate review        Review same report      Rejected
                          again                   

  Public view             Open approved report    Verification details
                                                  displayed

  Evidence integrity      Compare file hash       Matching original file
                                                  produces same hash
  -----------------------------------------------------------------------

## 17.2 Smart contract tests

Test: - Deployment assigns the administrator. - Administrator can
authorize a verifier. - Non-administrator cannot authorize verifiers. -
Valid report submission succeeds. - Empty report reference is
rejected. - Empty evidence hash is rejected. - Unauthorized verifier
cannot approve. - Authorized verifier can approve. - Authorized verifier
can reject. - A reviewed report cannot be reviewed again. - Correct
events are emitted. - Stored verifier and timestamps are correct.

## 17.3 End-to-end demonstration test

Use this exact sample workflow:

**Campaign:** Green Campus Drive\
**Category:** Environment\
**Organization:** Green Future Group (demo account)\
**Reported result:** 100 saplings planted\
**Unit:** saplings\
**Evidence:** clearly labelled demo photograph(s)\
**Verifier:** seeded demo verifier account

Steps: 1. Log in as the demo organization. 2. Create the campaign. 3.
Submit an impact report for 100 saplings. 4. Upload demo evidence. 5.
Show the report as PENDING. 6. Log out. 7. Log in as the demo verifier.
8. Open the pending report. 9. Inspect the evidence and hash. 10.
Approve the report. 11. Show the blockchain transaction hash. 12. Open
the public dashboard. 13. Show the campaign as verified. 14. Open the
report and show its evidence manifest hash and transaction details.

Also demonstrate one rejected report so the audience can see both
outcomes.

------------------------------------------------------------------------

# 18. Security, Privacy, and Reliability Requirements

-   Hash passwords with a suitable password-hashing library such as
    bcrypt or Argon2.
-   Use HTTPS for any non-local deployment.
-   Keep secrets and private keys on the server.
-   Never put private keys in frontend code.
-   Validate and sanitize user input.
-   Validate file MIME type, extension, and size on the server.
-   Generate safe server-side filenames; do not trust uploaded
    filenames.
-   Restrict upload access where appropriate.
-   Use role-based access control on every protected API.
-   Verify ownership before allowing campaign edits.
-   Do not let organizations approve their own reports.
-   Do not allow a report to be reviewed twice.
-   Use transaction confirmation before updating final verification
    status.
-   Handle transaction failure and database failure carefully.
-   Avoid storing personal data, passwords, private evidence, or
    sensitive details on-chain.
-   Do not treat a file hash as proof that the image is authentic.
-   Use demo accounts and local test wallets only.
-   Keep `.env`, uploaded private files, and generated secrets out of
    Git.
-   Add rate limits to login and upload routes.
-   Back up local demo data if it is needed for a presentation.

**Consistency note:** Blockchain and MongoDB are separate systems. A
transaction can succeed while a database update fails. The backend
should save the transaction hash and provide a reconciliation/retry
mechanism so the application can recover without submitting a second
conflicting verification.

------------------------------------------------------------------------

# 19. Suggested Development Schedule

A practical short-project order:

  Phase   Work                     Completion condition
  ------- ------------------------ -----------------------------------
  1       Setup and architecture   All three project parts start
  2       Frontend pages           Navigation and forms work
  3       Backend and database     Authentication and APIs work
  4       Campaigns and reports    Organization flow works
  5       Evidence hashing         Files and hashes are saved
  6       Smart contract           Contract tests pass
  7       Blockchain integration   Local transactions work
  8       Verifier workflow        Approval/rejection works on-chain
  9       Public dashboard         Verified records are visible
  10      Final testing            Complete demo works reliably

Prioritize the core workflow over optional features. If time is limited,
defer IPFS, AI, QR codes, GPS, charts, and mobile support.

------------------------------------------------------------------------

# 20. Presentation and Viva Preparation

## 20.1 Short project explanation

"Proof of Impact is a blockchain-based platform that helps organizations
prove and track their social and environmental activities. Organizations
create campaigns and submit impact reports with supporting evidence.
Authorized verifiers inspect the evidence and approve or reject the
claims. The verification result and evidence fingerprint are recorded on
a blockchain, making the record tamper-evident and publicly traceable."

## 20.2 What problem does it solve?

It improves transparency and accountability by giving the public a way
to inspect impact reports and their verification history instead of
relying only on an organization's own claims.

## 20.3 Why blockchain?

A blockchain provides a shared, tamper-evident record of verification
events. Once a transaction is confirmed, changing the historical record
is difficult. This makes it useful for auditability and transparency.

## 20.4 Why smart contracts?

Smart contracts enforce rules such as who can verify a report, whether a
report has already been reviewed, and what status was recorded.

## 20.5 What is the role of SHA-256?

SHA-256 creates a fixed-length fingerprint of an evidence file. If the
file changes, its hash will almost certainly change. This helps detect
file modification but does not prove the original file is truthful.

## 20.6 Why use MongoDB if blockchain is used?

MongoDB stores application data such as user profiles, campaign
descriptions, and file references. The blockchain stores the important
verification record and evidence fingerprint. This hybrid approach
avoids putting large or private data on-chain.

## 20.7 Does blockchain prove that 100 trees were planted?

No. Blockchain proves that a particular verification record was written
and has not been silently changed. The verifier and evidence process are
responsible for assessing whether the activity claim is credible.

## 20.8 What is the project's novelty or contribution?

The prototype combines campaign management, evidence fingerprinting,
role-based human verification, on-chain verification history, and a
public impact dashboard in one workflow. Describe this as the project's
implementation contribution; do not claim that the concept is globally
unprecedented without a literature review.

## 20.9 What are the limitations?

-   Verification depends on the quality of submitted evidence and the
    verifier.
-   A photograph can be misleading or reused.
-   A local blockchain is a demonstration environment, not a public
    production network.
-   The prototype does not independently measure real-world impact.
-   The initial duplicate detection is rule-based and cannot identify
    every duplicate.
-   A public blockchain can expose any data written to it, so sensitive
    information must remain off-chain.

------------------------------------------------------------------------

# 21. Future Enhancements

After the core prototype works, possible enhancements include: 1. IPFS
evidence storage. 2. QR code for each verified campaign. 3. Independent
multi-verifier approval. 4. AI-assisted evidence triage (human verifier
remains responsible). 5. GPS metadata checks, with clear privacy
safeguards. 6. Public blockchain deployment on a testnet. 7.
Mobile-friendly progressive web app. 8. Organization reputation based on
transparent history. 9. Downloadable verification certificates. 10.
Integration with established NGO or campus systems.

These are future enhancements, not required features for the first
working prototype.

------------------------------------------------------------------------

# 22. Definition of Done

The first version is complete only when all of the following are true:

-   [ ] Organization can register and log in.
-   [ ] Verifier and admin accounts are created securely.
-   [ ] Organization can create a campaign.
-   [ ] Organization can submit an impact report.
-   [ ] Evidence files are uploaded off-chain.
-   [ ] Evidence hashes are calculated on the server.
-   [ ] Report enters PENDING status.
-   [ ] Verifier can inspect the report.
-   [ ] Unauthorized users cannot approve or reject.
-   [ ] Verifier can approve a report.
-   [ ] Verifier can reject a report with a reason.
-   [ ] Smart contract records the decision.
-   [ ] Transaction confirmation is handled correctly.
-   [ ] Transaction hash is stored and displayed.
-   [ ] Public visitor can inspect the verified record.
-   [ ] Dashboard statistics distinguish approved, pending, and rejected
    claims.
-   [ ] Smart contract tests pass.
-   [ ] End-to-end demo works from a clean start.
-   [ ] README explains setup and limitations.
-   [ ] Demo data is clearly labelled as demonstration data.

------------------------------------------------------------------------

# 23. Final Master Prompt for Anti-Gravity

Use this prompt after placing this document in the project root:

> You are the senior full-stack and blockchain developer helping me
> build my student project, **Proof of Impact**. Read `PROJECT_SPEC.md`
> completely and follow it as the source of truth.
>
> Build a working, end-to-end prototype using React + Vite, Node.js +
> Express, MongoDB, Solidity, Hardhat, and Ethers.js. Use a local
> Hardhat blockchain for the demonstration. The system must support
> organization registration, campaign creation, impact report
> submission, evidence upload, server-side SHA-256 hashing, verifier
> review, smart-contract approval/rejection, transaction tracking, and a
> public impact dashboard.
>
> Work in small milestones. Before each milestone, explain which files
> you will create or change. After each milestone, run relevant checks
> and tests, fix errors, and report exactly what works and what remains.
> Do not skip tests.
>
> Important requirements: - Do not fake blockchain operations. - Do not
> store private keys in frontend code. - Do not allow users to choose
> verifier/admin roles during public registration. - Enforce
> authorization in both backend logic and the smart contract where
> applicable. - Store full evidence files off-chain and only
> hashes/references on-chain. - Do not claim a file hash proves that an
> activity actually happened. - Do not mark a report approved until its
> blockchain transaction is confirmed. - Do not add unrelated features
> before the core workflow works. - Use clearly labelled demo data. -
> Keep the UI clean, modern, responsive, and suitable for a college
> project presentation.
>
> Start with Milestone 0: inspect the specification, summarize the
> architecture, identify risks, and propose the build sequence. Do not
> generate the entire application in one step.

------------------------------------------------------------------------

# 24. Final Project Summary

**Project:** Proof of Impact\
**Domain:** Blockchain / Social Impact / Transparency\
**Core idea:** Evidence-backed impact claims with human verification and
blockchain records.\
**Primary users:** Organizations, verifiers, administrators, and the
public.\
**Main technologies:** React, Node.js, Express, MongoDB, Solidity,
Hardhat, Ethers.js, SHA-256.\
**Core workflow:** Create campaign → Submit impact → Upload evidence →
Calculate hash → Verify claim → Record decision on blockchain → Display
public record.\
**Expected result:** A functioning web prototype that demonstrates how
blockchain can improve the transparency and traceability of social and
environmental impact reports.

**Tagline: DON'T JUST CLAIM IMPACT. PROVE IT.**
