// app/(platform)/admin/dashboard/page.tsx
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
import { DollarSign, Users, BookCopy, ShieldAlert, Award } from "lucide-react";

export default function AdminDashboard() {
  const supabase = useMemo(() => createClient(), []);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalUsers: 0,
    totalCourses: 0,
    pendingCertifications: 0,
  });

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        // Fetch total users
        const { data: users, count: userCount } = await supabase
          .from("profiles")
          .select("*", { count: 'exact', head: true });

        // Fetch total courses
        const { data: courses, count: courseCount } = await supabase
          .from("courses")
          .select("*", { count: 'exact', head: true });

        // Fetch pending certifications (mock for now)
        const pendingCertifications = 120;

        if (mounted) {
          setStats({
            totalRevenue: 45231.89,
            totalUsers: userCount || 0,
            totalCourses: courseCount || 0,
            pendingCertifications,
          });
        }
      } catch (error) {
        console.error("Error fetching admin data:", error);
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
            Admin Dashboard
          </h1>
          <p className="text-sm text-soft-text-muted">
            Manage the entire platform and all users
          </p>
        </div>

        {/* Site-Wide Stats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Platform Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{stats.totalUsers.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookCopy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{stats.totalCourses}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Certifications</CardTitle>
              <ShieldAlert className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingCertifications}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access Panels */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Assign roles and manage platform users.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <a href="/admin/users">Manage Users</a>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Course Management</CardTitle>
              <CardDescription>
                Review and approve courses from teachers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="default">
                <a href="/admin/courses">Manage Courses</a>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Certification Center</CardTitle>
              <CardDescription>
                Approve and batch-mint cNFT certificates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="destructive">
                <a href="/admin/certify">Go to Minting</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


