"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold tracking-tight transition-all duration-300 ease-soft focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50 shadow-soft-sm",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:-translate-y-0.5 hover:shadow-soft hover:bg-primary/90",
        secondary:
          "bg-soft-surface text-soft-text shadow-soft-sm hover:bg-[rgba(79,70,229,0.05)] hover:-translate-y-0.5",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/80",
        ghost:
          "bg-transparent text-soft-text hover:bg-[rgba(79,70,229,0.08)] hover:text-primary hover:-translate-y-0.5",
        link: "underline-offset-4 hover:underline text-primary",
        outline:
          "bg-soft-surface text-soft-text ring-1 ring-[rgba(79,70,229,0.18)] hover:ring-[rgba(79,70,229,0.35)] hover:bg-[rgba(79,70,229,0.04)] hover:-translate-y-0.5",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-4",
        lg: "h-12 px-7",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = "Button";




