// app/(platform)/dashboard/_components/student-dashboard.tsx
// All code and comments must be in English.
"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { EnhancedBannerHero } from "@/app/components/EnhancedBannerHero";
import { PopularCourses } from "@/app/components/PopularCourses";
import { CurrentActivity, ActivityStats } from "@/app/components/CurrentActivity";
import { BestInstructors } from "@/app/components/BestInstructors";
import { UserAvatar } from "@/app/components/user-avatar";
import { ShieldCheck, QrCode, Award } from "lucide-react";
import Link from "next/link";

export default function StudentDashboard() {
  const supabase = useMemo(() => createClient(), []);
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!mounted) return;
        
        setUserEmail(user?.email || undefined);

        if (user) {
          const { data: enrollments } = await supabase
            .from("enrollments")
            .select(`id, courses ( id, title, slug, description, thumbnail_url )`)
            .eq("user_id", user.id);

          if (mounted && enrollments && enrollments.length > 0) {
            setEnrolledCourses(enrollments as any[]);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  const popularCourses = enrolledCourses.length > 0 
    ? enrolledCourses.map((e: any) => e.courses)
    : [];

  return (
    <div className="space-y-6">
      {/* Block 1: Enhanced Banner Hero - Floating Card */}
      <EnhancedBannerHero />

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[4fr_1.5fr]">
        {/* Block 2: Left Column - Chart, Popular Courses & Stats in one floating card */}
        <div className="rounded-3xl border border-white/40 bg-white shadow-soft-sm p-6 space-y-6">
          <CurrentActivity />
          <PopularCourses courses={popularCourses} />
          <ActivityStats />
        </div>

        {/* Right Column - Profile & Instructors as separate floating blocks */}
        {/* Sticky wrapper - aligns with sidebar top position when scrolling */}
        {/* Sidebar: fixed left-4 top-4 (16px from viewport top) */}
        {/* Header: sticky top-4 (16px) with h-16 (64px) */}
        {/* Main container: pt-4 (16px) + header space */}
        {/* When main scrolls, sticky element should align with sidebar at viewport top-4 */}
        {/* Since main has overflow-y-auto, sticky is relative to main container */}
        {/* We use top-4 to match sidebar's top-4 position */}
        <div className="xl:sticky xl:top-4 xl:h-fit xl:self-start space-y-6">
          {/* Block 3: User Profile */}
          <Card className="border border-white/40 bg-white shadow-soft-sm rounded-3xl">
            <CardHeader className="pb-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="relative">
                  <UserAvatar value={userEmail || "user"} size={60} />
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-white"></div>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[11px] font-medium text-soft-text-muted uppercase tracking-wide">Active</p>
                  <p className="text-base font-semibold text-soft-text">
                    {userEmail?.split("@")[0] || "User"}
                  </p>
                  <p className="text-xs text-soft-text-muted truncate max-w-[160px]">{userEmail || "user@example.com"}</p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Block 4: Best Instructors */}
          <div className="rounded-3xl border border-white/40 bg-white shadow-soft-sm">
            <BestInstructors />
          </div>
        </div>
      </div>
    </div>
  );
}
