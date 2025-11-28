"use client";

import React, { useEffect, useState } from 'react';
import { Award, ExternalLink, ShieldCheck, Calendar, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';

type DasAsset = {
  id: string;
  content?: {
    json_uri?: string;
    metadata?: {
      name?: string;
      symbol?: string;
      attributes?: { trait_type: string; value: string }[];
    };
  };
  grouping?: { group_key: string; group_value: string }[];
  ownership?: {
    owner?: string;
  };
};

const DAS_URL = '/api/das';
const APEC_COLLECTION_MINT = process.env.NEXT_PUBLIC_APEC_COLLECTION || '';
const DEMO_MODE = (process.env.NEXT_PUBLIC_DEMO_MODE || '').toLowerCase() === 'true';

interface SkillsPassportProps {
  ownerBase58: string;
}

export default function SkillsPassport({ ownerBase58 }: SkillsPassportProps) {
  const [credentials, setCredentials] = useState<DasAsset[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ownerBase58) {
      setLoading(false);
      return;
    }

    const fetchCredentials = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(DAS_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 'apec-credify',
            method: 'getAssetsByOwner',
            params: { ownerAddress: ownerBase58 },
          }),
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const body = await res.json();
        let items: DasAsset[] = body?.result?.items || [];

        // Fallback to demo mode if enabled
        if (DEMO_MODE && (!items || items.length === 0)) {
          try {
            const d = await fetch('/api/demo/credentials', { method: 'POST' });
            const dj = await d.json();
            items = dj?.result?.items || [];
          } catch (demoError) {
            console.warn('Demo mode fallback failed:', demoError);
          }
        }

        // Filter by collection if specified
        const filtered = APEC_COLLECTION_MINT
          ? items.filter((a) =>
              a.grouping?.find((g) => g.group_key === 'collection')?.group_value === APEC_COLLECTION_MINT
            )
          : items;

        setCredentials(filtered);
      } catch (e: any) {
        console.error('Failed to fetch credentials', e);
        setError(
          e?.message || 'Failed to load credentials. Please check your RPC connection or network.'
        );
        setCredentials([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCredentials();
  }, [ownerBase58]);

  if (!ownerBase58) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <p>Please provide a wallet address to view Skills Passport.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-16">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
            <p className="text-sm font-medium">Loading Skills Passport...</p>
            <p className="text-xs text-muted-foreground">Fetching credentials from blockchain</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <p className="text-sm font-medium text-red-900">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-brand" />
            My Skills Passport
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {credentials.length} {credentials.length === 1 ? 'credential' : 'credentials'} found
          </p>
        </div>
        <ShareProfile ownerBase58={ownerBase58} />
      </div>

      {/* Empty State */}
      {credentials.length === 0 && (
        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Award className="h-12 w-12 text-muted-foreground" />
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">No Credentials Found</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  This wallet doesn't have any APEC credentials yet. Complete a course to receive your first certificate!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Credentials Grid */}
      {credentials.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {credentials.map((cred) => (
            <CredentialCard key={cred.id} asset={cred} />
          ))}
        </div>
      )}
    </div>
  );
}

function CredentialCard({ asset }: { asset: DasAsset }) {
  const title = asset.content?.metadata?.name || 'Credential';
  const symbol = asset.content?.metadata?.symbol || '';
  const attributes = asset.content?.metadata?.attributes || [];
  const issuedDate = attributes.find((a) => a.trait_type === 'Issue Date' || a.trait_type === 'Issued Date')?.value;
  const major = attributes.find((a) => a.trait_type === 'Major')?.value;
  const collection = asset.grouping?.find((g) => g.group_key === 'collection')?.group_value;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-2">
            <CardTitle className="text-lg line-clamp-2 mb-1">{title}</CardTitle>
            {symbol && (
              <Badge variant="outline" className="mt-1">
                {symbol}
              </Badge>
            )}
          </div>
          <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "var(--brand-surface)" }}>
            <Award className="h-5 w-5 text-brand" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {issuedDate && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Issued: {issuedDate}</span>
          </div>
        )}
        {major && (
          <div className="text-sm">
            <span className="font-medium">Major:</span> {major}
          </div>
        )}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 border-green-200">
            <ShieldCheck className="h-3 w-3 mr-1" />
            Verified on-chain
          </Badge>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="w-full"
        >
          <a
            href={`/verify?assetId=${asset.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Verify Credential
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}

function ShareProfile({ ownerBase58 }: { ownerBase58: string }) {
  const profileUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/passport?owner=${ownerBase58}`
      : '';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(profileUrl)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      // You could add a toast notification here
    } catch (e) {
      console.error('Failed to copy:', e);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="hidden md:block">
        <img src={qrUrl} alt="QR Code" width={60} height={60} className="rounded border" />
      </div>
      <Button variant="outline" size="sm" onClick={copy}>
        Copy Profile Link
      </Button>
    </div>
  );
}
