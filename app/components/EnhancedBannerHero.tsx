"use client";

import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Sparkles, ArrowRight } from "lucide-react";

export function EnhancedBannerHero() {
  return (
    <div
      className="relative overflow-hidden rounded-3xl text-white shadow-soft"
      style={{ backgroundColor: "var(--brand-primary)" }}
    >
      <div className="relative p-8 md:p-10">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
          {/* Left Content */}
          <div className="max-w-2xl space-y-4">
            {/* Badge */}
            <Badge 
              variant="outline" 
              className="ring-0 border border-white/30 bg-white/20 text-white backdrop-blur-sm px-3 py-1 text-xs font-semibold"
            >
              <Sparkles className="h-3 w-3 mr-1.5" />
              Learn Effectively With Us!
            </Badge>

            {/* Headline */}
            <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
              Get 30% Off every courses in January.
            </h2>
            
            <p className="text-sm md:text-base text-white/90">
              Start your learning journey today and unlock your potential with professional courses from industry experts.
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                size="default"
                className="rounded-full bg-white shadow-lg hover:bg-gray-50 font-semibold"
                style={{ color: "var(--brand-primary)" }}
              >
                Explore Courses
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="default"
                className="border border-white/40 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm font-semibold"
              >
                Learn More
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}