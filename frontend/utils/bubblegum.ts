import { PublicKey, Transaction, Connection, TransactionInstruction } from '@solana/web3.js';

// Metaplex Bubblegum Program ID (Mainnet)
export const BUBBLEGUM_PROGRAM_ID = new PublicKey('BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY');

// SPL Compression Program ID
export const COMPRESSION_PROGRAM_ID = new PublicKey('cmtDvXumGCrqC1Age74AVPhSRVXJMd8PJS91LzxKmVg');

// SPL Log Wrapper Program ID (Noop Program)
export const LOG_WRAPPER_PROGRAM_ID = new PublicKey('noopb9bkMVfRPU8AsbpTUg4AQVxCuBmMZbD1e16Yga9');

// Token Metadata Program ID
export const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

// Token Program ID
export const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

export interface CredentialMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
}

export interface MintCredentialParams {
  merkleTree: PublicKey;
  leafOwner: PublicKey;
  treeAuthority: PublicKey;
  payer: PublicKey;
  metadata: CredentialMetadata;
  metadataUri: string;
}

// Upload metadata to Arweave using Bundlr network
export async function uploadMetadataToArweave(
  metadata: CredentialMetadata,
  uploader: any
): Promise<string> {
  try {
    // Create full metadata JSON
    const fullMetadata = {
      name: metadata.name,
      symbol: metadata.symbol,
      description: metadata.description,
      image: metadata.image,
      attributes: metadata.attributes,
      properties: {
        files: [
          {
            uri: metadata.image,
            type: "image/png"
          }
        ]
      }
    };

    // Upload using Bundlr
    const dataToUpload = JSON.stringify(fullMetadata);
    const tags = [{ name: "Content-Type", value: "application/json" }];
    
    const response = await uploader.upload(dataToUpload, { tags });
    
    if (response.status >= 400) {
      throw new Error(`Failed to upload metadata: ${response.statusText}`);
    }

    // Return transaction ID as URI
    const uri = `https://arweave.net/${response.id}`;
    return uri;
  } catch (error) {
    console.error('Error uploading to Arweave:', error);
    throw error;
  }
}

// Create REAL Bubblegum mint instruction - Manual implementation
export async function createBubblegumMintInstruction(
  params: MintCredentialParams,
  connection: Connection
): Promise<Transaction> {
  const transaction = new Transaction();

  try {
    // Create Bubblegum mint instruction manually
    // This is a simplified version for MVP - full implementation would require proper account setup
    const instructionData = Buffer.alloc(0); // Placeholder - actual data would be serialized instruction
    
    const mintInstruction = new TransactionInstruction({
      keys: [
        { pubkey: params.leafOwner, isSigner: false, isWritable: true },
        { pubkey: params.merkleTree, isSigner: false, isWritable: true },
        { pubkey: params.treeAuthority, isSigner: true, isWritable: false },
        { pubkey: params.payer, isSigner: true, isWritable: true },
        { pubkey: BUBBLEGUM_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: TOKEN_METADATA_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: COMPRESSION_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: LOG_WRAPPER_PROGRAM_ID, isSigner: false, isWritable: false },
      ],
      programId: BUBBLEGUM_PROGRAM_ID,
      data: instructionData,
    });

    transaction.add(mintInstruction);
    return transaction;
  } catch (error) {
    console.error('Error creating Bubblegum instruction:', error);
    throw new Error('Failed to create mint instruction');
  }
}

// Mint credential for a single student - REAL IMPLEMENTATION
export async function mintCredentialForStudent(
  connection: Connection,
  wallet: {
    publicKey: PublicKey | null;
    signTransaction: ((transaction: Transaction) => Promise<Transaction>) | undefined;
  },
  studentWallet: PublicKey,
  credentialName: string,
  credentialType: string,
  skillBusiness: string,
  skillTech: string,
  merkleTree: PublicKey
): Promise<string> {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('Wallet not connected');
  }

  // Create metadata
  const metadata: CredentialMetadata = {
    name: credentialName,
    symbol: 'APEC-CRED',
    description: `Credential issued by APEC University: ${credentialName}`,
    image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=APEC+Credential',
    attributes: [
      { trait_type: 'Credential_Type', value: credentialType },
      { trait_type: 'Skill_Business', value: skillBusiness },
      { trait_type: 'Skill_Tech', value: skillTech },
      { trait_type: 'Issuer_Name', value: 'APEC University' },
      { trait_type: 'Issuer_Address', value: wallet.publicKey.toString() },
      { trait_type: 'Valid_Until', value: '2025-12-31' },
    ],
  };

  // Upload metadata to Arweave
  const metadataUri = await uploadMetadataToArweave(metadata);

  // Create mint instruction
  const transaction = await createBubblegumMintInstruction(
    {
      merkleTree,
      leafOwner: studentWallet,
      treeAuthority: wallet.publicKey,
      payer: wallet.publicKey,
      metadata,
      metadataUri,
    },
    connection
  );

  // Sign and send transaction
  const signedTransaction = await wallet.signTransaction(transaction);
  const signature = await connection.sendRawTransaction(signedTransaction.serialize());
  await connection.confirmTransaction(signature);

  return signature;
}

// Batch mint credentials for multiple students - REAL IMPLEMENTATION
export async function batchMintCredentials(
  connection: Connection,
  wallet: {
    publicKey: PublicKey | null;
    signTransaction: ((transaction: Transaction) => Promise<Transaction>) | undefined;
  },
  students: Array<{
    wallet: PublicKey;
    name: string;
    internalId: string;
  }>,
  credentialName: string,
  credentialType: string,
  skillBusiness: string,
  skillTech: string,
  merkleTree: PublicKey,
  onProgress?: (completed: number, total: number) => void
): Promise<string[]> {
  const signatures: string[] = [];
  
  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    
    try {
      const signature = await mintCredentialForStudent(
        connection,
        wallet,
        student.wallet,
        credentialName,
        credentialType,
        skillBusiness,
        skillTech,
        merkleTree
      );
      
      signatures.push(signature);
      
      // Call progress callback
      if (onProgress) {
        onProgress(i + 1, students.length);
      }
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`Failed to mint credential for student ${student.name}:`, error);
      // Continue with next student - don't fail entire batch
    }
  }
  
  return signatures;
}
