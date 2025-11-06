"use client";

import React, { useState } from 'react';
import { QrCode, X, Camera, Hash } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose?: () => void;
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  const handleScan = (result: any) => {
    if (result && result[0]?.rawValue) {
      const scannedData = result[0].rawValue;
      // Extract assetId from URL if it's a full URL
      try {
        const url = new URL(scannedData);
        const extractedAssetId = url.searchParams.get('assetId') || url.pathname.split('/').pop() || scannedData;
        onScan(extractedAssetId);
        setScanning(false);
      } catch {
        // If it's not a URL, treat it as assetId directly
        onScan(scannedData);
        setScanning(false);
      }
    }
  };

  const handleError = (err: any) => {
    console.error('QR Scanner error:', err);
    setError(err?.message || 'Failed to access camera. Please allow camera permissions.');
    setScanning(false);
    setShowManualInput(true);
  };

  const handleManualInput = () => {
    if (manualInput.trim()) {
      try {
        // Try to parse as URL first
        const url = new URL(manualInput.trim());
        const extractedAssetId = url.searchParams.get('assetId') || url.pathname.split('/').pop() || manualInput.trim();
        onScan(extractedAssetId);
      } catch {
        // If it's not a URL, treat it as assetId directly
        onScan(manualInput.trim());
      }
      setManualInput('');
      setShowManualInput(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Scan QR Code
            </CardTitle>
            <CardDescription>
              Scan a credential QR code to verify instantly
            </CardDescription>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            {error}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setError(null);
                setShowManualInput(true);
              }}
              className="mt-2 w-full"
            >
              Enter manually instead
            </Button>
          </div>
        )}

        {!scanning && !showManualInput && (
          <div className="space-y-3">
            <Button
              onClick={() => {
                setError(null);
                setScanning(true);
              }}
              className="w-full"
              size="lg"
            >
              <Camera className="mr-2 h-4 w-4" />
              Start Camera Scanner
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowManualInput(true)}
              className="w-full"
            >
              <Hash className="mr-2 h-4 w-4" />
              Enter Asset ID Manually
            </Button>
          </div>
        )}

        {scanning && !error && (
          <div className="space-y-3">
            <div className="relative bg-black rounded-lg overflow-hidden aspect-square">
              <Scanner
                onScan={handleScan}
                onError={handleError}
                constraints={{
                  facingMode: 'environment', // Use back camera on mobile
                }}
                styles={{
                  container: {
                    width: '100%',
                    height: '100%',
                  },
                  video: {
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover' as const,
                  },
                }}
              />
              <div className="absolute inset-0 border-4 border-purple-500 rounded-lg pointer-events-none">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-purple-400 rounded"></div>
              </div>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              Position QR code within the frame to scan
            </div>
            <Button
              onClick={() => {
                setScanning(false);
              }}
              variant="outline"
              className="w-full"
            >
              Stop Scanning
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setScanning(false);
                setShowManualInput(true);
              }}
              className="w-full text-sm"
            >
              Or enter manually
            </Button>
          </div>
        )}

        {showManualInput && (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Enter Asset ID or Verification URL
              </label>
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Asset ID or URL (e.g., /verify?assetId=... or demo-asset-1)"
                className="w-full px-3 py-2 border rounded-md"
                onKeyDown={(e) => e.key === 'Enter' && handleManualInput()}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleManualInput} className="flex-1" disabled={!manualInput.trim()}>
                Verify
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowManualInput(false);
                  setManualInput('');
                  setError(null);
                }}
              >
                Cancel
              </Button>
            </div>
            {!scanning && (
              <Button
                variant="ghost"
                onClick={() => {
                  setShowManualInput(false);
                  setError(null);
                  setScanning(true);
                }}
                className="w-full text-sm"
              >
                <Camera className="mr-2 h-3 w-3" />
                Try camera scanner again
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
