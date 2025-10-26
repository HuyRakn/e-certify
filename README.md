# E-Certify: Blockchain Credential Verification Platform

E-Certify is a decentralized credential verification platform built on Solana, designed specifically for APEC University's dual-degree framework. The platform enables secure, verifiable, and cost-effective issuance and verification of academic credentials using compressed NFTs (cNFTs) and Zero-Knowledge Proofs.

## 🎯 Project Overview

E-Certify addresses the critical challenge faced by APEC Group's university transformation: proving and verifying that students have completed the "dual-degree framework" - combining business acumen with technical expertise. Traditional PDF certificates are easily forged, expensive to verify manually, and lack programmability in the digital economy.

## 🏗️ Technical Architecture

### Core Technologies

- **Blockchain**: Solana (Devnet)
- **Program Framework**: Pinocchio (no_std, zero-copy for maximum performance)
- **NFT Standard**: Metaplex Compressed NFTs (cNFTs) with State Compression
- **Frontend**: Next.js 14 with React 18 and TypeScript
- **Wallet Integration**: Solana Wallet Adapter
- **Storage**: Arweave for metadata persistence
- **RPC Provider**: Helius DAS API for cNFT indexing

### Hybrid VC-cNFT Architecture

E-Certify combines the best of both worlds:

1. **Off-chain Data (W3C VC)**: Full JSON-LD compliant Verifiable Credentials stored on Arweave
2. **On-chain Data (Solana cNFT)**: Immutable seal and pointer to off-chain data

## 🚀 Key Features

### For Administrators (APEC University)
- **Issuer Registration**: Register university as credential issuer
- **Batch Credential Creation**: Create Merkle Trees for credential batches
- **Mass Minting**: Issue thousands of credentials cost-effectively
- **Template Management**: Create reusable credential templates

### For Students
- **Mobile-First Wallet**: View and manage credentials on mobile devices
- **Credential Gallery**: Beautiful display of earned credentials
- **QR Code Generation**: Easy sharing for verification
- **Privacy Controls**: Selective disclosure with ZK-proofs (stretch goal)

### For Verifiers (Employers, Investors, Institutions)
- **Instant Verification**: QR code scan or manual asset ID entry
- **Trustless Verification**: No need to trust third parties
- **Public Portal**: No login required for verification
- **Detailed Credential Info**: Complete credential details upon verification

## 📁 Project Structure

