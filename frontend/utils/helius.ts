import { PublicKey } from '@solana/web3.js';

// Helius DAS API configuration
const HELIUS_API_KEY = process.env.NEXT_PUBLIC_HELIUS_API_KEY || 'your-helius-api-key';
const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

// DAS API endpoints
const DAS_API_BASE = 'https://mainnet.helius-rpc.com';

export interface HeliusAsset {
  id: string;
  interface: string;
  content?: {
    schema: string;
    json_uri: string;
    files?: Array<{
      uri: string;
      mime_type: string;
    }>;
    metadata?: {
      attributes?: Array<{
        trait_type: string;
        value: string;
      }>;
      name?: string;
      symbol?: string;
      description?: string;
    };
  };
  authorities?: Array<{
    address: string;
    scopes: string[];
  }>;
  compression?: {
    eligible: boolean;
    compressed: boolean;
    data_hash: string;
    creator_hash: string;
    asset_hash: string;
    tree: string;
    seq: number;
    leaf_id: number;
  };
  ownership?: {
    frozen: boolean;
    delegated: boolean;
    delegate?: string;
    ownership_model: string;
    owner: string;
  };
  supply?: {
    print_max_supply?: number;
    print_current_supply?: number;
    edition_nonce?: number;
  };
  mutable: boolean;
  burnt: boolean;
  token_info?: {
    symbol: string;
    balance: number;
    supply: number;
    decimals: number;
    token_program: string;
    associated_token_address: string;
  };
}

export interface HeliusAssetProof {
  root: string;
  proof: string[];
  node_index: number;
  leaf: string;
  tree_id: string;
}

export interface HeliusAssetsByOwnerResponse {
  items: HeliusAsset[];
  total: number;
  limit: number;
  page?: number;
}

// Helper function to make DAS API calls
async function makeDASApiCall<T>(endpoint: string, body: any): Promise<T> {
  const response = await fetch(`${DAS_API_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`DAS API call failed: ${response.statusText}`);
  }

  return response.json();
}

// Get assets by owner (for student wallet)
export async function getAssetsByOwner(
  ownerAddress: string,
  limit: number = 1000,
  page?: number
): Promise<HeliusAssetsByOwnerResponse> {
  const body = {
    jsonrpc: '2.0',
    id: 'helius-test',
    method: 'getAssetsByOwner',
    params: {
      ownerAddress,
      page,
      limit,
    },
  };

  return makeDASApiCall<HeliusAssetsByOwnerResponse>('', body);
}

// Get specific asset by ID
export async function getAsset(assetId: string): Promise<HeliusAsset> {
  const body = {
    jsonrpc: '2.0',
    id: 'helius-test',
    method: 'getAsset',
    params: {
      id: assetId,
    },
  };

  return makeDASApiCall<HeliusAsset>('', body);
}

// Get asset proof for verification
export async function getAssetProof(assetId: string): Promise<HeliusAssetProof> {
  const body = {
    jsonrpc: '2.0',
    id: 'helius-test',
    method: 'getAssetProof',
    params: {
      id: assetId,
    },
  };

  return makeDASApiCall<HeliusAssetProof>('', body);
}

// Filter assets by issuer (APEC University)
export function filterAssetsByIssuer(
  assets: HeliusAsset[],
  issuerAddress: string
): HeliusAsset[] {
  return assets.filter(asset => {
    // Check if the asset has the issuer in its authorities or metadata
    const hasIssuerAuthority = asset.authorities?.some(
      authority => authority.address === issuerAddress
    );
    
    // Check metadata attributes for issuer information
    const hasIssuerMetadata = asset.content?.metadata?.attributes?.some(
      attr => attr.trait_type === 'Issuer_Address' && attr.value === issuerAddress
    );

    return hasIssuerAuthority || hasIssuerMetadata;
  });
}

// Parse credential metadata from asset
export interface CredentialMetadata {
  name: string;
  description?: string;
  credential_type: string;
  skill_business: string;
  skill_tech: string;
  student_id: string;
  issuer_name: string;
  issuer_address: string;
  valid_until?: string;
  issued_at: string;
}

export function parseCredentialMetadata(asset: HeliusAsset): CredentialMetadata | null {
  const metadata = asset.content?.metadata;
  if (!metadata) return null;

  const attributes = metadata.attributes || [];
  const attributeMap = new Map(
    attributes.map(attr => [attr.trait_type, attr.value])
  );

  return {
    name: metadata.name || 'Unknown Credential',
    description: metadata.description,
    credential_type: attributeMap.get('Credential_Type') || 'Unknown',
    skill_business: attributeMap.get('Skill_Business') || 'N/A',
    skill_tech: attributeMap.get('Skill_Tech') || 'N/A',
    student_id: attributeMap.get('Student_ID_Internal') || 'Unknown',
    issuer_name: attributeMap.get('Issuer_Name') || 'Unknown',
    issuer_address: attributeMap.get('Issuer_Address') || 'Unknown',
    valid_until: attributeMap.get('Valid_Until'),
    issued_at: new Date().toISOString(), // This would come from the actual asset data
  };
}

// Generate shareable verification URL
export function generateVerificationUrl(assetId: string): string {
  return `${window.location.origin}/verify?asset_id=${assetId}`;
}

// Generate QR code data for sharing
export function generateQRCodeData(assetId: string): string {
  return generateVerificationUrl(assetId);
}