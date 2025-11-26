import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold transition-all duration-300 ease-soft focus:outline-none focus:ring-2 focus:ring-ring/30 focus:ring-offset-0 shadow-soft-sm",
  {
    variants: {
      variant: {
        default: "bg-[rgba(79,70,229,0.12)] text-soft-primary hover:bg-[rgba(79,70,229,0.18)]",
        secondary: "bg-soft-surface text-soft-text hover:bg-soft-surface-muted",
        destructive: "bg-destructive/15 text-destructive hover:bg-destructive/20",
        outline: "bg-transparent ring-1 ring-soft-border text-soft-text",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

