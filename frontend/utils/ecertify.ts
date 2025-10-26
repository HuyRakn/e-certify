import { PublicKey, Transaction, SystemProgram, Connection } from '@solana/web3.js';
// Removed anchor dependency for now - using custom serialization

// Program ID - should match the deployed program
export const ECERTIFY_PROGRAM_ID = new PublicKey('ECertifyProgram11111111111111111111111111111');

// Metaplex Bubblegum Program ID
export const BUBBLEGUM_PROGRAM_ID = new PublicKey('BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY');

// Instruction discriminators
export const INSTRUCTIONS = {
  INITIALIZE_ISSUER: 0,
  CREATE_MERKLE_TREE: 3,
  ISSUE_CREDENTIAL_VIA_CPI: 1,
  VERIFY_ZK_PROOF: 2,
} as const;

// Data structures matching the Rust program
export interface IssuerData {
  authority: PublicKey;
  name: string;
  logo_uri: string;
  website: string;
  bump: number;
  is_active: boolean;
  credential_count: number;
  merkle_tree_count: number;
}

export interface MerkleTreeData {
  tree_authority: PublicKey;
  merkle_tree: PublicKey;
  max_depth: number;
  max_buffer_size: number;
  created_at: number;
  is_active: boolean;
}

export interface InitializeIssuerData {
  name: string;
  logo_uri: string;
  website: string;
}

export interface CreateMerkleTreeData {
  max_depth: number;
  max_buffer_size: number;
  tree_name: string;
}

export interface IssueCredentialData {
  student_wallet: PublicKey;
  credential_name: string;
  credential_type: string;
  skill_business: string;
  skill_tech: string;
  metadata_uri: string;
  merkle_tree: PublicKey;
}

// Helper functions for serialization
export function serializeInitializeIssuerData(data: InitializeIssuerData): Buffer {
  const nameBuffer = Buffer.from(data.name, 'utf8');
  const logoUriBuffer = Buffer.from(data.logo_uri, 'utf8');
  const websiteBuffer = Buffer.from(data.website, 'utf8');
  
  // Simple length-prefixed serialization
  const result = Buffer.concat([
    Buffer.from([data.name.length]),
    nameBuffer,
    Buffer.from([data.logo_uri.length]),
    logoUriBuffer,
    Buffer.from([data.website.length]),
    websiteBuffer,
  ]);
  
  return result;
}

export function serializeCreateMerkleTreeData(data: CreateMerkleTreeData): Buffer {
  const treeNameBuffer = Buffer.from(data.tree_name, 'utf8');
  
  const result = Buffer.concat([
    Buffer.from(data.max_depth.toString(16).padStart(8, '0'), 'hex'),
    Buffer.from(data.max_buffer_size.toString(16).padStart(8, '0'), 'hex'),
    Buffer.from([data.tree_name.length]),
    treeNameBuffer,
  ]);
  
  return result;
}

export function serializeIssueCredentialData(data: IssueCredentialData): Buffer {
  const credentialNameBuffer = Buffer.from(data.credential_name, 'utf8');
  const credentialTypeBuffer = Buffer.from(data.credential_type, 'utf8');
  const skillBusinessBuffer = Buffer.from(data.skill_business, 'utf8');
  const skillTechBuffer = Buffer.from(data.skill_tech, 'utf8');
  const metadataUriBuffer = Buffer.from(data.metadata_uri, 'utf8');
  
  const result = Buffer.concat([
    data.student_wallet.toBuffer(),
    Buffer.from([data.credential_name.length]),
    credentialNameBuffer,
    Buffer.from([data.credential_type.length]),
    credentialTypeBuffer,
    Buffer.from([data.skill_business.length]),
    skillBusinessBuffer,
    Buffer.from([data.skill_tech.length]),
    skillTechBuffer,
    Buffer.from([data.metadata_uri.length]),
    metadataUriBuffer,
    data.merkle_tree.toBuffer(),
  ]);
  
  return result;
}

