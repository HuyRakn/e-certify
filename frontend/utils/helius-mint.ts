import { Connection, PublicKey } from '@solana/web3.js';
import { CONFIG } from './config';

const HELIUS_API_KEY = CONFIG.HELIUS_API_KEY;
const HELIUS_RPC_URL = CONFIG.RPC_URL;

interface StudentData {
  wallet: string;
  name: string;
  internalId: string;
}

interface CredentialMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  attributes: Array<{ trait_type: string; value: string }>;
  metadataUri: string;
}

/**
 * Upload metadata to Arweave via Irys
 */
async function uploadMetadataToArweave(metadata: CredentialMetadata): Promise<string> {
  try {
    const metadataJSON = JSON.stringify({
      name: metadata.name,
      symbol: metadata.symbol,
      description: metadata.description,
      image: metadata.image,
      attributes: metadata.attributes,
      properties: {
        files: [{ uri: metadata.image, type: 'image/png' }]
      }
    });

    // Upload using Irys network
    const response = await fetch('https://node1.irys.xyz/json', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: metadataJSON,
    });

    if (response.ok) {
      const result = await response.json();
      return `https://arweave.net/${result.id}`;
    }

    // Fallback to mock URI for development
    console.warn('Failed to upload to Arweave, using mock URI');
    return `https://arweave.net/mock-${Date.now()}`;
  } catch (error) {
    console.error('Error uploading metadata:', error);
    // Return mock URI for development
    return `https://arweave.net/mock-${Date.now()}`;
  }
}

/**
 * Create credential metadata from student data
 */
function createCredentialMetadata(
  student: StudentData,
  credentialName: string,
  credentialType: string,
  skillBusiness: string,
  skillTech: string
): CredentialMetadata {
  return {
    name: `${credentialName} - ${student.name}`,
    symbol: 'ECERT-APEC',
    description: `Credential issued to ${student.name}`,
    image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=APEC+Credential',
    attributes: [
      { trait_type: 'Student_ID_Internal', value: student.internalId },
      { trait_type: 'Credential_Type', value: credentialType },
      { trait_type: 'Skill_Business', value: skillBusiness },
      { trait_type: 'Skill_Tech', value: skillTech },
      { trait_type: 'Issuer_Name', value: 'APEC University' },
      { trait_type: 'Valid_Until', value: 'N/A' },
    ],
    metadataUri: '', // Will be set after upload
  };
}

/**
 * Mint a credential as cNFT using Helius DAS API
 * Note: This is a placeholder for the actual minting implementation
 */
export async function batchMintCredentialsWithHelius(
  students: StudentData[],
  issuerAuthority: string
): Promise<Array<{ success: boolean; assetId?: string; error?: string }>> {
  const results = [];

  for (const student of students) {
    try {
      // Create metadata
      const metadata = createCredentialMetadata(
        student,
        'Dual Degree Module',
        'Dual_Degree_Module',
        'Startup Finance',
        'Python'
      );

      // Upload metadata to Arweave
      const metadataUri = await uploadMetadataToArweave(metadata);

      // In production, this would:
      // 1. Call Bubblegum program to mint cNFT
      // 2. Return the asset ID
      // For now, we're simulating the mint process

      console.log(`Would mint credential for ${student.name} to wallet ${student.wallet}`);
      console.log(`Metadata URI: ${metadataUri}`);

      results.push({
        success: true,
        assetId: `mock-asset-${Date.now()}-${Math.random()}`,
      });
    } catch (error) {
      console.error(`Error minting credential for ${student.name}:`, error);
      results.push({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return results;
}

/**
 * Get credentials for a student wallet
 */
export async function getStudentCredentials(walletAddress: string): Promise<any[]> {
  try {
    const response = await fetch(`${HELIUS_RPC_URL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'my-id',
        method: 'getAssetsByOwner',
        params: {
          ownerAddress: walletAddress,
          page: 1,
          limit: 1000,
        },
      }),
    });

    const data = await response.json();
    return data.result?.items || [];
  } catch (error) {
    console.error('Error fetching student credentials:', error);
    return [];
  }
}

