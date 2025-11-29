// app/(platform)/teacher/dashboard/page.tsx
// All code and comments must be in English.
"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { DollarSign, Users, BarChart2, BookOpen, ShieldCheck, QrCode } from "lucide-react";
import { UserAvatar } from "@/app/components/user-avatar";
import Link from "next/link";

export default function TeacherDashboard() {
  const supabase = useMemo(() => createClient(), []);
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalStudents: 0,
    avgProgress: 0,
    totalCourses: 0,
  });

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!mounted || !user) return;
        
        setUserEmail(user?.email || undefined);

        // Fetch teacher's courses
        const { data: courses } = await supabase
          .from("courses")
          .select("id, title")
          .eq("instructor_id", user.id);

        // Fetch enrollments for teacher's courses
        const courseIds = courses?.map(c => c.id) || [];
        let totalStudents = 0;
        if (courseIds.length > 0) {
          const { data: enrollments } = await supabase
            .from("enrollments")
            .select("id")
            .in("course_id", courseIds);
          
          totalStudents = enrollments?.length || 0;
        }

        // Calculate average progress (mock for now)
        const avgProgress = 62;

        if (mounted) {
          setStats({
            totalRevenue: 1250.00,
            totalStudents,
            avgProgress,
            totalCourses: courses?.length || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching teacher data:", error);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[1600px] space-y-6 p-6 md:p-8 lg:p-10">
        {/* Page Header */}
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-bold text-soft-text">
            Teacher Dashboard
          </h1>
          <p className="text-sm text-soft-text-muted">
            Manage your courses and track student progress
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{stats.totalStudents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Progress</CardTitle>
              <BarChart2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgProgress}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCourses}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Manage Your Courses</CardTitle>
              <CardDescription>
                View, edit, or create new courses for your students.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/teacher/courses">Go to Course Manager</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Create New Course</CardTitle>
              <CardDescription>
                Start a new course and share your knowledge.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="default">
                <Link href="/create-course">Create Course</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="border border-brand/30 bg-[var(--brand-surface)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-brand" />
                Skills Passport
              </CardTitle>
              <CardDescription>
                View your on-chain certificates and achievements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-brand hover:bg-[var(--brand-hover)]">
                <Link href="/passport">
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Open Passport
                </Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="border border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-green-600" />
                Verify Credentials
              </CardTitle>
              <CardDescription>
                Scan QR code to verify credentials instantly
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
      </div>
    </div>
  );
}


