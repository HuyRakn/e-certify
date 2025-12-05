/**
 * Irys/Arweave Upload Utility
 * 
 * Handles uploading images and metadata to Arweave via Irys SDK
 * Uses Node Devnet for free uploads during development
 */

import Irys from '@irys/sdk';
import { Keypair } from '@solana/web3.js';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Load environment variables
dotenv.config({ path: join(process.cwd(), '.env.local') });

// Irys configuration
const IRYS_NETWORK = process.env.IRYS_NETWORK || 'devnet';
const IRYS_URL = IRYS_NETWORK === 'devnet' 
  ? 'https://devnet.irys.xyz' 
  : 'https://node1.irys.xyz';
const IRYS_TOKEN = 'solana';

let irysInstance: Irys | null = null;

/**
 * Initialize Irys instance with payer keypair
 */
async function getIrysInstance(): Promise<Irys> {
  if (irysInstance) {
    return irysInstance;
  }

  // Load payer from environment
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

  // Initialize Irys
  irysInstance = new Irys({
    url: IRYS_URL,
    token: IRYS_TOKEN,
    key: payer.secretKey,
  });

  // Get balance
  const balance = await irysInstance.getLoadedBalance();
  console.log(`Irys balance: ${irysInstance.utils.fromAtomic(balance)} ${IRYS_TOKEN}`);

  return irysInstance;
}

/**
 * Upload image buffer to Arweave via Irys
 * @param buffer Image buffer (PNG)
 * @param filename Filename for the image
 * @returns Arweave transaction ID (URL format: https://arweave.net/<txId>)
 */
export async function uploadImage(
  buffer: Buffer,
  filename: string = 'certificate.png'
): Promise<string> {
  try {
    const irys = await getIrysInstance();
    
    // Convert buffer to Uint8Array
    const data = new Uint8Array(buffer);
    
    // Upload with tags
    const receipt = await irys.upload(data, {
      tags: [
        { name: 'Content-Type', value: 'image/png' },
        { name: 'App-Name', value: 'APEC-Credify' },
        { name: 'Type', value: 'certificate-image' },
        { name: 'Filename', value: filename },
      ],
    });

    // Return Arweave URL
    const arweaveUrl = `https://arweave.net/${receipt.id}`;
    console.log(`✅ Image uploaded: ${arweaveUrl}`);
    
    return arweaveUrl;
  } catch (error: any) {
    console.error('❌ Failed to upload image:', error);
    throw new Error(`Image upload failed: ${error.message}`);
  }
}

/**
 * Upload metadata JSON to Arweave via Irys
 * @param metadata Metadata object (will be stringified)
 * @param filename Filename for the metadata
 * @returns Arweave transaction ID (URL format: https://arweave.net/<txId>)
 */
export async function uploadMetadata(
  metadata: object,
  filename: string = 'metadata.json'
): Promise<string> {
  try {
    const irys = await getIrysInstance();
    
    // Stringify metadata
    const data = JSON.stringify(metadata, null, 2);
    const buffer = Buffer.from(data, 'utf-8');
    const uint8Array = new Uint8Array(buffer);
    
    // Upload with tags
    const receipt = await irys.upload(uint8Array, {
      tags: [
        { name: 'Content-Type', value: 'application/json' },
        { name: 'App-Name', value: 'APEC-Credify' },
        { name: 'Type', value: 'metadata' },
        { name: 'Standard', value: 'Metaplex' },
        { name: 'Filename', value: filename },
      ],
    });

    // Return Arweave URL
    const arweaveUrl = `https://arweave.net/${receipt.id}`;
    console.log(`✅ Metadata uploaded: ${arweaveUrl}`);
    
    return arweaveUrl;
  } catch (error: any) {
    console.error('❌ Failed to upload metadata:', error);
    throw new Error(`Metadata upload failed: ${error.message}`);
  }
}

/**
 * Upload multiple files in batch (for parallel processing)
 * @param items Array of { buffer, filename, type: 'image' | 'metadata' }
 * @returns Array of Arweave URLs
 */
export async function uploadBatch(
  items: Array<{ buffer: Buffer; filename: string; type: 'image' | 'metadata' }>
): Promise<string[]> {
  const irys = await getIrysInstance();
  
  // Prepare uploads
  const uploads = items.map((item) => {
    const data = new Uint8Array(item.buffer);
    const tags = [
      { name: 'Content-Type', value: item.type === 'image' ? 'image/png' : 'application/json' },
      { name: 'App-Name', value: 'APEC-Credify' },
      { name: 'Type', value: item.type },
      { name: 'Filename', value: item.filename },
    ];
    
    if (item.type === 'metadata') {
      tags.push({ name: 'Standard', value: 'Metaplex' });
    }
    
    return { data, tags };
  });
  
  // Upload batch
  const receipts = await irys.uploader.uploadBatch(uploads);
  
  // Return URLs
  return receipts.map((receipt) => `https://arweave.net/${receipt.id}`);
}

