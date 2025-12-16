/**
 * Admin Service for Batch Minting Compressed NFTs
 * 
 * This service handles batch minting of credentials using Bubblegum SDK.
 * CRITICAL: Sets leaf_delegate to Program PDA for Soulbound logic.
 * 
 * Now includes:
 * - Dynamic certificate image generation
 * - Arweave upload via Irys
 * - Metaplex metadata standard
 */

import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { createSignerFromKeypair, signerIdentity } from '@metaplex-foundation/umi';
import { fromWeb3JsKeypair, fromWeb3JsPublicKey } from '@metaplex-foundation/umi-web3js-adapters';
import { mintV1, mplBubblegum } from '@metaplex-foundation/mpl-bubblegum';
import { Keypair, PublicKey } from '@solana/web3.js';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { generateCertificateImage } from '../lib/utils/certificate-generator';
import { uploadImage, uploadMetadata } from '../lib/arweave/irys';
import { buildMetaplexMetadata } from '../lib/utils/metadata-builder';
import { StudentCertificateData } from '../lib/types/metadata';

// Load environment variables
dotenv.config({ path: join(process.cwd(), '.env.local') });

// Program ID from credify_program
const CREDIFY_PROGRAM_ID = new PublicKey('CRD111111111111111111111111111111111111111');

// Derive Program PDA for tree authority
function getProgramTreeAuthorityPDA(): [PublicKey, number] {
  const [pda, bump] = PublicKey.findProgramAddressSync(
    [Buffer.from('authority')],
    CREDIFY_PROGRAM_ID
  );
  return [pda, bump];
}

type Student = { 
  name: string; 
  wallet: string;
  email?: string;
  major?: string;
  issue_date?: string;
};

class AdminService {
  private payer: Keypair | null = null;
  private umi: any = null;

  // Initialize payer and UMI
  async initialize() {
    if (this.payer && this.umi) return; // Already initialized
    
    // Load payer from environment
    const payerSecretKey = process.env.PAYER_SECRET_KEY;
    if (!payerSecretKey) {
      throw new Error('PAYER_SECRET_KEY not found in .env.local');
    }

    try {
      const keyArray = JSON.parse(payerSecretKey);
      this.payer = Keypair.fromSecretKey(new Uint8Array(keyArray));
    } catch (e) {
      throw new Error(`Failed to parse PAYER_SECRET_KEY: ${e}`);
    }

    // Setup UMI
    const rpcUrl = process.env.RPC_URL || process.env.HELIUS_API_KEY_URL;
    if (!rpcUrl) {
      throw new Error('RPC_URL or HELIUS_API_KEY_URL not found in .env.local');
    }

    this.umi = createUmi(rpcUrl);
    this.umi.use(mplBubblegum());
    const umiPayer = createSignerFromKeypair(this.umi, fromWeb3JsKeypair(this.payer));
    this.umi.use(signerIdentity(umiPayer));
  }

