// Environment configuration for E-Certify MVP
export const CONFIG = {
  SOLANA_NETWORK: process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet',
  PROGRAM_ID: process.env.NEXT_PUBLIC_PROGRAM_ID || 'A9wy4icR7uQnffj16zLDonoaSt4dhwaMudLo34nfccej',
  HELIUS_API_KEY: process.env.NEXT_PUBLIC_HELIUS_API_KEY || '3ad52cea-a8c4-41e2-8b01-22230620e995',
  RPC_URL: process.env.NEXT_PUBLIC_HELIUS_RPC_URL || 
    (process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'devnet' 
      ? 'https://devnet.helius-rpc.com/?api-key=3ad52cea-a8c4-41e2-8b01-22230620e995'
      : 'https://mainnet.helius-rpc.com/?api-key=3ad52cea-a8c4-41e2-8b01-22230620e995'),
} as const;

