/**
 * Metadata Builder for Metaplex Standard
 * 
 * Builds metadata JSON following Metaplex metadata standard
 */

import { MetaplexMetadata, StudentCertificateData } from '../types/metadata';

/**
 * Build Metaplex metadata for student credential
 * 
 * @param studentData Student information
 * @param imageUrl Arweave URL of the certificate image
 * @param metadataUrl Arweave URL where this metadata will be stored (optional, for external_url)
 * @returns Complete Metaplex metadata object
 */
export function buildMetaplexMetadata(
  studentData: StudentCertificateData,
  imageUrl: string,
  metadataUrl?: string
): MetaplexMetadata {
  const certificateId = studentData.certificateId || 
    `APEC-${studentData.email.split('@')[0]}-${Date.now()}`;

  // Build attributes array
  const attributes = [
    {
      trait_type: 'Student Name',
      value: studentData.name,
    },
    {
      trait_type: 'Major',
      value: studentData.major,
    },
    {
      trait_type: 'Issue Date',
      value: studentData.issueDate,
    },
    {
      trait_type: 'Certificate ID',
      value: certificateId,
    },
  ];

  // Add email if provided
  if (studentData.email) {
    attributes.push({
      trait_type: 'Email',
      value: studentData.email,
    });
  }

  // Add additional info as attributes
  if (studentData.additionalInfo) {
    Object.entries(studentData.additionalInfo).forEach(([key, value]) => {
      attributes.push({
        trait_type: key,
        value: value,
      });
    });
  }

  // Build metadata object
  const metadata: MetaplexMetadata = {
    name: `APEC Credential: ${studentData.name}`,
    symbol: 'APEC-CRED',
    description: `Academic credential certificate for ${studentData.name} in ${studentData.major}, issued by APEC University on ${studentData.issueDate}.`,
    image: imageUrl,
    external_url: metadataUrl || `https://apec.edu.vn/verify/${certificateId}`,
    attributes: attributes,
    properties: {
      files: [
        {
          uri: imageUrl,
          type: 'image/png',
        },
      ],
      category: 'credential',
    },
  };

  return metadata;
}

/**
 * Validate metadata structure
 * @param metadata Metadata object to validate
 * @returns true if valid, throws error if invalid
 */
export function validateMetaplexMetadata(metadata: any): boolean {
  if (!metadata.name || typeof metadata.name !== 'string') {
    throw new Error('Metadata must have a name (string)');
  }
  
  if (!metadata.symbol || typeof metadata.symbol !== 'string') {
    throw new Error('Metadata must have a symbol (string)');
  }
  
  if (!metadata.description || typeof metadata.description !== 'string') {
    throw new Error('Metadata must have a description (string)');
  }
  
  if (!metadata.image || typeof metadata.image !== 'string') {
    throw new Error('Metadata must have an image URL (string)');
  }
  
  if (!Array.isArray(metadata.attributes)) {
    throw new Error('Metadata must have attributes (array)');
  }
  
  // Validate attributes structure
  metadata.attributes.forEach((attr: any, index: number) => {
    if (!attr.trait_type || typeof attr.trait_type !== 'string') {
      throw new Error(`Attribute at index ${index} must have trait_type (string)`);
    }
    if (attr.value === undefined || (typeof attr.value !== 'string' && typeof attr.value !== 'number')) {
      throw new Error(`Attribute at index ${index} must have value (string or number)`);
    }
  });
  
  return true;
}