  /**
   * Batch mint cNFT credentials for students
   * CRITICAL: Sets leaf_delegate to Program PDA for Soulbound logic
   */
  async batchMintCredentials(
    merkleTree: string,
    collectionMint: string,
    students: Student[]
  ): Promise<{ success: boolean; results: Array<{ student: string; tx?: string; error?: string }> }> {
    await this.initialize();
    
    if (!this.payer || !this.umi) {
      throw new Error('Service not initialized');
    }

    console.log(`Starting to mint ${students.length} credentials...`);
    console.log(`Merkle Tree: ${merkleTree}`);
    console.log(`Collection: ${collectionMint}`);
    console.log(`Payer: ${this.payer.publicKey.toBase58()}`);

    const results: Array<{ student: string; tx?: string; error?: string }> = [];

    // Derive Program PDA for leaf_delegate (Soulbound)
    const [programAuthorityPDA] = getProgramTreeAuthorityPDA();
    const umiProgramAuthority = fromWeb3JsPublicKey(programAuthorityPDA);
    const umiMerkleTree = fromWeb3JsPublicKey(new PublicKey(merkleTree));
    const umiCollectionMint = fromWeb3JsPublicKey(new PublicKey(collectionMint));

    console.log(`Program Authority PDA (leaf_delegate): ${programAuthorityPDA.toBase58()}\n`);

    for (const student of students) {
      try {
        const studentWallet = fromWeb3JsPublicKey(new PublicKey(student.wallet));
        
        console.log(`\n📋 Processing ${student.name} (${student.email})...`);
        
        // Step 1: Generate certificate image
        console.log(`   🎨 Generating certificate image...`);
        const studentData: StudentCertificateData = {
          name: student.name,
          email: student.email || '',
          major: student.major || '',
          issueDate: student.issue_date || new Date().toISOString().split('T')[0],
          certificateId: `APEC-${student.email?.split('@')[0] || student.name.replace(/\s+/g, '-')}-${Date.now()}`,
        };
        
        const imageBuffer = await generateCertificateImage(studentData);
        
        // Step 2: Upload image to Arweave
        console.log(`   📤 Uploading image to Arweave...`);
        const imageFilename = `certificate-${studentData.certificateId}.png`;
        const imageUrl = await uploadImage(imageBuffer, imageFilename);
        
        // Step 3: Build metadata
        console.log(`   📄 Building metadata...`);
        const metadata = buildMetaplexMetadata(studentData, imageUrl);
        
        // Step 4: Upload metadata to Arweave
        console.log(`   📤 Uploading metadata to Arweave...`);
        const metadataFilename = `metadata-${studentData.certificateId}.json`;
        const metadataUrl = await uploadMetadata(metadata, metadataFilename);
        
        // Step 5: Mint cNFT with metadata URL
        console.log(`   🪙 Minting cNFT...`);
        const mintMetadata = {
          name: metadata.name,
          symbol: metadata.symbol,
          uri: metadataUrl, // Use Arweave metadata URL
          sellerFeeBasisPoints: 0,
          creators: [
            {
              address: fromWeb3JsPublicKey(this.payer.publicKey),
              verified: true,
              share: 100,
            },
          ],
          collection: {
            key: umiCollectionMint,
            verified: false,
          },
        };

        // Mint cNFT with Soulbound logic
        // CRITICAL: leaf_delegate = Program PDA (prevents transfer)
        const builder = await mintV1(this.umi, {
          leafOwner: studentWallet,
          leafDelegate: umiProgramAuthority, // SOULBOUND: Program PDA
          merkleTree: umiMerkleTree,
          metadata: mintMetadata,
        });

        const result = await builder.sendAndConfirm(this.umi);
        
        console.log(`✅ Minted credential for ${student.name}`);
        console.log(`   Transaction: ${result.signature}`);
        console.log(`   Image: ${imageUrl}`);
        console.log(`   Metadata: ${metadataUrl}`);
        
        results.push({
          student: student.email || student.name,
          tx: String(result.signature),
        });
      } catch (error: any) {
        console.error(`❌ Failed to mint for ${student.name}:`, error.message);
        results.push({
          student: student.email || student.name,
          error: error.message || 'Unknown error',
        });
      }
    }

    const successful = results.filter(r => r.tx).length;
    const failed = results.filter(r => r.error).length;
    
    console.log(`\n📊 Minting Summary:`);
    console.log(`   Successful: ${successful}/${students.length}`);
    console.log(`   Failed: ${failed}/${students.length}`);

    return { 
      success: successful > 0, 
      results 
    };
  }
}

// Export for use in API routes
export default AdminService;

// Example execution (if run directly)
if (require.main === module) {
  (async () => {
    try {
      const admin = new AdminService();
      
      // Get configuration from environment
      const merkleTree = process.env.MERKLE_TREE;
      const collectionMint = process.env.COLLECTION_MINT;
      
      if (!merkleTree || !collectionMint) {
        throw new Error('MERKLE_TREE and COLLECTION_MINT must be set in .env.local');
      }

      // Example student list
      const studentList: Student[] = [
        { 
          name: 'Alice Nguyen', 
          wallet: '11111111111111111111111111111111', // Replace with real wallet
          email: 'alice@apec.edu.vn',
          major: 'Entrepreneurship',
          issue_date: new Date().toISOString().split('T')[0],
        },
      ];

      const result = await admin.batchMintCredentials(merkleTree, collectionMint, studentList);
      console.log('Final result:', result);
    } catch (error) {
      console.error('Admin script error:', error);
      process.exit(1);
    }
  })();
}
