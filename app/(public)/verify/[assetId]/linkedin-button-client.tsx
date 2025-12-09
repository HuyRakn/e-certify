"use client";

import LinkedInShareButton from "../../../components/LinkedInShareButton";

interface LinkedInShareButtonClientProps {
  asset: any;
  assetId: string;
}

export default function LinkedInShareButtonClient({
  asset,
  assetId,
}: LinkedInShareButtonClientProps) {
  if (typeof window === 'undefined') {
    return null; // Server-side: don't render
  }
  
  const verifyUrl = `${window.location.origin}/verify/${assetId}`;
  
  return (
    <LinkedInShareButton
      asset={asset}
      assetId={assetId}
      verifyUrl={verifyUrl}
      className="flex-1 h-12"
    />
  );
}

