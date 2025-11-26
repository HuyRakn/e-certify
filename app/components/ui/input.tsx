import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-[var(--radius-input)] border-0 bg-soft-input px-4 text-sm text-soft-text placeholder:text-soft-text-muted shadow-[inset_0_1px_3px_rgba(15,23,42,0.08)] transition-all duration-300 ease-soft ring-offset-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/30 focus-visible:bg-white focus-visible:shadow-soft-sm disabled:cursor-not-allowed disabled:opacity-60",
          className
        )}
        ref={ref}
        suppressHydrationWarning
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };




