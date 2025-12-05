/**
 * Script to initialize Merkle Tree for Compressed NFTs
 * 
 * This script creates a Concurrent Merkle Tree with optimal settings for hackathon:
 * - max_depth = 14 (supports ~16,384 credentials)
 * - max_buffer_size = 64 (optimized for hackathon)
 * 
 * The tree authority will be set to the Credify Program PDA
 */

import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { createSignerFromKeypair, signerIdentity } from '@metaplex-foundation/umi';
import { fromWeb3JsKeypair, fromWeb3JsPublicKey } from '@metaplex-foundation/umi-web3js-adapters';
import { createTree } from '@metaplex-foundation/mpl-bubblegum';
import { Keypair, PublicKey } from '@solana/web3.js';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Load environment variables
dotenv.config({ path: join(process.cwd(), '.env.local') });

// Configuration
const MAX_DEPTH = 14;
const MAX_BUFFER_SIZE = 64;
const CANOPY_DEPTH = 0; // No canopy for simplicity (can be added later if needed)

// Program ID from credify_program
const CREDIFY_PROGRAM_ID = new PublicKey('CRD111111111111111111111111111111111111111');

// Derive Program PDA for tree authority
// Seeds: [b"authority"]
function getProgramTreeAuthorityPDA(): [PublicKey, number] {
  const [pda, bump] = PublicKey.findProgramAddressSync(
    [Buffer.from('authority')],
    CREDIFY_PROGRAM_ID
  );
  return [pda, bump];
}

async function main() {
  console.log('🌳 Initializing Merkle Tree for Compressed NFTs...\n');

  // 1. Load payer from environment
  const payerSecretKey = process.env.PAYER_SECRET_KEY;
  if (!payerSecretKey) {
    throw new Error('PAYER_SECRET_KEY not found in .env.local');
  }

  let payer: Keypair;
  try {
    const keyArray = JSON.parse(payerSecretKey);
    payer = Keypair.fromSecretKey(new Uint8Array(keyArray));
  } catch (e) {
    throw new Error(`Failed to parse PAYER_SECRET_KEY: ${e}`);
  }

  console.log(`✅ Payer loaded: ${payer.publicKey.toBase58()}`);

  // 2. Connect to RPC
  const rpcUrl = process.env.RPC_URL || process.env.HELIUS_API_KEY_URL;
  if (!rpcUrl) {
    throw new Error('RPC_URL or HELIUS_API_KEY_URL not found in .env.local');
  }

  console.log(`✅ RPC URL: ${rpcUrl.substring(0, 50)}...`);

  // 3. Setup UMI
  const umi = createUmi(rpcUrl);
  const umiPayer = createSignerFromKeypair(umi, fromWeb3JsKeypair(payer));
  umi.use(signerIdentity(umiPayer));

  // Check payer balance
  const balance = await umi.rpc.getBalance(umiPayer.publicKey);
  console.log(`💰 Payer balance: ${Number(balance.basisPoints) / 1e9} SOL\n`);

  if (Number(balance.basisPoints) < 0.1 * 1e9) {
    console.warn('⚠️  Warning: Payer balance is low. You may need SOL for transaction fees.');
  }

  // 4. Derive Program PDA for tree authority
  const [programTreeAuthority, bump] = getProgramTreeAuthorityPDA();
  const umiTreeAuthority = fromWeb3JsPublicKey(programTreeAuthority);
  
  console.log(`📊 Tree Configuration:`);
  console.log(`   - Max Depth: ${MAX_DEPTH}`);
  console.log(`   - Max Buffer Size: ${MAX_BUFFER_SIZE}`);
  console.log(`   - Canopy Depth: ${CANOPY_DEPTH}`);
  console.log(`🔐 Program Tree Authority PDA: ${programTreeAuthority.toBase58()}`);
  console.log(`   Bump: ${bump}\n`);

  // 5. Generate Merkle Tree keypair
  const treeKeypair = umi.eddsa.generateKeypair();
  console.log(`🌲 Tree Public Key: ${treeKeypair.publicKey}\n`);

  // 6. Create tree using Bubblegum
  console.log('📤 Creating tree...');
  const builder = await createTree(umi, {
    merkleTree: treeKeypair,
    maxDepth: MAX_DEPTH,
    maxBufferSize: MAX_BUFFER_SIZE,
    treeCreator: umiPayer,
    isPublic: false, // Tree is not public (only authority can modify)
  });

  // Note: The tree authority will be set to treeCreator by default
  // We need to update it to Program PDA after creation
  // For now, we'll create with payer as creator, then transfer authority in Smart Contract

  console.log('📡 Sending transaction...');
  const result = await builder.sendAndConfirm(umi);

  console.log(`\n✅ Merkle Tree created successfully!`);
  console.log(`   Transaction Signature: ${result.signature}`);
  console.log(`   Merkle Tree Address: ${treeKeypair.publicKey}`);
  console.log(`\n📝 Add these to your .env.local:`);
  console.log(`   MERKLE_TREE=${treeKeypair.publicKey}`);
  console.log(`   TREE_AUTHORITY=${programTreeAuthority.toBase58()}`);
  console.log(`\n⚠️  Note: Tree creator is currently payer.`);
  console.log(`   Tree authority will be set to Program PDA when deploying Smart Contract.`);

  // Verify tree was created
  console.log('\n🔍 Verifying tree creation...');
  const treeAccount = await umi.rpc.getAccount(treeKeypair.publicKey);
  if (treeAccount.exists) {
    console.log(`✅ Tree account exists`);
  } else {
    console.error('❌ Tree account not found!');
    process.exit(1);
  }

  console.log('\n🎉 Done!');
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});