```
e-certify/
├── program/                 # Solana program (Pinocchio)
│   ├── src/
│   │   └── lib.rs          # Main program logic
│   └── Cargo.toml          # Rust dependencies
├── frontend/               # Next.js frontend
│   ├── components/
│   │   ├── AdminDashboard.tsx
│   │   ├── StudentWallet.tsx
│   │   ├── VerifierPortal.tsx
│   │   └── WalletProvider.tsx
│   ├── pages/
│   │   └── index.tsx       # Main app page
│   ├── styles/
│   │   └── globals.css     # Tailwind CSS
│   └── package.json        # Node.js dependencies
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites

- Node.js 18+ and npm/yarn
- Rust 1.70+ and Cargo
- Solana CLI tools
- Git

### 1. Clone the Repository

```bash
git clone <repository-url>
cd e-certify
```

### 2. Setup Solana Program

```bash
cd program
cargo build-bpf
solana program deploy target/deploy/e_certify.so
```

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

### 4. Environment Configuration

Create `.env.local` in the frontend directory:

```env
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_PROGRAM_ID=ECertifyProgram111111111111111111111111111111111
NEXT_PUBLIC_HELIUS_API_KEY=your_helius_api_key
```

## 🔄 User Flows

### 1. Admin Flow (Issuer Registration & Credential Issuance)

1. **Connect Wallet**: Admin connects Solana wallet
2. **Register Issuer**: Create PDA for APEC University
3. **Create Batch**: Generate Merkle Tree for credential batch
4. **Upload CSV**: Upload student data (wallet_address, name, internal_id)
5. **Batch Mint**: Issue cNFTs to all students in batch

### 2. Student Flow (Credential Management)

1. **Connect Wallet**: Student connects their wallet
2. **View Credentials**: Display all earned cNFTs in gallery
3. **Credential Details**: View detailed credential information
4. **Generate QR**: Create shareable QR code for verification
5. **Share Link**: Copy verification link to clipboard

### 3. Verifier Flow (Credential Verification)

1. **QR Scan/Manual Entry**: Receive asset ID from student
2. **Blockchain Verification**: Verify cNFT against Merkle Tree
3. **Display Result**: Show verification status and credential details
4. **Trust Decision**: Make hiring/admission decision based on verified data

## 🔧 Technical Implementation Details

### Pinocchio Program Instructions

1. **initialize_issuer**: Register university as credential issuer
2. **issue_credential_via_cpi**: Mint cNFT via Metaplex Bubblegum CPI
3. **verify_zk_proof**: Verify Zero-Knowledge proofs (stretch goal)

### cNFT Metadata Structure

```json
{
  "name": "Module Python Programming",
  "symbol": "APEC-TECH",
  "uri": "https://arweave.net/metadata-hash",
  "attributes": [
    {"trait_type": "Student_ID_Internal", "value": "12345"},
    {"trait_type": "Credential_Type", "value": "Technical_Skill"},
    {"trait_type": "Skill_Tech", "value": "Python"},
    {"trait_type": "Issuer_Name", "value": "APEC University"},
    {"trait_type": "Valid_Until", "value": "2025-12-31"}
  ]
}
```

### Verification Process

1. **Fetch Asset**: Get cNFT metadata via Helius DAS API
2. **Get Proof**: Retrieve Merkle proof for the asset
3. **Verify Root**: Compare computed root with on-chain Merkle Tree root
4. **Display Result**: Show verification status and credential details

## 🎯 MVP Roadmap (7 Days)

### Day 1: Setup & Core
- [x] Setup Pinocchio program structure
- [x] Implement `initialize_issuer` instruction
- [x] Create React frontend with Tailwind CSS
- [x] Setup wallet integration

### Day 2: Logic Core
- [x] Write unit tests for core instructions
- [x] Research Metaplex Bubblegum CPI integration
- [x] Build Admin Dashboard UI components
- [x] Integrate Solana Wallet Adapter

### Day 3: Backend Completion
- [ ] Complete `issue_credential_via_cpi` instruction
- [ ] Generate IDL using Shank
- [ ] Deploy program to Devnet
- [ ] Build Student Wallet UI

### Day 4: Client Integration
- [ ] Generate TypeScript client using Codama
- [ ] Integrate client with Admin Dashboard
- [ ] Implement direct Bubblegum minting for batch operations
- [ ] Start Verifier Portal development

### Day 5: End-to-End Testing
- [ ] Debug Devnet issues
- [ ] Test complete flow: Admin → Student → Verifier
- [ ] Complete Verifier Portal
- [ ] Implement Merkle proof verification

### Day 6: Polish & Stretch Goals
- [ ] Implement ZK-proof verification (if time permits)
- [ ] Polish UI/UX across all components
- [ ] Record demo video
- [ ] Prepare submission materials

### Day 7: Final Submission
- [ ] Final testing and bug fixes
- [ ] Complete documentation
- [ ] Submit to hackathon platform

## 🏆 Competitive Advantages

### Technical Excellence
- **Pinocchio Framework**: Demonstrates deep Solana knowledge beyond basic Anchor usage
- **cNFT Integration**: Leverages Solana's State Compression for cost efficiency
- **Zero-Copy Patterns**: Optimizes Compute Unit usage for maximum performance

### Business Value
- **Real Customer**: APEC Group with 6,000 students provides validated market need
- **Scalable SaaS Model**: B2B solution expandable to other educational institutions
- **Cost Reduction**: 99.9% cost reduction compared to traditional NFT minting

### Ecosystem Impact
- **RWA Integration**: Brings Real-World Assets (educational credentials) to Solana
- **Mass Adoption**: Potential to onboard millions of students to Web3
- **Standard Setting**: Creates new primitive for educational identity on-chain

## 🔮 Future Vision

### Phase 1: APEC University Integration (3 months)
- Complete MVP implementation
- Integrate with 6,000 APEC students
- Establish case study and success metrics

### Phase 2: Market Expansion (12 months)
- Scale to other APEC Group entities (Mandala Hospitality)
- Target Vietnamese and Southeast Asian universities
- Develop enterprise features and compliance tools

### Phase 3: Ecosystem Development (24 months)
- Transform from application to protocol
- Create decentralized skill marketplace
- Enable on-chain talent discovery and matching

## 📞 Contact & Support

For technical questions or collaboration opportunities:

- **Project Lead**: [Your Name]
- **Email**: [your.email@domain.com]
- **GitHub**: [github.com/yourusername]
- **LinkedIn**: [linkedin.com/in/yourprofile]

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- APEC Group for providing the real-world use case
- Solana Foundation for the blockchain infrastructure
- Metaplex for the NFT standards and tooling
- Pinocchio team for the high-performance program framework
- Colosseum for organizing the hackathon opportunity

---

**Built with ❤️ for the Solana ecosystem and the future of education**