"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { cn } from "@/lib/utils";

interface WalletIndicatorProps {
  className?: string;
  showButton?: boolean;
}

export function WalletIndicator({ className, showButton = true }: WalletIndicatorProps) {
  if (!showButton) return null;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <WalletMultiButton className="wallet-button wallet-button--compact" />
    </div>
  );
}


