// All code and comments in English.

import { createSolanaRpc } from '@solana/web3.js';
import { createHttpTransport } from '@solana/rpc-transport-http';

// NOTE: web3.js v2 compatibility
// For web3.js v2, Keypair and PublicKey exports may differ.
// If you encounter TypeScript errors, you may need to:
// 1. Install @solana/web3.js-legacy-compat: npm install @solana/web3.js-legacy-compat
// 2. Import from there: import { Keypair, PublicKey } from '@solana/web3.js-legacy-compat'
// 3. Or use dynamic imports at runtime (as done below)
// For MVP, we use dynamic imports to avoid compilation errors
// Note: Bubblegum v5 API may differ - for MVP we'll use a simplified approach
// import { createMintToCollectionV1Instruction, PROGRAM_ID as BUBBLEGUM_PROGRAM_ID } from '@metaplex-foundation/mpl-bubblegum';
// Note: @solana/spl-account-compression may need to be installed separately
// import { getConcurrentMerkleTreeAccountSize, PROGRAM_ID as COMPRESSION_PROGRAM_ID } from '@solana/spl-account-compression';

// --- Configuration ---
const RPC_URL = process.env.RPC_URL || 'https://devnet.helius-rpc.com/?api-key=3ad52cea-a8c4-41e2-8b01-22230620e995';
const COLLECTION_MINT = process.env.COLLECTION_MINT || '11111111111111111111111111111111';
const MERKLE_TREE = process.env.MERKLE_TREE || '11111111111111111111111111111111';

const rpc = createSolanaRpc(RPC_URL);
const transport = createHttpTransport({ url: RPC_URL });

type Student = { 
  name: string; 
  wallet: string;
  email?: string;
  major?: string;
  issue_date?: string;
};

class AdminService {
  private payer: any = null; // Keypair type - using any for MVP compatibility

  // Initialize payer asynchronously
  async initializePayer() {
    if (this.payer) return; // Already initialized
    
    // For MVP: Load payer from environment or generate a new one
    // In production, this should be loaded from a secure key management system
    const payerSecretKey = process.env.PAYER_SECRET_KEY;
    if (payerSecretKey) {
      try {
        const keyArray = JSON.parse(payerSecretKey);
        // Dynamic import for compatibility
        const web3 = await import('@solana/web3.js');
        const Keypair = (web3 as any).Keypair || (web3 as any).default?.Keypair;
        if (!Keypair) {
          throw new Error('Keypair not found in @solana/web3.js');
        }
        this.payer = Keypair.fromSecretKey(new Uint8Array(keyArray));
      } catch (e) {
        console.warn('Failed to load payer from env, generating new keypair');
        // Dynamic import for generateKeyPair
        const web3 = await import('@solana/web3.js');
        const generateKeyPair = (web3 as any).generateKeyPair || (web3 as any).default?.generateKeyPair;
        if (!generateKeyPair) {
          throw new Error('generateKeyPair not found in @solana/web3.js');
        }
        this.payer = generateKeyPair();
      }
    } else {
      const web3 = await import('@solana/web3.js');
      const generateKeyPair = (web3 as any).generateKeyPair || (web3 as any).default?.generateKeyPair;
      if (!generateKeyPair) {
        throw new Error('generateKeyPair not found in @solana/web3.js');
      }
      this.payer = generateKeyPair();
      console.warn('No PAYER_SECRET_KEY in env. Generated new keypair. This is for testing only!');
    }
  }

  async createCollection(): Promise<string> {
    console.log('Using Collection Mint:', COLLECTION_MINT);
    // For MVP: Return existing collection or placeholder
    // In production, this would create a Metaplex Collection NFT
    // using @metaplex-foundation/mpl-token-metadata
    return COLLECTION_MINT;
  }

  async createMerkleTree(maxDepth: number = 14, maxBufferSize: number = 64): Promise<string> {
    console.log('Using Merkle Tree:', MERKLE_TREE);
    // For MVP: Return existing tree or placeholder
    // In production, this would:
    // 1. Calculate tree account size using getConcurrentMerkleTreeAccountSize
    // 2. Create the tree account
    // 3. Initialize it via Bubblegum's createTree instruction
    return MERKLE_TREE;
  }

