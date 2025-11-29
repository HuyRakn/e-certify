"use client";

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import VerificationPage from '@/app/components/VerificationPage';
import QRScanner from '@/app/components/QRScanner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { QrCode, Hash } from 'lucide-react';

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const assetIdFromUrl = searchParams.get('assetId');
  const [assetId, setAssetId] = useState(assetIdFromUrl || '');
  const [activeTab, setActiveTab] = useState<'scan' | 'verify'>(assetIdFromUrl ? 'verify' : 'scan');

  const handleScan = (scannedData: string) => {
    // Extract assetId from URL if it's a full URL
    try {
      const url = new URL(scannedData);
      const extractedAssetId = url.searchParams.get('assetId') || url.pathname.split('/').pop() || scannedData;
      setAssetId(extractedAssetId);
      setActiveTab('verify');
    } catch {
      // If it's not a URL, treat it as assetId directly
      setAssetId(scannedData);
      setActiveTab('verify');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl p-6 md:p-8 lg:p-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-soft-text">Credential Verification</h1>
          <p className="text-soft-text-muted mt-2">
            Instant verification of on-chain certificates - Scan QR code or enter Asset ID
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'scan' | 'verify')}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="scan" className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              Scan QR Code
            </TabsTrigger>
            <TabsTrigger value="verify" className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Verify by ID
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scan">
            <QRScanner onScan={handleScan} />
          </TabsContent>

          <TabsContent value="verify">
            {assetId ? (
              <VerificationPage assetId={assetId} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Enter Asset ID</CardTitle>
                  <CardDescription>
                    Enter the credential Asset ID to verify, or scan a QR code from the Scan tab
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={assetId}
                      onChange={(e) => setAssetId(e.target.value)}
                      placeholder="Enter Asset ID (e.g., demo-asset-1)"
                      className="w-full px-4 py-3 border rounded-lg"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && assetId.trim()) {
                          // Asset ID is already set, VerificationPage will handle it
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        if (assetId.trim()) {
                          // VerificationPage will verify automatically when assetId changes
                        }
                      }}
                      className="w-full px-4 py-2 bg-brand text-white rounded-lg hover:bg-[var(--brand-hover)]"
                      disabled={!assetId.trim()}
                    >
                      Verify Credential
                    </button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}


