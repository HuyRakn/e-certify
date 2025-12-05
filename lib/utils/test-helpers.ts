/**
 * Test Helpers for Certificate Generation and Upload
 * 
 * Utility functions for testing image generation and Arweave upload
 */

import { StudentCertificateData } from '../types/metadata';
import { generateCertificateImage } from './certificate-generator';
import { uploadImage, uploadMetadata } from '../arweave/irys';
import { buildMetaplexMetadata, validateMetaplexMetadata } from './metadata-builder';

/**
 * Test certificate image generation
 */
export async function testImageGeneration(studentData: StudentCertificateData): Promise<{
  success: boolean;
  buffer?: Buffer;
  error?: string;
}> {
  try {
    const buffer = await generateCertificateImage(studentData);
    
    // Verify buffer is valid
    if (!buffer || buffer.length === 0) {
      return { success: false, error: 'Generated buffer is empty' };
    }
    
    // Verify it's a PNG (starts with PNG signature)
    const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    const isPng = buffer.subarray(0, 8).equals(pngSignature);
    
    if (!isPng) {
      return { success: false, error: 'Generated image is not a valid PNG' };
    }
    
    return { success: true, buffer };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Test metadata building
 */
export function testMetadataBuilding(
  studentData: StudentCertificateData,
  imageUrl: string
): {
  success: boolean;
  metadata?: any;
  error?: string;
} {
  try {
    const metadata = buildMetaplexMetadata(studentData, imageUrl);
    
    // Validate metadata
    validateMetaplexMetadata(metadata);
    
    // Verify required fields
    if (!metadata.name || !metadata.symbol || !metadata.image || !metadata.attributes) {
      return { success: false, error: 'Missing required metadata fields' };
    }
    
    // Verify attributes structure
    const hasRequiredAttributes = metadata.attributes.some(
      (attr: any) => attr.trait_type === 'Student Name'
    );
    
    if (!hasRequiredAttributes) {
      return { success: false, error: 'Missing required attributes' };
    }
    
    return { success: true, metadata };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Test full flow: Generate image → Upload → Build metadata → Upload metadata
 */
export async function testFullFlow(
  studentData: StudentCertificateData
): Promise<{
  success: boolean;
  imageUrl?: string;
  metadataUrl?: string;
  error?: string;
}> {
  try {
    // Step 1: Generate image
    console.log('📋 Testing image generation...');
    const imageResult = await testImageGeneration(studentData);
    if (!imageResult.success || !imageResult.buffer) {
      return { success: false, error: `Image generation failed: ${imageResult.error}` };
    }
    console.log('✅ Image generation passed');
    
    // Step 2: Upload image
    console.log('📤 Testing image upload...');
    const imageUrl = await uploadImage(imageResult.buffer, `test-${Date.now()}.png`);
    if (!imageUrl || !imageUrl.startsWith('https://arweave.net/')) {
      return { success: false, error: 'Image upload failed or invalid URL' };
    }
    console.log(`✅ Image uploaded: ${imageUrl}`);
    
    // Step 3: Build metadata
    console.log('📄 Testing metadata building...');
    const metadataResult = testMetadataBuilding(studentData, imageUrl);
    if (!metadataResult.success || !metadataResult.metadata) {
      return { success: false, error: `Metadata building failed: ${metadataResult.error}` };
    }
    console.log('✅ Metadata building passed');
    
    // Step 4: Upload metadata
    console.log('📤 Testing metadata upload...');
    const metadataUrl = await uploadMetadata(
      metadataResult.metadata,
      `test-metadata-${Date.now()}.json`
    );
    if (!metadataUrl || !metadataUrl.startsWith('https://arweave.net/')) {
      return { success: false, error: 'Metadata upload failed or invalid URL' };
    }
    console.log(`✅ Metadata uploaded: ${metadataUrl}`);
    
    return {
      success: true,
      imageUrl,
      metadataUrl,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Verify Arweave URL is accessible
 */
export async function verifyArweaveUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

