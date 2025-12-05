/**
 * Test Script for Tuần 2 - Data Layer & Storage
 * 
 * Tests:
 * 1. Image generation
 * 2. Metadata building
 * 3. Arweave upload (if Irys configured)
 * 4. Full flow integration
 */

import * as dotenv from 'dotenv';
import { join } from 'path';
import { StudentCertificateData } from '../lib/types/metadata';
import {
  testImageGeneration,
  testMetadataBuilding,
  testFullFlow,
  verifyArweaveUrl,
} from '../lib/utils/test-helpers';

// Load environment variables
dotenv.config({ path: join(process.cwd(), '.env.local') });

async function main() {
  console.log('🧪 Testing Tuần 2 - Data Layer & Storage\n');
  console.log('=' .repeat(50));
  
  // Test data
  const testStudent: StudentCertificateData = {
    name: 'Test Student',
    email: 'test@apec.edu.vn',
    major: 'Computer Science',
    issueDate: new Date().toISOString().split('T')[0],
    certificateId: 'TEST-001',
  };
  
  const results: Array<{ test: string; passed: boolean; error?: string }> = [];
  
  // Test 1: Image Generation
  console.log('\n📋 Test 1: Image Generation');
  console.log('-'.repeat(50));
  try {
    const result = await testImageGeneration(testStudent);
    if (result.success) {
      console.log('✅ PASS: Image generation works');
      console.log(`   Buffer size: ${result.buffer?.length} bytes`);
      results.push({ test: 'Image Generation', passed: true });
    } else {
      console.log(`❌ FAIL: ${result.error}`);
      results.push({ test: 'Image Generation', passed: false, error: result.error });
    }
  } catch (error: any) {
    console.log(`❌ FAIL: ${error.message}`);
    results.push({ test: 'Image Generation', passed: false, error: error.message });
  }
  
  // Test 2: Metadata Building
  console.log('\n📋 Test 2: Metadata Building');
  console.log('-'.repeat(50));
  try {
    const testImageUrl = 'https://arweave.net/test123';
    const result = testMetadataBuilding(testStudent, testImageUrl);
    if (result.success && result.metadata) {
      console.log('✅ PASS: Metadata building works');
      console.log(`   Name: ${result.metadata.name}`);
      console.log(`   Attributes: ${result.metadata.attributes.length}`);
      results.push({ test: 'Metadata Building', passed: true });
    } else {
      console.log(`❌ FAIL: ${result.error}`);
      results.push({ test: 'Metadata Building', passed: false, error: result.error });
    }
  } catch (error: any) {
    console.log(`❌ FAIL: ${error.message}`);
    results.push({ test: 'Metadata Building', passed: false, error: error.message });
  }
  
  // Test 3: Full Flow (requires Irys setup)
  console.log('\n📋 Test 3: Full Flow (Image Gen → Upload → Metadata → Upload)');
  console.log('-'.repeat(50));
  const payerSecretKey = process.env.PAYER_SECRET_KEY;
  if (!payerSecretKey) {
    console.log('⚠️  SKIP: PAYER_SECRET_KEY not found (required for Arweave upload)');
    results.push({ test: 'Full Flow', passed: false, error: 'PAYER_SECRET_KEY not configured' });
  } else {
    try {
      const result = await testFullFlow(testStudent);
      if (result.success && result.imageUrl && result.metadataUrl) {
        console.log('✅ PASS: Full flow works');
        console.log(`   Image URL: ${result.imageUrl}`);
        console.log(`   Metadata URL: ${result.metadataUrl}`);
        
        // Verify URLs are accessible
        console.log('\n   Verifying URLs...');
        const imageAccessible = await verifyArweaveUrl(result.imageUrl);
        const metadataAccessible = await verifyArweaveUrl(result.metadataUrl);
        
        if (imageAccessible) {
          console.log('   ✅ Image URL is accessible');
        } else {
          console.log('   ⚠️  Image URL not accessible (may need time to propagate)');
        }
        
        if (metadataAccessible) {
          console.log('   ✅ Metadata URL is accessible');
        } else {
          console.log('   ⚠️  Metadata URL not accessible (may need time to propagate)');
        }
        
        results.push({ test: 'Full Flow', passed: true });
      } else {
        console.log(`❌ FAIL: ${result.error}`);
        results.push({ test: 'Full Flow', passed: false, error: result.error });
      }
    } catch (error: any) {
      console.log(`❌ FAIL: ${error.message}`);
      results.push({ test: 'Full Flow', passed: false, error: error.message });
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Summary');
  console.log('='.repeat(50));
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  results.forEach((result) => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${result.test}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log(`\nTotal: ${results.length} tests`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Test script error:', error);
  process.exit(1);
});

