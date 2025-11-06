// app/(platform)/dashboard/_components/student-dashboard.tsx
// All code and comments must be in English.
"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { EnhancedBannerHero } from "@/app/components/EnhancedBannerHero";
import { PopularCourses } from "@/app/components/PopularCourses";
import { CurrentActivity } from "@/app/components/CurrentActivity";
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
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[1600px] space-y-6 p-6 md:p-8 lg:p-10">
        {/* Page Header */}
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            Analytics Overview
          </h1>
          <p className="text-sm text-slate-600">
            Track your learning progress and achievements
          </p>
        </div>

        {/* Enhanced Banner Hero */}
        <EnhancedBannerHero />

        {/* Quick Access Cards - Skills Passport & Verification */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card className="border border-purple-200 bg-purple-50 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-purple-600" />
                Skills Passport
              </CardTitle>
              <CardDescription>
                View and manage all your on-chain certificates and achievements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                <Link href="/passport">
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Open Skills Passport
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-green-200 bg-green-50 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-green-600" />
                Verify Credentials
              </CardTitle>
              <CardDescription>
                Scan QR code or verify any credential instantly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                <Link href="/verify">
                  <QrCode className="mr-2 h-4 w-4" />
                  Verify Now
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr_380px] gap-6">
          {/* Left Sidebar - Popular Courses */}
          <div className="space-y-6">
            <PopularCourses courses={popularCourses} />
          </div>

          {/* Center Content - Current Activity */}
          <div className="space-y-6">
            <CurrentActivity />
          </div>

          {/* Right Sidebar - User Profile & Best Instructors */}
          <div className="space-y-6">
            {/* User Profile Card */}
            <Card className="border border-slate-200 bg-white shadow-sm">
              <CardHeader className="pb-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="relative">
                    <UserAvatar value={userEmail || "user"} size={72} />
                    <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-green-500 border-3 border-white"></div>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-slate-500">Good Morning</p>
                    <p className="text-lg font-bold text-slate-900">
                      {userEmail?.split("@")[0] || "User"}
                    </p>
                    <p className="text-xs text-slate-500">{userEmail || "user@example.com"}</p>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <BestInstructors />
          </div>
        </div>
      </div>
    </div>
  );
}
