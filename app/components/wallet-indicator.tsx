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
      <WalletMultiButton className="bg-purple-600! hover:bg-purple-700! text-white! rounded-lg! h-9! px-4! text-sm! font-medium!" />
    </div>
  );
}


