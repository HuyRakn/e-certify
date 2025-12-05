/**
 * Verification Helpers for Tuần 3
 * 
 * Utilities để verify minting results và Soulbound enforcement
 */

import { Connection, PublicKey } from '@solana/web3.js';
import { getProgramAuthorityPDA, isSoulboundCredential } from './soulbound-verification';

/**
 * Verify transaction signature
 */
export async function verifyTransaction(
  connection: Connection,
  signature: string
): Promise<{
  success: boolean;
  confirmed: boolean;
  error?: string;
}> {
  try {
    const tx = await connection.getTransaction(signature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0,
    });

    if (!tx) {
      return {
        success: false,
        confirmed: false,
        error: 'Transaction not found',
      };
    }

    if (tx.meta?.err) {
      return {
        success: false,
        confirmed: true,
        error: JSON.stringify(tx.meta.err),
      };
    }

    return {
      success: true,
      confirmed: true,
    };
  } catch (error: any) {
    return {
      success: false,
      confirmed: false,
      error: error.message,
    };
  }
}

/**
 * Verify credential is Soulbound from DAS API
 */
export async function verifyCredentialSoulbound(
  dasUrl: string,
  assetId: string
): Promise<{
  isSoulbound: boolean;
  programPDA: string;
  delegate?: string;
  error?: string;
}> {
  try {
    const [programPDA] = getProgramAuthorityPDA();
    const programPDAStr = programPDA.toBase58();

    // Fetch asset from DAS API
    const response = await fetch(dasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'verify-soulbound',
        method: 'getAsset',
        params: { id: assetId },
      }),
    });

    const data = await response.json();
    const asset = data.result;

    if (!asset) {
      return {
        isSoulbound: false,
        programPDA: programPDAStr,
        error: 'Asset not found',
      };
    }

    const delegate = asset.ownership?.delegate;
    const isSoulbound = delegate === programPDAStr;

    return {
      isSoulbound,
      programPDA: programPDAStr,
      delegate,
    };
  } catch (error: any) {
    return {
      isSoulbound: false,
      programPDA: getProgramAuthorityPDA()[0].toBase58(),
      error: error.message,
    };
  }
}

/**
 * Verify collection membership
 */
export function verifyCollectionMembership(
  asset: any,
  collectionMint: string
): {
  isMember: boolean;
  collectionGroup?: { group_key: string; group_value: string };
  error?: string;
} {
  try {
    if (!asset.grouping || !Array.isArray(asset.grouping)) {
      return {
        isMember: false,
        error: 'Asset has no grouping',
      };
    }

    const collectionGroup = asset.grouping.find(
      (g: any) => g.group_key === 'collection' || g.group_key === 'Collection'
    );

    if (!collectionGroup) {
      return {
        isMember: false,
        error: 'Asset has no collection grouping',
      };
    }

    const isMember = collectionGroup.group_value === collectionMint;

    return {
      isMember,
      collectionGroup,
    };
  } catch (error: any) {
    return {
      isMember: false,
      error: error.message,
    };
  }
}

/**
 * Verify batch minting results
 */
export function verifyBatchMintingResults(results: Array<{ student: string; tx?: string; error?: string }>): {
  total: number;
  successful: number;
  failed: number;
  successRate: number;
  allSuccessful: boolean;
} {
  const total = results.length;
  const successful = results.filter(r => r.tx).length;
  const failed = results.filter(r => r.error).length;
  const successRate = total > 0 ? (successful / total) * 100 : 0;
  const allSuccessful = failed === 0 && successful === total;

  return {
    total,
    successful,
    failed,
    successRate,
    allSuccessful,
  };
}

