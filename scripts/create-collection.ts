/**
 * Script to create Metaplex Collection NFT
 * 
 * This script creates a Collection NFT that will be used for all credentials
 */

import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { createSignerFromKeypair, signerIdentity } from '@metaplex-foundation/umi';
import { fromWeb3JsKeypair } from '@metaplex-foundation/umi-web3js-adapters';
import { createNft, mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { Keypair } from '@solana/web3.js';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Load environment variables
dotenv.config({ path: join(process.cwd(), '.env.local') });

async function main() {
  console.log('🎨 Creating Collection NFT...\n');

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
  umi.use(mplTokenMetadata());
  const umiPayer = createSignerFromKeypair(umi, fromWeb3JsKeypair(payer));
  umi.use(signerIdentity(umiPayer));

  // Check payer balance
  const balance = await umi.rpc.getBalance(umiPayer.publicKey);
  console.log(`💰 Payer balance: ${Number(balance.basisPoints) / 1e9} SOL\n`);

  // 4. Create Collection NFT
  console.log('📤 Creating collection...');
  
  const collectionMint = await createNft(umi, {
    name: 'APEC Credentials Collection',
    symbol: 'APEC-CRED',
    uri: 'https://api.apec.edu.vn/metadata/collection.json',
    isCollection: true,
    sellerFeeBasisPoints: 0,
  }).sendAndConfirm(umi);

  console.log(`\n✅ Collection NFT created successfully!`);
  console.log(`   Collection Mint: ${collectionMint.signature}`);
  console.log(`\n📝 Add this to your .env.local:`);
  console.log(`   COLLECTION_MINT=<collection_mint_address>`);
  console.log(`   NEXT_PUBLIC_APEC_COLLECTION=<collection_mint_address>`);
  console.log(`\n🎉 Done!`);
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});

