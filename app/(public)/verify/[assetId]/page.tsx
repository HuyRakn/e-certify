// app/(public)/verify/[assetId]/page.tsx
// Public verification page - no authentication required
// All code and comments must be in English.

"use client"; // We need this for the framer-motion wrapper

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { ShieldCheck, ExternalLink, Calendar, Award, Building2, CheckCircle2, GraduationCap, Sparkles, AlertTriangle } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { getDemoCertificateById } from "../../../../lib/demo-certificates";
import VerificationPage from "../../../components/VerificationPage";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";

// This is a server component that fetches certificate data
// We make the main component async to fetch data
export default async function VerifierPage({ params }: { params: Promise<{ assetId: string }> }) {
  const { assetId } = await params;
  
  // Always try to get demo certificate first
  const demoCert = getDemoCertificateById(assetId);
  
  // Reusable Banner Component
  const ContestBanner = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.5 }}
      className="mt-8"
    >
      <a 
        href="https://earn.superteam.fun/listing/build-on-apec-education-ecosystem-using-solana" 
        target="_blank" 
        rel="noopener noreferrer"
        className="block p-4 bg-white border-2 border-blue-100 rounded-xl hover:shadow-lg transition-shadow duration-300 group"
      >
        <div className="flex items-center gap-4">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Sparkles className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-blue-900">Join the APEC Education Ecosystem Bounty!</p>
            <p className="text-sm text-blue-700">Build on Solana and win prizes. Click to learn more.</p>
          </div>
          <ExternalLink className="h-5 w-5 text-blue-500 ml-auto transform group-hover:scale-110 transition-transform" />
        </div>
      </a>
    </motion.div>
  );

  // If demo cert exists, render it directly with animations
  if (demoCert) {
    const issuedDate = demoCert.content.metadata.attributes.find(a => a.trait_type === 'Issued Date')?.value || 'N/A';
    const institution = demoCert.content.metadata.attributes.find(a => a.trait_type === 'Institution')?.value || 'APEC University';
    const credentialType = demoCert.content.metadata.attributes.find(a => a.trait_type === 'Credential Type')?.value || 'Certificate';
    const category = demoCert.grouping.find(g => g.group_key === 'category')?.group_value || 'General';

    // Wrapper for card animations
    const AnimatedCard = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: delay * 0.2 }}
      >
        {children}
      </motion.div>
    );

    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Success Header */}
          <AnimatedCard delay={0}>
            <Card className="border-2 border-green-200 bg-white shadow-lg overflow-hidden">
              <CardHeader className="bg-green-50 p-6">
                <div className="flex items-center gap-4">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.3 }}
                  >
                    <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center border-4 border-white shadow-md">
                      <ShieldCheck className="h-8 w-8 text-green-600" />
                    </div>
                  </motion.div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl text-green-900 flex items-center gap-2">
                      <CheckCircle2 className="h-6 w-6" />
                      Credential Verified
                    </CardTitle>
                    <CardDescription className="text-green-700 mt-1 text-base">
                      This certificate is verified as authentic on the Solana blockchain.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </AnimatedCard>

          {/* Certificate Details */}
          <AnimatedCard delay={1}>
            <Card className="shadow-lg border-2 border-gray-100 bg-white">
              <CardHeader className="border-b border-gray-100 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                      {demoCert.content.metadata.name}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                        {credentialType}
                      </Badge>
                      <Badge variant="secondary" className="bg-gray-100 text-gray-800 border-gray-200">
                        {category}
                      </Badge>
                    </div>
                  </div>
                  <motion.div
                     whileHover={{ rotate: [0, 10, -10, 0], scale: 1.1 }}
                     transition={{ duration: 0.5 }}
                  >
                    <div className="h-20 w-20 rounded-xl bg-white shadow-md border border-gray-100 flex items-center justify-center">
                      <GraduationCap className="h-10 w-10 text-blue-600" />
                    </div>
                  </motion.div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4 p-6">
                {/* Institution */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <Building2 className="h-5 w-5 text-gray-600 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Institution</p>
                    <p className="text-lg font-semibold text-gray-900">{institution}</p>
                  </div>
                </div>

                {/* Issue Date */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <Calendar className="h-5 w-5 text-gray-600 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Issued Date</p>
                    <p className="text-lg font-semibold text-gray-900">{issuedDate}</p>
                  </div>
                </div>

                {/* Owner Wallet Address */}
                {demoCert.ownership?.owner && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <Award className="h-5 w-5 text-gray-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Owner Wallet</p>
                      <p className="text-sm font-mono text-gray-900 mt-1 break-all">{demoCert.ownership.owner}</p>
                    </div>
                  </div>
                )}

                {/* Additional Attributes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {demoCert.content.metadata.attributes
                    .filter(attr => 
                      attr.trait_type !== 'Issued Date' && 
                      attr.trait_type !== 'Institution' &&
                      attr.trait_type !== 'Credential Type'
                    )
                    .map((attr, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{attr.trait_type}</p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">{attr.value}</p>
                      </div>
                    ))}
                </div>

                {/* Description */}
                {demoCert.content.metadata.description && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs font-medium text-blue-900 uppercase tracking-wide mb-2">Description</p>
                    <p className="text-sm text-blue-800">{demoCert.content.metadata.description}</p>
                  </div>
                )}

                {/* Verification Proof */}
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldCheck className="h-5 w-5 text-green-600" />
                    <p className="text-sm font-semibold text-green-900">On-Chain Verification</p>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-medium text-green-700 uppercase tracking-wide">Asset ID</p>
                      <p className="text-xs text-green-800 font-mono break-all mt-1">{assetId}</p>
                    </div>
                    <p className="text-xs text-green-700 mt-2">
                      ✓ Verified on Solana blockchain via Compressed NFT (cNFT)
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      This certificate is permanently stored on-chain and cannot be tampered with.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimatedCard>

          {/* Actions */}
          <AnimatedCard delay={2}>
            <Button
              asChild
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base font-semibold transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-blue-200"
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
          </AnimatedCard>

          {/* Banner */}
          <ContestBanner />
        </div>
      </div>
    );
  }

  // Fallback to VerificationPage component for other assets
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <VerificationPage assetId={assetId} />
        <ContestBanner />
      </div>
    </div>
  );
}