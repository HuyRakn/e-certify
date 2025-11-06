// app/(platform)/passport/page.tsx
// All code and comments must be in English.
"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { ShieldCheck, Award, Loader2 } from "lucide-react";
import { PassportCard } from "@/app/components/passport-card";
import { WalletIndicator } from "@/app/components/wallet-indicator";

interface ICertificate {
  id: string;
  content?: {
    metadata?: {
      name?: string;
      attributes?: Array<{ trait_type: string; value: string }>;
    };
  };
  grouping?: Array<{ group_key: string; group_value: string }>;
}

export default function SkillsPassportPage() {
  const { publicKey, connected } = useWallet();
  const [certificates, setCertificates] = useState<ICertificate[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCertificates = async () => {
      if (!publicKey || !connected) {
        setCertificates([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/cnft?owner=${publicKey.toBase58()}`);
        
        // Even if response is not ok, try to parse JSON (demo mode might return 200 with demo data)
        const data = await response.json();
        
        // DAS API returns items in 'items' array
        const items = Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data)
          ? data
          : [];
        
        // If we have items, use them (even if from demo mode)
        if (items.length > 0) {
          setCertificates(items as ICertificate[]);
        } else if (!response.ok) {
          // Only show error if we truly have no data
          throw new Error("Failed to fetch credentials");
        } else {
          setCertificates([]);
        }
      } catch (error) {
        console.error("Error fetching certificates:", error);
        // Don't set empty array immediately - API might have fallback data
        // The API route will return demo data on error
        setCertificates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [publicKey, connected]);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[1600px] space-y-6 p-6 md:p-8 lg:p-10">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                  Skills Passport
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Your verifiable, on-chain academic and skill achievements.
                </p>
              </div>
            </div>
          </div>
          {/* Wallet Indicator - Clean, minimal: Logo + Address */}
          <div className="hidden md:flex">
            <WalletIndicator />
          </div>
        </div>
        
        {/* Mobile Wallet Indicator */}
        <div className="md:hidden flex justify-end">
          <WalletIndicator />
        </div>

        {/* Wallet Connection Prompt */}
        {!connected && (
          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-purple-600" />
                Connect Your Wallet
              </CardTitle>
              <CardDescription>
                Please connect your Solana wallet (Phantom, Solflare, etc.) to view your Skills Passport and on-chain certificates.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8 space-y-4">
              <WalletIndicator />
              <p className="text-xs text-muted-foreground text-center max-w-md">
                Don't have a wallet? <a href="https://phantom.app/" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">Download Phantom</a> or <a href="https://solflare.com/" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">Solflare</a>
              </p>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {connected && loading && (
          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardContent className="py-16">
              <div className="flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
                <div className="text-center space-y-2">
                  <p className="text-sm font-medium text-slate-900">Loading certificates...</p>
                  <p className="text-xs text-slate-500">Fetching from Solana blockchain</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State - No Certificates */}
        {connected && !loading && certificates.length === 0 && (
          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardContent className="py-16">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center">
                  <Award className="h-8 w-8 text-slate-400" />
                </div>
                <div className="text-center space-y-2 max-w-md">
                  <h3 className="text-lg font-semibold text-slate-900">No Certificates Found</h3>
                  <p className="text-sm text-slate-600">
                    This wallet doesn't have any E-Certify certificates yet. Complete a course to receive your first certificate!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Certificates Grid */}
        {connected && !loading && certificates.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-900">
                Found <span className="text-purple-600 font-semibold">{certificates.length}</span> certificate{certificates.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {certificates.map((cert, index) => (
                <PassportCard key={cert.id} asset={cert} index={index} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
