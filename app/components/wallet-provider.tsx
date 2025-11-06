"use client";

import React, { useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
// Use v1 clusterApiUrl for wallet adapter compatibility
// Note: ConnectionProvider from wallet-adapter-react uses Connection from web3.js v1
// We use package.json overrides to ensure wallet adapters get v1
import { clusterApiUrl } from "web3.js-v1";

// Import wallet adapter CSS
import "@solana/wallet-adapter-react-ui/styles.css";

// Determine network from environment variable (default to devnet)
const network = (process.env.NEXT_PUBLIC_SOLANA_NETWORK as WalletAdapterNetwork) || WalletAdapterNetwork.Devnet;

export function SolanaWalletProvider({ children }: { children: React.ReactNode }) {
  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => {
    // Priority: NEXT_PUBLIC_HELIUS_API_KEY_URL > NEXT_PUBLIC_SOLANA_RPC_URL > cluster API URL
    // Note: Only NEXT_PUBLIC_* env vars are available in client components
    const customEndpoint = process.env.NEXT_PUBLIC_HELIUS_API_KEY_URL || 
                           process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
    
    // Validate and return custom endpoint if it's a valid URL
    if (customEndpoint && typeof customEndpoint === 'string' && 
        (customEndpoint.startsWith('http://') || customEndpoint.startsWith('https://'))) {
      return customEndpoint.trim();
    }
    
    // Use v1 clusterApiUrl for wallet adapter compatibility
    // Default to devnet if no environment variable is set
    let defaultEndpoint: string;
    try {
      defaultEndpoint = clusterApiUrl(network);
    } catch (error) {
      console.warn('Failed to get cluster URL, using fallback:', error);
      defaultEndpoint = 'https://api.devnet.solana.com';
    }
    
    // Ensure we always return a valid URL
    if (!defaultEndpoint || typeof defaultEndpoint !== 'string' || 
        (!defaultEndpoint.startsWith('http://') && !defaultEndpoint.startsWith('https://'))) {
      // Fallback to a public devnet RPC
      console.warn('Invalid endpoint, using fallback RPC');
      return 'https://api.devnet.solana.com';
    }
    
    return defaultEndpoint;
  }, [network]);

  // Configure supported wallets
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

