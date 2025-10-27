// Simplified UMI implementation
import { Connection } from '@solana/web3.js';

// Mock UMI instance for compatibility
let umiInstance: any = null;

export function getUmi(connection?: Connection, keypair?: any) {
  if (!umiInstance) {
    umiInstance = {
      identity: keypair,
      rpc: connection || new Connection('https://api.devnet.solana.com'),
    };
  }

  return umiInstance;
}

export { getUmi as umi };
