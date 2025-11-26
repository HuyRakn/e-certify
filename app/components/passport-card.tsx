"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { ShieldCheck, ExternalLink, Award, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface DasAsset {
  id: string;
  content?: {
    metadata?: {
      name?: string;
      symbol?: string;
      attributes?: Array<{ trait_type: string; value: string }>;
    };
    json_uri?: string;
  };
  grouping?: Array<{ group_key: string; group_value: string }>;
  ownership?: {
    owner?: string;
  };
}

interface PassportCardProps {
  asset: DasAsset;
  index?: number;
}

export function PassportCard({ asset, index = 0 }: PassportCardProps) {
  const category = asset.grouping?.find(g => g.group_key === 'category')?.group_value || 'General';
  const issuedDate = asset.content?.metadata?.attributes?.find(a => a.trait_type === 'Issued Date')?.value || 
                     asset.content?.metadata?.attributes?.find(a => a.trait_type === 'Issue Date')?.value ||
                     'N/A';
  const certName = asset.content?.metadata?.name || `Certificate #${asset.id.slice(0, 8)}`;
  const institution = asset.content?.metadata?.attributes?.find(a => a.trait_type === 'Institution')?.value || 'APEC University';
  const credentialType = asset.content?.metadata?.attributes?.find(a => a.trait_type === 'Credential Type')?.value || 'Certificate';

  return (
    <Card
      className={cn(
        "bg-soft-surface shadow-soft hover:shadow-soft-lg transition-all duration-300 ease-soft overflow-hidden",
        "hover:-translate-y-1"
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3 mb-2">
              <div className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-[inset_0_1px_4px_rgba(255,255,255,0.6)]"
                style={{ backgroundColor: "rgba(147, 61, 255, 0.12)", color: "var(--brand-primary)" }}>
                <Award className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold text-soft-text line-clamp-2 leading-tight">
                  {certName}
                </CardTitle>
                <p className="text-xs text-soft-text-muted mt-1 font-medium">{institution}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Badge variant="secondary" className="text-xs font-semibold">
                {credentialType}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {category}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 pt-0">
        {/* Issue Date */}
        <div className="flex items-center gap-2 text-sm text-soft-text bg-[rgba(79,70,229,0.04)] p-3 rounded-xl">
          <Calendar className="h-4 w-4 text-soft-primary" />
          <span className="font-medium">Issued: {issuedDate}</span>
        </div>

        {/* Verification Badge */}
        <div className="flex items-center gap-2 p-4 rounded-2xl bg-[rgba(79,70,229,0.08)]">
          <ShieldCheck className="h-5 w-5 text-soft-primary shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-soft-text">Verified on-chain</p>
            <p className="text-xs text-soft-text-muted">Immutable proof on Solana blockchain</p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-4 pb-5">
        <Button
          asChild
          className="w-full shadow-soft font-semibold"
        >
          <a
            href={`/verify/${asset.id}`}
            className="flex items-center justify-center gap-2"
          >
            <ShieldCheck className="h-4 w-4" />
            Verify Certificate
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}


