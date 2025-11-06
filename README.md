# APEC-Credify

**A Solana Colosseum Hackathon MVP** - On-chain credential management system for APEC University using Compressed NFTs (cNFTs).

## Overview

APEC-Credify is a complete solution for issuing, managing, and verifying academic credentials on Solana blockchain. It uses Compressed NFTs (cNFTs) to provide cost-effective credential issuance for thousands of students while maintaining blockchain security and immutability.

### Key Features

- **Batch Certificate Issuance**: Admin dashboard for issuing certificates to multiple students via CSV upload
- **Skills Passport**: Student PWA to view and manage all on-chain credentials
- **Instant Verification**: Public verification page for employers to verify credentials instantly
- **Cost-Effective**: Uses Solana State Compression to reduce minting costs by >10,000x
- **Web3 Abstraction**: Embedded wallet service for seamless student experience

## Critical SDKs and Versions

- **@solana/web3.js**: `^2.0.0` (CRITICAL: Use v2 API)
- **@coral-xyz/anchor**: `^0.32.1` (JS client), `anchor-lang = 0.32.1` (Rust)
- **@solana-program/token**: `^0.6.0` (Replaces spl-token for web3.js v2)
- **@metaplex-foundation/mpl-bubblegum**: `^5.0.2` (cNFT minting)
- **@solana/rpc-transport-http**: `^2.0.0` (Required for web3.js v2 RPC)
- **spl-account-compression**: `^0.2.0` (Rust crate)
- **mpl-bubblegum**: `^2.1.1` (Rust crate)

## Project Structure

```
e-certify/
├── credify_program/          # Anchor on-chain program (Rust)
│   ├── src/
│   │   └── lib.rs            # Main program logic
│   └── Cargo.toml
├── ts/
│   └── adminMint.ts          # Admin minting script
├── app/
│   ├── (platform)/
│   │   ├── admin/
│   │   │   └── certify/      # Admin batch mint UI
│   │   └── passport/         # Student passport view
│   ├── api/
│   │   ├── mint/             # Batch mint API
│   │   ├── das/               # DAS API proxy
│   │   ├── wallet/            # Wallet mapping service
│   │   └── cnft/              # cNFT fetch API
│   └── components/
│       ├── SkillsPassport.tsx     # Passport component
│       └── VerificationPage.tsx   # Verification component
└── package.json
```

## Prerequisites

- **Node.js**: 18+
- **Rust**: 1.90.0 (2024 edition)
- **Anchor CLI**: 0.32.0
- **Solana CLI**: ~2.3.13
- **Supabase**: For user authentication and profile management

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env.local` file in the project root:

```env
# RPC Configuration (Must support DAS API)
NEXT_PUBLIC_DAS_URL=https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY
RPC_URL=https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY
HELIUS_API_KEY_URL=https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY

# Collection and Tree (Set after creating)
NEXT_PUBLIC_APEC_COLLECTION=YOUR_COLLECTION_MINT
COLLECTION_MINT=YOUR_COLLECTION_MINT
MERKLE_TREE=YOUR_MERKLE_TREE_ADDRESS

# Supabase (For authentication)
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY

# Admin Payer (For minting)
PAYER_SECRET_KEY=[1,2,3,...] # JSON array of secret key bytes

# Demo Mode (Optional)
NEXT_PUBLIC_DEMO_MODE=false
```

### 3. Build Anchor Program

```bash
anchor build
```

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Usage

### Admin: Batch Mint Certificates

1. Navigate to `/admin/certify`
2. Configure Collection Mint and Merkle Tree addresses
3. Upload CSV file with columns:
   - `student_email`
   - `student_name`
   - `major`
   - `issue_date`
   - `wallet` (optional, will be looked up if not provided)
4. Click "Mint Certificates"

### Student: View Skills Passport

1. Navigate to `/passport`
2. Enter wallet address or connect wallet
3. View all on-chain credentials

### Verifier: Verify Credential

1. Navigate to `/verify?assetId=ASSET_ID`
2. See verification status and credential details

## Architecture

### On-Chain Program (Anchor)

The `credify_program` serves as the authority for credential collections. It:
- Manages Merkle Tree authority
- Provides governance functions (transfer, burn)
- Note: Actual minting is done off-chain via admin script for MVP efficiency

### Admin Minting Service

The `adminMint.ts` script handles:
- Batch minting cNFTs using Bubblegum SDK
- CSV processing
- Transaction management

### Frontend Components

- **SkillsPassport**: Fetches and displays credentials using DAS API
- **VerificationPage**: Verifies credentials using Merkle proofs
- **Admin Certify Page**: UI for batch minting

## Important Notes

### Web3.js v2 Compatibility

This project uses `@solana/web3.js` v2 which has breaking changes:
- New RPC API (`createSolanaRpc`)
- Different transaction structure
- Some imports may need adjustment

If you encounter TypeScript errors with Keypair/PublicKey imports, you may need to:
- Use dynamic imports: `const { Keypair } = await import('@solana/web3.js')`
- Or install `@solana/web3.js-legacy-compat` for compatibility

### MVP Limitations

- Admin mint script uses mock transactions for MVP
- Full Bubblegum integration requires additional setup
- Wallet mapping service needs database schema update

### Production Checklist

- [ ] Implement real Bubblegum minting in `adminMint.ts`
- [ ] Add `wallet_address` column to Supabase `profiles` table
- [ ] Set up proper wallet-as-a-service (Web3Auth, Privy, etc.)
- [ ] Implement Merkle proof verification on-chain
- [ ] Add metadata storage (Arweave/IPFS)
- [ ] Set up collection NFT creation workflow
- [ ] Add proper error handling and logging
- [ ] Implement rate limiting for API routes
- [ ] Add admin authentication middleware

## Contributing

This is a hackathon MVP. For production use, please:
1. Complete the TODO items in the code
2. Add comprehensive error handling
3. Implement proper security measures
4. Add unit and integration tests

## License

MIT

## Acknowledgments

- Built for Solana Colosseum Hackathon
- Uses Metaplex Bubblegum for cNFTs
- Helius RPC for DAS API support
