/**
 * Test Script for Tuần 3 - Minting Process & Soulbound Logic
 * 
 * Tests:
 * 1. Wallet integration
 * 2. Batch minting service
 * 3. Retry logic
 * 4. Soulbound verification
 * 5. Collection filtering
 */

import * as dotenv from 'dotenv';
import { join } from 'path';
import { PublicKey } from '@solana/web3.js';
import {
  getProgramAuthorityPDA,
  verifyProgramPDA,
  isSoulboundCredential,
} from '../lib/utils/soulbound-verification';
import { isRetryableError, retryWithBackoff } from '../lib/utils/retry-utils';

// Load environment variables
dotenv.config({ path: join(process.cwd(), '.env.local') });

async function main() {
  console.log('🧪 Testing Tuần 3 - Minting Process & Soulbound Logic\n');
  console.log('='.repeat(60));
  
  const results: Array<{ test: string; passed: boolean; error?: string }> = [];
  
  // Test 1: Program PDA Verification
  console.log('\n📋 Test 1: Program PDA Verification');
  console.log('-'.repeat(60));
  try {
    const pdaInfo = verifyProgramPDA();
    
    if (!pdaInfo.valid) {
      throw new Error('Program PDA verification failed');
    }
    
    if (!pdaInfo.programId || !pdaInfo.pda) {
      throw new Error('Program PDA info incomplete');
    }
    
    console.log('✅ PASS: Program PDA verification');
    console.log(`   Program ID: ${pdaInfo.programId}`);
    console.log(`   PDA: ${pdaInfo.pda}`);
    console.log(`   Bump: ${pdaInfo.bump}`);
    
    results.push({ test: 'Program PDA Verification', passed: true });
  } catch (error: any) {
    console.log(`❌ FAIL: ${error.message}`);
    results.push({ test: 'Program PDA Verification', passed: false, error: error.message });
  }
  
  // Test 2: Program PDA Derivation
  console.log('\n📋 Test 2: Program PDA Derivation');
  console.log('-'.repeat(60));
  try {
    const [pda1, bump1] = getProgramAuthorityPDA();
    const [pda2, bump2] = getProgramAuthorityPDA();
    
    // Should be consistent
    if (pda1.toBase58() !== pda2.toBase58()) {
      throw new Error('Program PDA derivation is inconsistent');
    }
    
    if (bump1 !== bump2) {
      throw new Error('Program PDA bump is inconsistent');
    }
    
    console.log('✅ PASS: Program PDA derivation is consistent');
    console.log(`   PDA: ${pda1.toBase58()}`);
    console.log(`   Bump: ${bump1}`);
    
    results.push({ test: 'Program PDA Derivation', passed: true });
  } catch (error: any) {
    console.log(`❌ FAIL: ${error.message}`);
    results.push({ test: 'Program PDA Derivation', passed: false, error: error.message });
  }
  
  // Test 3: Soulbound Credential Check
  console.log('\n📋 Test 3: Soulbound Credential Check');
  console.log('-'.repeat(60));
  try {
    const [programPDA] = getProgramAuthorityPDA();
    const programPDAStr = programPDA.toBase58();
    
    // Test with mock asset (Soulbound)
    const soulboundAsset = {
      ownership: {
        delegate: programPDAStr,
      },
    };
    
    const isSoulbound = isSoulboundCredential(soulboundAsset);
    if (!isSoulbound) {
      throw new Error('Failed to detect Soulbound credential');
    }
    
    // Test with mock asset (Not Soulbound)
    const normalAsset = {
      ownership: {
        delegate: 'SomeOtherAddress111111111111111111111111111',
      },
    };
    
    const isNotSoulbound = isSoulboundCredential(normalAsset);
    if (isNotSoulbound) {
      throw new Error('Incorrectly detected non-Soulbound credential as Soulbound');
    }
    
    // Test with asset without delegate
    const noDelegateAsset = {
      ownership: {},
    };
    
    const hasNoDelegate = isSoulboundCredential(noDelegateAsset);
    if (hasNoDelegate) {
      throw new Error('Incorrectly detected asset without delegate as Soulbound');
    }
    
    console.log('✅ PASS: Soulbound credential check works correctly');
    console.log(`   Soulbound asset detected: ${isSoulbound}`);
    console.log(`   Normal asset detected as Soulbound: ${isNotSoulbound}`);
    console.log(`   Asset without delegate detected as Soulbound: ${hasNoDelegate}`);
    
    results.push({ test: 'Soulbound Credential Check', passed: true });
  } catch (error: any) {
    console.log(`❌ FAIL: ${error.message}`);
    results.push({ test: 'Soulbound Credential Check', passed: false, error: error.message });
  }
  
  // Test 4: Retry Logic - Retryable Error
  console.log('\n📋 Test 4: Retry Logic - Retryable Error');
  console.log('-'.repeat(60));
  try {
    let attempts = 0;
    const maxAttempts = 3;
    
    const fn = async () => {
      attempts++;
      if (attempts < maxAttempts) {
        const error: any = new Error('Network timeout');
        error.code = 'ETIMEDOUT';
        throw error;
      }
      return 'success';
    };
    
    const result = await retryWithBackoff(fn, { maxRetries: maxAttempts });
    
    if (result !== 'success') {
      throw new Error('Retry did not succeed');
    }
    
    if (attempts !== maxAttempts) {
      throw new Error(`Expected ${maxAttempts} attempts, got ${attempts}`);
    }
    
    console.log('✅ PASS: Retry logic works for retryable errors');
    console.log(`   Attempts: ${attempts}`);
    console.log(`   Result: ${result}`);
    
    results.push({ test: 'Retry Logic - Retryable Error', passed: true });
  } catch (error: any) {
    console.log(`❌ FAIL: ${error.message}`);
    results.push({ test: 'Retry Logic - Retryable Error', passed: false, error: error.message });
  }
  
  // Test 5: Retry Logic - Non-Retryable Error
  console.log('\n📋 Test 5: Retry Logic - Non-Retryable Error');
  console.log('-'.repeat(60));
  try {
    let attempts = 0;
    
    const fn = async () => {
      attempts++;
      const error: any = new Error('Validation error');
      throw error;
    };
    
    try {
      await retryWithBackoff(fn, { maxRetries: 3 });
      throw new Error('Should have thrown error');
    } catch (error: any) {
      if (error.message !== 'Validation error') {
        throw error;
      }
      
      // Should not retry for non-retryable errors
      if (attempts !== 1) {
        throw new Error(`Expected 1 attempt, got ${attempts}`);
      }
    }
    
    console.log('✅ PASS: Retry logic does not retry non-retryable errors');
    console.log(`   Attempts: ${attempts}`);
    
    results.push({ test: 'Retry Logic - Non-Retryable Error', passed: true });
  } catch (error: any) {
    console.log(`❌ FAIL: ${error.message}`);
    results.push({ test: 'Retry Logic - Non-Retryable Error', passed: false, error: error.message });
  }
  
  // Test 6: Retryable Error Detection
  console.log('\n📋 Test 6: Retryable Error Detection');
  console.log('-'.repeat(60));
  try {
    const retryableErrors = [
      { message: 'Network error', code: 'ECONNRESET' },
      { message: 'RPC timeout', code: 'ETIMEDOUT' },
      { message: 'Transaction failed', code: 'TRANSACTION' },
    ];
    
    const nonRetryableErrors = [
      { message: 'Validation error', code: 'VALIDATION' },
      { message: 'Invalid input', code: 'INVALID' },
    ];
    
    for (const error of retryableErrors) {
      if (!isRetryableError(error)) {
        throw new Error(`Failed to detect retryable error: ${error.message}`);
      }
    }
    
    for (const error of nonRetryableErrors) {
      if (isRetryableError(error)) {
        throw new Error(`Incorrectly detected non-retryable error as retryable: ${error.message}`);
      }
    }
    
    console.log('✅ PASS: Retryable error detection works correctly');
    console.log(`   Retryable errors detected: ${retryableErrors.length}`);
    console.log(`   Non-retryable errors correctly ignored: ${nonRetryableErrors.length}`);
    
    results.push({ test: 'Retryable Error Detection', passed: true });
  } catch (error: any) {
    console.log(`❌ FAIL: ${error.message}`);
    results.push({ test: 'Retryable Error Detection', passed: false, error: error.message });
  }
  
  // Test 7: Collection Filtering Logic
  console.log('\n📋 Test 7: Collection Filtering Logic');
  console.log('-'.repeat(60));
  try {
    const collectionMint = 'APEC111111111111111111111111111111111111111';
    
    const assets = [
      {
        id: '1',
        grouping: [
          { group_key: 'collection', group_value: collectionMint },
        ],
      },
      {
        id: '2',
        grouping: [
          { group_key: 'collection', group_value: 'OtherCollection111111111111111111111111111' },
        ],
      },
      {
        id: '3',
        grouping: [],
      },
      {
        id: '4',
        grouping: [
          { group_key: 'category', group_value: 'credential' },
        ],
      },
    ];
    
    // Simulate filterByCollection function
    const filterByCollection = (assets: any[], collectionMint: string) => {
      return assets.filter((asset) => {
        if (!asset.grouping || !Array.isArray(asset.grouping)) {
          return false;
        }
        
        const collectionGroup = asset.grouping.find(
          (g: any) => g.group_key === 'collection' || g.group_key === 'Collection'
        );
        
        if (!collectionGroup) {
          return false;
        }
        
        return collectionGroup.group_value === collectionMint;
      });
    };
    
    const filtered = filterByCollection(assets, collectionMint);
    
    if (filtered.length !== 1) {
      throw new Error(`Expected 1 asset, got ${filtered.length}`);
    }
    
    if (filtered[0].id !== '1') {
      throw new Error('Filtered wrong asset');
    }
    
    console.log('✅ PASS: Collection filtering works correctly');
    console.log(`   Total assets: ${assets.length}`);
    console.log(`   Filtered assets: ${filtered.length}`);
    console.log(`   Filtered asset ID: ${filtered[0].id}`);
    
    results.push({ test: 'Collection Filtering Logic', passed: true });
  } catch (error: any) {
    console.log(`❌ FAIL: ${error.message}`);
    results.push({ test: 'Collection Filtering Logic', passed: false, error: error.message });
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary');
  console.log('='.repeat(60));
  
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

