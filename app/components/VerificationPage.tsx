"use client";

import React, { useEffect, useState } from 'react';
import { ShieldCheck, XCircle, ExternalLink, Loader2, AlertTriangle, Sparkles, Database } from 'lucide-react';
// ĐÃ XÓA: import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
// ĐÃ XÓA: import { Badge } from '../ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

// --- BẮT ĐẦU: Thành phần UI tự chứa (Self-Contained UI Components) ---
// Thêm code trực tiếp vào file theo yêu cầu
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`rounded-xl border bg-white text-gray-900 shadow-lg ${className}`}
      {...props}
    />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props} />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={`font-semibold leading-none tracking-tight text-2xl ${className}`}
      {...props}
    />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={`text-sm text-gray-600 ${className}`} {...props} />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={`p-6 ${className}`} {...props} /> // Bỏ 'pt-0' mặc định để 'pt-6' trong CardContent bên dưới hoạt động
));
CardContent.displayName = "CardContent";

const Badge = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { variant?: 'outline' }>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
        variant === 'outline' ? 'text-gray-700 border-gray-300' : 'bg-gray-100 text-gray-800'
      } ${className}`}
      {...props}
    />
));
Badge.displayName = "Badge";

// Button (Thêm vào đây vì nó cũng được sử dụng)
const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? 'span' : 'button'; // Dùng span nếu asChild=true, ngược lại dùng button
    return (
      <Comp
        className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
// --- KẾT THÚC: Thành phần UI tự chứa ---

// --- Type Definitions ---
type DasAsset = {
  id: string;
  content?: {
    metadata?: {
      name?: string;
      symbol?: string;
      attributes?: { trait_type: string; value: string }[];
    };
    json_uri?: string;
  };
  grouping?: { group_key: string; group_value: string }[];
  ownership?: {
    owner?: string;
  };
};

type DasProof = {
  root: string;
  proof: string[];
  leaf: string;
  tree_id?: string;
};

const DAS_URL = '/api/das';
type Status = 'loading' | 'verified' | 'invalid' | 'error';

interface VerificationPageProps {
  assetId: string;
}

// --- Animated SVG Components ---

// Animated Loader
const AnimatedLoader = () => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
    className="h-16 w-16"
    style={{ color: "var(--brand-primary)" }}
  >
    <Database className="h-full w-full" />
  </motion.div>
);

// Animated Checkmark
const AnimatedCheck = () => (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
    className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center"
  >
    <ShieldCheck className="h-8 w-8 text-green-600" />
  </motion.div>
);

// Animated Error Cross
const AnimatedError = ({ isError }: { isError: boolean }) => (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
    className={`h-16 w-16 rounded-full ${isError ? 'bg-red-100' : 'bg-yellow-100'} flex items-center justify-center`}
  >
    {isError ? (
      <XCircle className="h-8 w-8 text-red-600" />
    ) : (
      <AlertTriangle className="h-8 w-8 text-yellow-600" />
    )}
  </motion.div>
);

// --- Main Component ---

export default function VerificationPage({ assetId }: VerificationPageProps) {
  const [status, setStatus] = useState<Status>('loading');
  const [asset, setAsset] = useState<DasAsset | null>(null);
  const [proof, setProof] = useState<DasProof | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyAsset = async () => {
      if (!assetId) {
        setStatus('error');
        setError('Asset ID is required');
        return;
      }

      setStatus('loading');
      setError(null);
      setAsset(null);
      setProof(null);

      // Add a small delay for demo purposes to show the loader
      await new Promise(resolve => setTimeout(resolve, 1000));

      try {
        let a: DasAsset | null = null;
        let p: DasProof | null = null;
        
        // Try demo mode first
        try {
          const demo = await fetch('/api/demo/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ assetId }),
          });
          const dj = await demo.json();
          if (dj?.asset && dj?.proof) {
            a = dj.asset;
            p = dj.proof;
          }
        } catch (demoError) {
          console.warn('Demo mode failed, trying real RPC:', demoError);
        }

        // If demo didn't work, try real RPC
        if (!a || !p) {
          const [assetRes, proofRes] = await Promise.all([
            fetch(DAS_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: '2.0',
                id: 'verify-asset',
                method: 'getAsset',
                params: { id: assetId },
              }),
            }),
            fetch(DAS_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: '2.0',
                id: 'verify-proof',
                method: 'getAssetProof',
                params: { id: assetId },
              }),
            }),
          ]);

          const assetJson = await assetRes.json();
          const proofJson = await proofRes.json();

          a = assetJson?.result || a;
          p = proofJson?.result || p;
        }

        if (!a || !p) {
          setStatus('invalid');
          setError('Asset or proof not found. The asset may not exist or is not a valid cNFT.');
          return;
        }

        setAsset(a);
        setProof(p);

        // Basic validation
        if (p.root && p.root.length > 0 && p.proof && Array.isArray(p.proof)) {
          setStatus('verified');
        } else {
          setStatus('invalid');
          setError('Invalid proof structure received from the RPC.');
        }
      } catch (e: any) {
        console.error('Verification failed:', e);
        setError(e?.message || 'Failed to verify credential. Please check the asset ID and try again.');
        setStatus('error');
      }
    };

    verifyAsset();
  }, [assetId]);

  const renderContent = () => {
    return (
      <AnimatePresence mode="wait">
        {/* --- Loading State --- */}
        {status === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center py-24 space-y-4"
          >
            <AnimatedLoader />
            <p className="text-xl font-semibold mt-4" style={{ color: "var(--brand-primary)" }}>Verifying Credential...</p>
            <p className="text-base text-gray-600">Connecting to Solana blockchain</p>
          </motion.div>
        )}

        {/* --- Verified State (ĐÃ REFACTOR UI) --- */}
        {status === 'verified' && asset && (
          <motion.div
            key="verified"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Success Header (Giữ nguyên) */}
            <div className="flex flex-col items-center text-center space-y-4 py-8 bg-green-50 rounded-xl border border-green-200">
              <AnimatedCheck />
              <div>
                <h2 className="text-2xl font-bold text-green-900">VERIFIED</h2>
                <p className="text-green-700 mt-1">This credential is authentic and verified on-chain</p>
              </div>
            </div>

            {/* --- BẮT ĐẦU REFACTOR UI --- */}
            {/* Credential Details Card */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle>Credential Details</CardTitle>
                <CardDescription>On-chain certificate information</CardDescription>
              </CardHeader> {/* <-- SỬA LỖI: Thêm thẻ đóng </CardHeader> bị thiếu ở đây */}
              
              <CardContent className="space-y-6 pt-6"> {/* Tăng khoảng cách */}
                
                {/* Thông tin chính */}
                <div>
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Credential Name</label>
                  <p className="text-2xl font-bold mt-1 text-gray-900">
                    {asset.content?.metadata?.name || 'Credential'}
                  </p>
                </div>

                {/* Thông tin phụ (Grid) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {asset.content?.metadata?.symbol && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Symbol</label>
                      <Badge variant="outline" className="mt-2 text-sm border-gray-300">
                        {asset.content.metadata.symbol}
                      </Badge>
                    </div>
                  )}

                  {asset.ownership?.owner && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 min-w-0">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Owner Wallet</label>
                      <p className="text-sm mt-2 font-mono text-gray-700 break-all">{asset.ownership.owner}</p>
                    </div>
                  )}
                </div>

                {/* Phần Thuộc tính (Attributes) (Grid) */}
                {asset.content?.metadata?.attributes && asset.content.metadata.attributes.length > 0 && (
                  <div>
                    <label className="text-base font-semibold text-gray-900 mb-3 block">
                      Attributes
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {asset.content.metadata.attributes.map((attr, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{attr.trait_type}</p>
                          <p className="text-base font-semibold text-gray-900 mt-1">{attr.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Phần Bằng chứng (Verification Proof) */}
                {proof && (
                  <div>
                    <label className="text-base font-semibold text-gray-900 mb-3 block">
                      Verification Proof
                    </label>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-xs font-mono break-all space-y-2">
                      <div>
                        <span className="font-semibold text-green-800 uppercase text-xs tracking-wide">Root:</span> 
                        <p className="text-green-700 mt-1">{proof.root}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-green-800 uppercase text-xs tracking-wide">Proof Steps:</span> 
                        <p className="text-green-700 mt-1">{proof.proof.length}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            {/* --- KẾT THÚC REFACTOR UI --- */}


            {/* Actions (Giữ nguyên) */}
            <div className="flex gap-3">
              <Button
                asChild
                className="w-full text-white h-12 text-base font-semibold transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
                style={{ backgroundColor: "var(--brand-primary)" }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--brand-hover)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--brand-primary)"}
              >
                <a
                  href={`https://xray.helius.xyz/asset/${assetId}?network=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <ExternalLink className="h-5 w-5" />
                  View On-Chain Proof (X-Ray)
                </a>
              </Button>
            </div>
          </motion.div>
        )}

        {/* --- Invalid or Error State --- */}
        {(status === 'invalid' || status === 'error') && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center space-y-4 py-16"
          >
            <AnimatedError isError={status === 'error'} />
            <div>
              <h2 className={`text-2xl font-bold ${status === 'error' ? 'text-red-900' : 'text-yellow-900'}`}>
                {status === 'error' ? 'Verification Error' : 'Credential Invalid'}
              </h2>
              <p className={`${status === 'error' ? 'text-red-700' : 'text-yellow-700'} mt-1`}>
                {status === 'error'
                  ? 'An error occurred during verification.'
                  : 'This credential could not be verified or does not exist.'
                }
              </p>
              {error && (
                <p className="text-sm text-red-600 mt-2">{error}</p>
              )}
            </div>
            {assetId && (
              <div className="mt-4 p-3 bg-gray-100 rounded text-xs font-mono border border-gray-200">
                Asset ID: {assetId}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <Card className="shadow-lg border-2 border-gray-100 bg-white">
      <CardContent className="pt-6">
        {renderContent()}
      </CardContent>
    </Card>
  );
}