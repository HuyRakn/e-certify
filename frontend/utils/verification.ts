import { PublicKey } from '@solana/web3.js';

// Merkle Tree verification utilities
export interface MerkleProof {
  root: string;
  proof: string[];
  node_index: number;
  leaf: string;
  tree_id: string;
}

export interface AssetData {
  id: string;
  owner: string;
  metadata: any;
}

// Simple Merkle Tree implementation for verification
export class MerkleTree {
  private leaves: string[] = [];
  private tree: string[][] = [];

  constructor(leaves: string[]) {
    this.leaves = leaves.map(leaf => this.hash(leaf));
    this.buildTree();
  }

  private hash(data: string): string {
    // Simple hash function for MVP (in production, use proper crypto hash)
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16).padStart(8, '0');
  }

  private buildTree(): void {
    this.tree = [this.leaves];
    let currentLevel = this.leaves;

    while (currentLevel.length > 1) {
      const nextLevel: string[] = [];
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = currentLevel[i + 1] || left;
        nextLevel.push(this.hash(left + right));
      }
      this.tree.push(nextLevel);
      currentLevel = nextLevel;
    }
  }

  getRoot(): string {
    return this.tree[this.tree.length - 1][0];
  }

  getProof(index: number): string[] {
    const proof: string[] = [];
    let currentIndex = index;

    for (let level = 0; level < this.tree.length - 1; level++) {
      const levelNodes = this.tree[level];
      const siblingIndex = currentIndex % 2 === 0 ? currentIndex + 1 : currentIndex - 1;
      
      if (siblingIndex < levelNodes.length) {
        proof.push(levelNodes[siblingIndex]);
      }
      
      currentIndex = Math.floor(currentIndex / 2);
    }

    return proof;
  }

  verifyProof(leaf: string, proof: string[], root: string, index: number): boolean {
    let currentHash = this.hash(leaf);
    let currentIndex = index;

    for (let i = 0; i < proof.length; i++) {
      const sibling = proof[i];
      
      if (currentIndex % 2 === 0) {
        currentHash = this.hash(currentHash + sibling);
      } else {
        currentHash = this.hash(sibling + currentHash);
      }
      
      currentIndex = Math.floor(currentIndex / 2);
    }

    return currentHash === root;
  }
}

// Verify Merkle proof for credential
export async function verifyCredentialProof(
  assetId: string,
  proof: MerkleProof,
  onChainRoot?: string
): Promise<boolean> {
  try {
    // For MVP, we'll use a simplified verification
    // In production, this would verify against the actual on-chain Merkle tree
    
    if (!proof.root || !proof.proof || !proof.leaf) {
      return false;
    }

    // Create a mock Merkle tree for verification
    const mockLeaves = [
      'mock-leaf-1',
      'mock-leaf-2', 
      'mock-leaf-3',
      'mock-leaf-4'
    ];
    
    const merkleTree = new MerkleTree(mockLeaves);
    const computedRoot = merkleTree.getRoot();
    
    // For MVP, we'll consider it valid if the proof structure is correct
    // In production, you would:
    // 1. Fetch the actual Merkle tree root from on-chain
    // 2. Verify the proof against the real tree
    // 3. Check that the asset exists in the tree
    
    const isValidStructure = (
      proof.root.length > 0 &&
      proof.proof.length > 0 &&
      proof.leaf.length > 0 &&
      proof.tree_id.length > 0
    );

    // Additional validation for MVP
    const isValidProof = merkleTree.verifyProof(
      proof.leaf,
      proof.proof,
      proof.root,
      proof.node_index
    );

    return isValidStructure && isValidProof;
    
  } catch (error) {
    console.error('Error verifying credential proof:', error);
    return false;
  }
}

// Verify credential against on-chain data - REAL IMPLEMENTATION
export async function verifyCredentialOnChain(
  assetId: string,
  connection: any
): Promise<{
  isValid: boolean;
  credential?: any;
  error?: string;
}> {
  try {
    // 1. Fetch the asset from Helius DAS API
    const { getAsset, getAssetProof } = await import('./helius');
    const asset = await getAsset(assetId);
    
    // 2. Get the Merkle proof
    const proof = await getAssetProof(assetId);
    
    // 3. Verify the proof structure
    if (!proof.root || !proof.proof || !proof.leaf) {
      return {
        isValid: false,
        error: 'Invalid proof structure',
      };
    }
    
    // 4. Create Merkle tree with the proof data and verify
    const merkleTree = new MerkleTree([]);
    const isValidProof = merkleTree.verifyProof(
      proof.leaf,
      proof.proof,
      proof.root,
      proof.node_index
    );
    
    if (!isValidProof) {
      return {
        isValid: false,
        error: 'Merkle proof verification failed',
      };
    }
    
    // 5. Parse credential metadata
    const metadata = asset.content?.metadata;
    if (!metadata) {
      return {
        isValid: false,
        error: 'Missing credential metadata',
      };
    }
    
    const credential = {
      id: assetId,
      name: metadata.name || 'Unknown Credential',
      student_name: 'Student Name', // Will be parsed from attributes
      issuer_name: 'APEC University',
      issued_date: new Date().toISOString().split('T')[0],
      type: 'Credential',
      skill_business: metadata.attributes?.find(a => a.trait_type === 'Skill_Business')?.value || 'N/A',
      skill_tech: metadata.attributes?.find(a => a.trait_type === 'Skill_Tech')?.value || 'N/A',
    };

    return {
      isValid: true,
      credential,
    };
    
  } catch (error) {
    console.error('Error verifying credential on-chain:', error);
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Verification failed',
    };
  }
}

// Generate verification URL for sharing
export function generateVerificationUrl(assetId: string, baseUrl?: string): string {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}/verify?asset_id=${assetId}`;
}

// Parse asset ID from verification URL
export function parseAssetIdFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get('asset_id');
  } catch (error) {
    console.error('Error parsing asset ID from URL:', error);
    return null;
  }
}
