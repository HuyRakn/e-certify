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

### 3. Initialize Merkle Tree and Collection

**Create Merkle Tree:**
```bash
npx ts-node scripts/init-tree.ts
```
This will create a Merkle Tree with `max_depth=14` and `max_buffer_size=64`.
Copy the `MERKLE_TREE` address to your `.env.local`.

**Create Collection NFT:**
```bash
npx ts-node scripts/create-collection.ts
```
Copy the `COLLECTION_MINT` address to your `.env.local`.

### 4. Build and Deploy Anchor Program

**Build:**
```bash
anchor build
```

**Deploy to Devnet:**
```bash
anchor deploy --provider.cluster devnet
```

Hoặc sử dụng script:
```bash
# Windows
.\scripts\build-and-deploy.ps1

# Linux/Mac
./scripts/build-and-deploy.sh
```

Sau khi deploy, verify Program ID trên [Solana Explorer](https://explorer.solana.com/?cluster=devnet).

**Chạy Unit Tests:**
```bash
anchor test --provider.cluster devnet
# hoặc
npm run anchor:test
```

Xem chi tiết trong [DEPLOYMENT.md](./DEPLOYMENT.md).

### 5. Run Development Server

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

### Soulbound Logic

**CRITICAL:** All credentials are minted with `leaf_delegate` set to Program PDA.
This prevents students from transferring their credentials (Soulbound).

- When minting: `leaf_delegate` = Program PDA (derived from `[b"authority"]`)
- Transfer attempts will be rejected if `leaf_delegate` = Program PDA
- Only Program Authority (admin) can transfer Soulbound credentials

### Merkle Tree Configuration

- **Max Depth:** 14 (supports ~16,384 credentials)
- **Max Buffer Size:** 64 (optimized for hackathon)
- **Tree Authority:** Program PDA (for governance)

### Dependencies

- Uses `@metaplex-foundation/mpl-bubblegum@^5.0.2` (requires UMI framework)
- Uses `@solana/web3.js@^1.98.4` (v1 API)
- Uses `@coral-xyz/anchor@^0.32.1`

### Tuần 1 - Hạ tầng & Smart Contract ✅

**Đã hoàn thành:**
- ✅ Merkle Tree initialization script với `max_depth=14, max_buffer_size=64`
- ✅ Collection NFT creation script
- ✅ Smart Contract với logic Soulbound (leaf_delegate = Program PDA)
- ✅ Admin minting service sử dụng Bubblegum SDK thực sự
- ✅ API route tích hợp với minting service
- ✅ Unit tests với test cases thực sự (PDA derivation, Soulbound logic)
- ✅ Build và deploy scripts

**Để hoàn thiện:**
- [ ] Build và deploy Anchor program lên Devnet (chạy `anchor build && anchor deploy`)
- [ ] Verify CPI calls trong Smart Contract hoạt động đúng (sau khi deploy)
- [ ] Test end-to-end minting flow với Smart Contract

### Tuần 2 - Data Layer & Storage ✅

**Đã hoàn thành:**
- ✅ Dynamic certificate image generation với satori (không dùng static images)
- ✅ Irys SDK integration cho Arweave upload (Node Devnet - miễn phí)
- ✅ Metaplex metadata standard với attributes đầy đủ
- ✅ Batch processing với Promise.all (5 students/batch)
- ✅ CSV parsing với papaparse
- ✅ Progress tracking và real-time status updates
- ✅ Upload images và metadata lên Arweave trước khi mint

**Files mới:**
- `lib/arweave/irys.ts` - Irys upload utilities
- `lib/types/metadata.ts` - Metaplex metadata types
- `lib/utils/metadata-builder.ts` - Metadata builder
- `lib/utils/certificate-generator.ts` - Image generator
- `app/api/certificate/image/route.ts` - Image generation API

**Để test:**
- [ ] Test image generation API endpoint
- [ ] Test batch minting với CSV upload
- [ ] Verify Arweave URLs accessible
- [ ] Verify metadata hiển thị đúng trên NFT viewers

### Tuần 3 - Minting Process & Soulbound Logic ✅

**Đã hoàn thành:**
- ✅ Frontend wallet integration cho Admin (Teacher) minting
- ✅ Batch minting service với TransactionBuilder (gom nhiều mints vào transactions)
- ✅ Error handling và retry logic với exponential backoff
- ✅ Soulbound enforcement verification (leaf_delegate = Program PDA)
- ✅ Student passport view với collection filtering
- ✅ Spam NFT filtering (chỉ hiển thị credentials trong APEC collection)
- ✅ UI/UX enhancements (wallet UI, progress tracking, error states)

**Files mới:**
- `lib/services/batch-mint-service.ts` - Batch minting với TransactionBuilder
- `lib/utils/retry-utils.ts` - Retry logic với exponential backoff
- `lib/utils/soulbound-verification.ts` - Soulbound verification utilities

**Files đã cập nhật:**
- `app/(platform)/admin/certify/page.tsx` - Wallet integration và UI enhancements
- `app/api/cnft/route.ts` - Collection filtering
- `app/(platform)/passport/page.tsx` - Collection filtering trong frontend

**Để test:**
- [ ] Test wallet connection và minting với real wallet
- [ ] Verify transaction signatures trên Solana Explorer
- [ ] Verify collection filtering với real data
- [ ] Test retry logic với network errors

### Production Checklist

- [ ] Add `wallet_address` column to Supabase `profiles` table
- [ ] Set up proper wallet-as-a-service (Web3Auth, Privy, etc.)
- [ ] Implement Merkle proof verification on-chain (full implementation)
- [ ] Add metadata storage (Arweave/IPFS)
- [ ] Add proper error handling and logging
- [ ] Implement rate limiting for API routes
- [ ] Add admin authentication middleware
- [ ] Complete CPI implementation in Smart Contract

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
