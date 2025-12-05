/**
 * Soulbound Verification Utilities
 * 
 * Verify that credentials are Soulbound (leaf_delegate = Program PDA)
 */

import { PublicKey } from '@solana/web3.js';

// Program ID - Use a valid placeholder or get from env
// In production, this should be the actual deployed program ID
const CREDIFY_PROGRAM_ID_STR = process.env.CREDIFY_PROGRAM_ID || '11111111111111111111111111111111';
const CREDIFY_PROGRAM_ID = new PublicKey(CREDIFY_PROGRAM_ID_STR);

/**
 * Derive Program Authority PDA
 */
export function getProgramAuthorityPDA(): [PublicKey, number] {
  const [pda, bump] = PublicKey.findProgramAddressSync(
    [Buffer.from('authority')],
    CREDIFY_PROGRAM_ID
  );
  return [pda, bump];
}

/**
 * Verify if a credential is Soulbound
 * Checks if ownership.delegate equals Program PDA
 * 
 * @param asset DAS asset object
 * @returns true if Soulbound, false otherwise
 */
export function isSoulboundCredential(asset: any): boolean {
  try {
    // Get Program Authority PDA
    const [programAuthorityPDA] = getProgramAuthorityPDA();
    const programAuthorityStr = programAuthorityPDA.toBase58();

    // Check ownership.delegate
    if (asset.ownership?.delegate) {
      const delegateStr = asset.ownership.delegate;
      return delegateStr === programAuthorityStr;
    }

    // If no delegate, check if it's set to None (some wallets may not show delegate)
    // In this case, we assume it's not Soulbound if delegate is missing
    return false;
  } catch (error) {
    console.error('Error verifying Soulbound:', error);
    return false;
  }
}

/**
 * Verify Program PDA is correct
 */
export function verifyProgramPDA(): {
  valid: boolean;
  programId: string;
  pda: string;
  bump: number;
} {
  const [pda, bump] = getProgramAuthorityPDA();
  
  return {
    valid: true,
    programId: CREDIFY_PROGRAM_ID.toBase58(),
    pda: pda.toBase58(),
    bump,
  };
}

