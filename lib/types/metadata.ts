/**
 * Metaplex Metadata Standard Types
 * 
 * Defines the structure for NFT metadata following Metaplex standard
 */

/**
 * Metaplex Metadata Standard Structure
 */
export interface MetaplexMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string; // Arweave URL
  external_url?: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  properties?: {
    files?: Array<{
      uri: string;
      type: string;
    }>;
    category?: string;
  };
}

/**
 * Student data for certificate generation
 */
export interface StudentCertificateData {
  name: string;
  email: string;
  major: string;
  issueDate: string;
  certificateId?: string;
  additionalInfo?: Record<string, string | number>;
}

/**
 * Certificate generation result
 */
export interface CertificateGenerationResult {
  imageBuffer: Buffer;
  imageUrl: string; // Arweave URL
  metadata: MetaplexMetadata;
  metadataUrl: string; // Arweave URL
}

