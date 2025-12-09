"use client";

import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { buildLinkedInUrl, extractMetadataForLinkedIn, LinkedInShareParams } from '@/lib/utils/linkedin-share';

interface LinkedInShareButtonProps {
  asset: any; // DAS Asset
  assetId: string;
  verifyUrl: string; // Absolute URL to verification page
  className?: string;
}

export default function LinkedInShareButton({
  asset,
  assetId,
  verifyUrl,
  className = '',
}: LinkedInShareButtonProps) {
  const handleShare = () => {
    try {
      // Extract metadata from asset
      const metadata = extractMetadataForLinkedIn(asset);
      
      // Build LinkedIn URL
      const linkedInUrl = buildLinkedInUrl({
        ...metadata,
        verifyUrl,
        assetId,
      });
      
      // Open LinkedIn in new tab
      window.open(linkedInUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Failed to share to LinkedIn:', error);
      alert('Failed to open LinkedIn. Please try again.');
    }
  };
  
  return (
    <Button
      onClick={handleShare}
      className={`bg-[#0077b5] hover:bg-[#005885] text-white ${className}`}
    >
      <ExternalLink className="h-4 w-4 mr-2" />
      Add to LinkedIn
    </Button>
  );
}

