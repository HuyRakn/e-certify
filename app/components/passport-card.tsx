"use client";

import type { ComponentType } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { ShieldCheck, ExternalLink, Award, Calendar, Building2 } from "lucide-react";
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
  const category = asset.grouping?.find((g) => g.group_key === "category")?.group_value || "General";
  const issuedDate =
    asset.content?.metadata?.attributes?.find((a) => a.trait_type === "Issued Date")?.value ||
    asset.content?.metadata?.attributes?.find((a) => a.trait_type === "Issue Date")?.value ||
    "N/A";
  const certName = asset.content?.metadata?.name || `Certificate #${asset.id.slice(0, 8)}`;
  const institution =
    asset.content?.metadata?.attributes?.find((a) => a.trait_type === "Institution")?.value ||
    "APEC University";
  const credentialType =
    asset.content?.metadata?.attributes?.find((a) => a.trait_type === "Credential Type")?.value ||
    "Certificate";
  const major = asset.content?.metadata?.attributes?.find((a) => a.trait_type === "Major")?.value;
  const hasMajor = Boolean(major);

  return (
    <Card
      className={cn(
        "group relative flex h-full flex-col rounded-3xl border border-soft-border/70",
        "border-t-2 border-b-2 border-t-[var(--brand-primary)] border-b-[var(--brand-primary)]",
        "bg-white shadow-soft-sm hover:shadow-soft-lg",
        "transition-all duration-300 ease-soft overflow-hidden hover:-translate-y-1"
      )}
    >
      {/* Badge số thứ tự */}
      <div className="absolute top-4 right-4 z-10">
        <div className="h-8 w-8 rounded-full bg-[var(--brand-surface)] text-brand flex items-center justify-center shadow-soft-sm">
          <span className="text-xs font-semibold">{index + 1}</span>
        </div>
      </div>

      <CardHeader className="pb-0">
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 shrink-0 rounded-2xl bg-[var(--brand-surface)] text-brand flex items-center justify-center shadow-[inset_0_1px_4px_rgba(255,255,255,0.6)]">
            <Award className="h-6 w-6" />
          </div>
          <div className="space-y-2 flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-soft-text leading-tight line-clamp-2">
              {certName}
            </CardTitle>
            <p className="text-xs font-semibold text-soft-text-muted">{institution}</p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="text-[11px] font-semibold bg-[var(--brand-surface)] text-brand border-none">
                {credentialType}
              </Badge>
              <Badge variant="outline" className="text-[11px] border border-soft-border/70 text-soft-text-muted ring-0">
                {category}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-5">
        <div
          className={cn(
            "grid gap-3",
            hasMajor ? "grid-cols-[1fr_1.35fr]" : "grid-cols-1 sm:grid-cols-2"
          )}
        >
          <MetaItem icon={Calendar} label="Issued on" value={issuedDate} compact />
          {major && <MetaItem icon={Building2} label="Major" value={major} />}
        </div>

        <div className="flex items-center gap-3 rounded-2xl border-[0.5px] border-soft-border/70 bg-[var(--brand-surface)] px-4 py-3">
          <div className="h-11 w-11 rounded-xl bg-white/70 text-brand flex items-center justify-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.6)]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-soft-text">Verified on-chain</p>
            <p className="text-xs text-soft-text-muted">
              Immutable, tamper-proof credential anchored to Solana blockchain.
            </p>
          </div>
        </div>

        <div className="border-t border-soft-border/70 pt-3 text-xs text-soft-text-muted">
          <span className="font-mono text-[11px] text-soft-text truncate">ID: {asset.id}</span>
        </div>
      </CardContent>

      <CardFooter className="pt-2 pb-5 mt-auto">
        <Button asChild className="w-full brand-solid shadow-soft-sm font-semibold">
          <a href={`/verify?assetId=${asset.id}`} className="flex items-center justify-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            Verify Certificate
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}


function MetaItem({
  icon: Icon,
  label,
  value,
  compact = false,
  emphasis = false,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value?: string | null;
  compact?: boolean;
  emphasis?: boolean;
}) {
  const padding = compact ? "px-3 py-2" : "px-3 py-2.5";
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border border-soft-border/70 bg-white",
        padding
      )}
    >
      <div className="h-9 w-9 rounded-xl bg-[var(--brand-surface)] text-brand flex items-center justify-center">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-soft-text-muted">{label}</p>
        <p
          className={cn(
            "font-semibold text-soft-text truncate",
            emphasis ? "text-base" : "text-sm"
          )}
        >
          {value || "Not provided"}
        </p>
      </div>
    </div>
  );
}

