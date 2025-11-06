/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: [
      '@solana/web3.js',
      '@coral-xyz/anchor',
      '@metaplex-foundation/mpl-bubblegum'
    ]
  },
  // Disable Turbopack for now due to wallet adapter compatibility issues
  // Use: npm run dev -- --webpack to use webpack instead
  webpack: (config, { webpack }) => {
    // Use NormalModuleReplacementPlugin to intercept imports from wallet adapters
    // This replaces @solana/web3.js imports in wallet adapter packages with web3.js-v1
    // This is necessary because wallet adapters need web3.js v1 (Connection, PublicKey, etc.)
    // while the rest of the codebase uses web3.js v2
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /^@solana\/web3\.js$/,
        function(resource) {
          // Check if import is from wallet adapter context or any node_modules package
          // that needs web3.js v1 (Connection, PublicKey exports)
          const context = resource.context || '';
          
          // If it's from node_modules (third-party package), use v1
          // This catches all wallet adapter packages and their dependencies
          if (context.includes('node_modules')) {
            // Check if it's from our app code (should use v2)
            if (context.includes('app/') || context.includes('components/') || context.includes('lib/') || context.includes('ts/')) {
              // Keep v2 for our app code
              return;
            }
            // All other node_modules packages get v1
            resource.request = 'web3.js-v1';
          } else if (
            // Also catch wallet adapter packages explicitly
            context.includes('wallet-adapter') ||
            context.includes('fractalwagmi') ||
            context.includes('@solana/wallet') ||
            context.includes('solana-wallet')
          ) {
            resource.request = 'web3.js-v1';
          }
        }
      )
    );
    
    return config;
  },
};

export default nextConfig;