// Instruction creation functions
export function createInitializeIssuerInstruction(
  authority: PublicKey,
  issuerPda: PublicKey,
  data: InitializeIssuerData
): Transaction {
  const instructionData = Buffer.concat([
    Buffer.from([INSTRUCTIONS.INITIALIZE_ISSUER]),
    serializeInitializeIssuerData(data)
  ]);

  return new Transaction().add({
    keys: [
      { pubkey: authority, isSigner: true, isWritable: false },
      { pubkey: issuerPda, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: ECERTIFY_PROGRAM_ID,
    data: instructionData,
  });
}

export function createCreateMerkleTreeInstruction(
  authority: PublicKey,
  issuerPda: PublicKey,
  merkleTreePda: PublicKey,
  data: CreateMerkleTreeData
): Transaction {
  const instructionData = Buffer.concat([
    Buffer.from([INSTRUCTIONS.CREATE_MERKLE_TREE]),
    serializeCreateMerkleTreeData(data)
  ]);

  return new Transaction().add({
    keys: [
      { pubkey: authority, isSigner: true, isWritable: false },
      { pubkey: issuerPda, isSigner: false, isWritable: true },
      { pubkey: merkleTreePda, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: ECERTIFY_PROGRAM_ID,
    data: instructionData,
  });
}

export function createIssueCredentialInstruction(
  authority: PublicKey,
  issuerPda: PublicKey,
  merkleTreeAccount: PublicKey,
  collectionMint: PublicKey,
  collectionMetadata: PublicKey,
  collectionMasterEdition: PublicKey,
  bubblegumProgram: PublicKey,
  logWrapper: PublicKey,
  compressionProgram: PublicKey,
  tokenMetadataProgram: PublicKey,
  tokenProgram: PublicKey,
  systemProgram: PublicKey,
  rent: PublicKey,
  data: IssueCredentialData
): Transaction {
  const instructionData = Buffer.concat([
    Buffer.from([INSTRUCTIONS.ISSUE_CREDENTIAL_VIA_CPI]),
    serializeIssueCredentialData(data)
  ]);

  return new Transaction().add({
    keys: [
      { pubkey: authority, isSigner: true, isWritable: false },
      { pubkey: issuerPda, isSigner: false, isWritable: true },
      { pubkey: merkleTreeAccount, isSigner: false, isWritable: true },
      { pubkey: collectionMint, isSigner: false, isWritable: false },
      { pubkey: collectionMetadata, isSigner: false, isWritable: false },
      { pubkey: collectionMasterEdition, isSigner: false, isWritable: false },
      { pubkey: bubblegumProgram, isSigner: false, isWritable: false },
      { pubkey: logWrapper, isSigner: false, isWritable: false },
      { pubkey: compressionProgram, isSigner: false, isWritable: false },
      { pubkey: tokenMetadataProgram, isSigner: false, isWritable: false },
      { pubkey: tokenProgram, isSigner: false, isWritable: false },
      { pubkey: systemProgram, isSigner: false, isWritable: false },
      { pubkey: rent, isSigner: false, isWritable: false },
    ],
    programId: ECERTIFY_PROGRAM_ID,
    data: instructionData,
  });
}

// PDA generation functions
export function getIssuerPda(authority: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('issuer'), authority.toBuffer()],
    ECERTIFY_PROGRAM_ID
  );
}

export function getMerkleTreePda(authority: PublicKey, treeIndex: number): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('merkle_tree'),
      authority.toBuffer(),
      Buffer.from(treeIndex.toString().padStart(8, '0'), 'utf8')
    ],
    ECERTIFY_PROGRAM_ID
  );
}

// Account data parsing functions
export async function getIssuerData(
  connection: Connection,
  issuerPda: PublicKey
): Promise<IssuerData | null> {
  try {
    const accountInfo = await connection.getAccountInfo(issuerPda);
    if (!accountInfo) return null;

    // Parse the account data (simplified for MVP)
    const data = accountInfo.data;
    
    // This would need proper deserialization based on the actual Borsh layout
    // For MVP, we'll return a mock structure
    return {
      authority: new PublicKey(data.slice(0, 32)),
      name: 'APEC University',
      logo_uri: 'https://apecgroup.net/logo.png',
      website: 'https://apecgroup.net',
      bump: data[32],
      is_active: data[33] === 1,
      credential_count: 0,
      merkle_tree_count: 0,
    };
  } catch (error) {
    console.error('Error fetching issuer data:', error);
    return null;
  }
}

export async function getMerkleTreeData(
  connection: Connection,
  merkleTreePda: PublicKey
): Promise<MerkleTreeData | null> {
  try {
    const accountInfo = await connection.getAccountInfo(merkleTreePda);
    if (!accountInfo) return null;

    // Parse the account data (simplified for MVP)
    const data = accountInfo.data;
    
    return {
      tree_authority: new PublicKey(data.slice(0, 32)),
      merkle_tree: new PublicKey(data.slice(32, 64)),
      max_depth: data.readUInt32LE(64),
      max_buffer_size: data.readUInt32LE(68),
      created_at: data.readInt32LE(72),
      is_active: data[76] === 1,
    };
  } catch (error) {
    console.error('Error fetching merkle tree data:', error);
    return null;
  }
}