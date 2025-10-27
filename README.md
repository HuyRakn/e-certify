# E-Certify: Blockchain Credential Platform

A decentralized credential verification platform built on Solana, designed for APEC University's dual-degree program.

## Features

- **On-chain Credentials**: Issue credentials as compressed NFTs (cNFTs) on Solana
- **Batch Minting**: Upload CSV files to mint credentials for multiple students
- **Student Wallet**: Mobile-first interface for students to view and share credentials
- **Verification Portal**: Public verification system for employers and institutions
- **Arweave Storage**: Permanent metadata storage on Arweave network

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, TailwindCSS
- **Blockchain**: Solana (Devnet)
- **Storage**: Arweave via Irys
- **APIs**: Helius DAS API for cNFT data
- **Wallet**: Solana Wallet Adapter

## Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_HELIUS_API_KEY=your_helius_api_key
NEXT_PUBLIC_HELIUS_RPC_URL=https://devnet.helius-rpc.com/?api-key=your_key
NEXT_PUBLIC_PROGRAM_ID=A9wy4icR7uQnffj16zLDonoaSt4dhwaMudLo34nfccej
```

### 3. Start Development Server

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Usage

### Admin Dashboard

1. Connect your Solana wallet (Phantom recommended)
2. Register as an issuer (APEC University)
3. Create credential batches
4. Upload CSV file with student data to mint credentials

### Student Wallet

1. Connect your wallet
2. View your issued credentials
3. Generate QR codes for sharing
4. Share verification links

### Verification Portal

1. Enter asset ID or scan QR code
2. Verify credential authenticity
3. View credential details

## CSV Format

For batch credential minting, use this CSV format:

```csv
wallet_address,student_name,student_internal_id
9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM,John Doe,12345
5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1,Jane Smith,12346
```

## Architecture

### On-chain Data Flow

1. **Credential Creation**: Admin uploads CSV → Metadata uploaded to Arweave → cNFT minted on Solana
2. **Student Access**: Student connects wallet → DAS API fetches credentials → Display in wallet
3. **Verification**: Verifier enters asset ID → DAS API fetches asset + proof → Merkle verification

### Key Components

- `frontend/utils/helius-mint.ts` - Batch minting with Arweave upload
- `frontend/utils/helius.ts` - DAS API integration
- `frontend/utils/verification.ts` - Merkle proof verification
- `frontend/components/AdminDashboard.tsx` - Admin interface
- `frontend/components/StudentWallet.tsx` - Student interface
- `frontend/components/VerifierPortal.tsx` - Verification interface

## Development Notes

- Currently uses mock data for cNFT minting (Bubblegum integration pending)
- Arweave uploads use Irys network
- All mock data has been removed from components
- Real on-chain data flow implemented

## Next Steps

1. Integrate actual Bubblegum SDK for cNFT minting
2. Deploy Rust program to Devnet
3. Implement ZK-proof verification (stretch goal)
4. Add QR code scanning functionality
5. Production Arweave funding setup

## License

MIT