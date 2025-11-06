"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { ShieldCheck, ExternalLink, Award, Calendar, BookOpen } from "lucide-react";
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

  // Professional card design with gradient and shadows
  const cardGradients = [
    "from-purple-500/10 via-blue-500/5 to-purple-500/10",
    "from-blue-500/10 via-indigo-500/5 to-blue-500/10",
    "from-indigo-500/10 via-purple-500/5 to-indigo-500/10",
    "from-slate-500/10 via-blue-500/5 to-slate-500/10",
  ];
  const gradientClass = cardGradients[index % cardGradients.length];

  return (
    <Card
      className={cn(
        "border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 bg-white overflow-hidden",
        "hover:scale-[1.02] hover:-translate-y-1"
      )}
    >
      {/* Gradient Header */}
      <div className={cn("h-2 bg-linear-to-r", gradientClass)} />
      
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3 mb-2">
              <div className="h-12 w-12 rounded-lg bg-linear-to-br from-purple-500 to-blue-500 flex items-center justify-center shrink-0 shadow-md">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg font-bold text-slate-900 line-clamp-2 leading-tight">
                  {certName}
                </CardTitle>
                <p className="text-xs text-slate-500 mt-1 font-medium">{institution}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs font-semibold">
                {credentialType}
              </Badge>
              <Badge variant="outline" className="text-xs border-slate-300">
                {category}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 pt-0">
        {/* Issue Date */}
        <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
          <Calendar className="h-4 w-4 text-slate-500" />
          <span className="font-medium">Issued: {issuedDate}</span>
        </div>

        {/* Verification Badge */}
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <ShieldCheck className="h-5 w-5 text-green-600 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-green-900">Verified on-chain</p>
            <p className="text-xs text-green-700">Immutable proof on Solana blockchain</p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-4 pb-5">
        <Button
          asChild
          className="w-full bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-md hover:shadow-lg transition-all"
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


