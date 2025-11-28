"use client";

import { cn } from "@/lib/utils";

const colors = [
  "bg-primary",
  "bg-secondary",
  "bg-accent",
  "bg-green-500",
  "bg-brand",
];

export function ProgressBars() {
  const bars = [
    { value: 72, label: "Frontend Dev" },
    { value: 54, label: "Design" },
    { value: 40, label: "Backend" },
    { value: 28, label: "Mobile" },
    { value: 20, label: "DevOps" },
  ];

  return (
    <div className="mt-6 space-y-4">
      {bars.map((bar, i) => (
        <div key={i} className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-muted-foreground">{bar.label}</span>
            <span className="font-semibold">{bar.value}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                colors[i % colors.length]
              )}
              style={{ width: `${bar.value}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}




