"use client";

import React from "react";
import { Button } from "@/app/components/ui/button";

export default function DashboardBanner() {
  return (
    <div className="relative overflow-hidden rounded-[24px] p-6 text-white shadow-soft-lg bg-soft-primary">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/15 blur-3xl" />
        <div className="absolute bottom-0 left-10 h-24 w-24 rounded-full bg-black/10 blur-2xl" />
      </div>
      <div className="relative z-10">
        <div className="text-xs tracking-wide uppercase opacity-80 mb-2">Online course</div>
        <div className="font-extrabold text-2xl leading-tight max-w-[640px]">
          Sharpen Your Skills With Professional Online Courses
        </div>
        <div className="mt-4">
          <Button className="bg-white text-soft-primary shadow-soft hover:bg-white">
            Join Now
          </Button>
        </div>
      </div>
    </div>
  );
}