  /**
   * Batch mint cNFT credentials for students
   * This is the core minting function that uses Bubblegum v5
   */
  async batchMintCredentials(
    merkleTree: string,
    collectionMint: string,
    students: Student[]
  ): Promise<{ success: boolean; results: Array<{ student: string; tx?: string; error?: string }> }> {
    // Ensure payer is initialized
    await this.initializePayer();
    
    if (!this.payer) {
      throw new Error('Payer keypair not initialized');
    }

    console.log(`Starting to mint ${students.length} credentials...`);
    console.log(`Merkle Tree: ${merkleTree}`);
    console.log(`Collection: ${collectionMint}`);
    console.log(`Payer: ${this.payer.publicKey.toBase58()}`);

    const results: Array<{ student: string; tx?: string; error?: string }> = [];

    try {
      // Get latest blockhash
      const { value: blockhash } = await rpc.getLatestBlockhash().send();
      console.log('Fetched latest blockhash:', blockhash.blockhash);

      // Dynamic import PublicKey once for the loop
      const web3PublicKey = await import('@solana/web3.js');
      const PublicKeyClass = (web3PublicKey as any).PublicKey || (web3PublicKey as any).default?.PublicKey;
      if (!PublicKeyClass) {
        throw new Error('PublicKey not found in @solana/web3.js');
      }

      // For each student, mint a cNFT
      for (const student of students) {
        try {
          const studentWallet = new PublicKeyClass(student.wallet);
          
          // Prepare metadata URI (in production, upload to Arweave/IPFS)
          const metadataUri = `https://api.apec.edu.vn/metadata/${student.email || student.name}`;

          // Create metadata object
          const metadata = {
            name: `APEC Credential: ${student.name}`,
            symbol: 'APEC-CRED',
            uri: metadataUri,
            sellerFeeBasisPoints: 0,
            creators: [
              {
                address: this.payer.publicKey,
                verified: true,
                share: 100,
              },
            ],
            collection: {
              key: new PublicKeyClass(collectionMint),
              verified: false, // Will be verified separately if needed
            },
            attributes: [
              { trait_type: 'Student Name', value: student.name },
              ...(student.major ? [{ trait_type: 'Major', value: student.major }] : []),
              ...(student.issue_date ? [{ trait_type: 'Issue Date', value: student.issue_date }] : []),
            ],
          };

          // Build mint instruction
          // Note: This is a simplified version. Full implementation requires:
          // - Proper account derivation for Bubblegum
          // - Merkle tree account setup
          // - Metadata account creation
          // - Collection verification
          
          // For MVP, we'll log the intent and return mock transaction
          // In production, uncomment and complete the CPI call below:
          
          /*
          const mintIx = createMintToCollectionV1Instruction(
            {
              treeAuthority: new PublicKey(merkleTree), // Actually tree authority PDA
              leafOwner: studentWallet,
              leafDelegate: studentWallet,
              merkleTree: new PublicKey(merkleTree),
              payer: this.payer.publicKey,
              treeDelegate: this.payer.publicKey, // Or program PDA
              collectionAuthority: this.payer.publicKey,
              collectionAuthorityRecordPda: BUBBLEGUM_PROGRAM_ID, // Or derived PDA
              collectionMint: new PublicKey(collectionMint),
              collectionMetadata: // Derive metadata PDA
              editionAccount: // Derive edition PDA
              bubblegumSigner: // Derive signer PDA
              compressionProgram: COMPRESSION_PROGRAM_ID,
              logWrapper: // Noop program
              bubblegumProgram: BUBBLEGUM_PROGRAM_ID,
              tokenProgram: // Token program
              systemProgram: // System program
            },
            {
              metadataArgs: metadata,
            }
          );

          const transaction = {
            version: 0,
            payer: this.payer.publicKey,
            instructions: [mintIx],
            recentBlockhash: blockhash.blockhash,
          } as const;

          const signedTransaction = await signTransaction(transaction, [this.payer]);
          const signature = await rpc.sendTransaction(signedTransaction).send();
          */

          // MVP: Return mock transaction
          const mockTx = `mockTx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          console.log(`(MOCK) Mint credential for ${student.name} (${student.email}) -> ${student.wallet}`);
          console.log(`(MOCK) Transaction: ${mockTx}`);
          
          results.push({
            student: student.email || student.name,
            tx: mockTx,
          });
        } catch (error: any) {
          console.error(`Failed to mint for ${student.name}:`, error);
          results.push({
            student: student.email || student.name,
            error: error.message || 'Unknown error',
          });
        }
      }

      console.log(`Minting complete. ${results.filter(r => r.tx).length}/${students.length} successful.`);
      return { success: true, results };
    } catch (error: any) {
      console.error('Batch mint failed:', error);
      return { success: false, results };
    }
  }
}

// Example execution
(async () => {
  try {
    const admin = new AdminService();
    
    // Initialize payer
    await admin.initializePayer();

    // 1. Create Collection (or get existing)
    const collectionMint = await admin.createCollection();

    // 2. Create Tree
    const merkleTree = await admin.createMerkleTree();

    // 3. Batch Mint
    const studentList: Student[] = [
      { 
        name: 'Alice Nguyen', 
        wallet: '11111111111111111111111111111111',
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
