// app/(platform)/teacher/courses/page.tsx
// All code and comments must be in English.
"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { BookOpen, Plus, Edit, Eye, Users, TrendingUp, DollarSign, Calendar } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";

interface Course {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  price: number;
  is_published: boolean;
  created_at: string;
  enrollment_count?: number;
}

export default function TeacherCoursesPage() {
  const supabase = useMemo(() => createClient(), []);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    publishedCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;

        const { data: teacherCourses, error } = await supabase
          .from("courses")
          .select("id, title, description, slug, price, is_published, created_at")
          .eq("instructor_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching courses:", error);
          setLoading(false);
          return;
        }

        if (teacherCourses) {
          const courseIds = teacherCourses.map(c => c.id);
          
          const { data: enrollments } = await supabase
            .from("enrollments")
            .select("course_id")
            .in("course_id", courseIds);

          const enrollmentCounts = enrollments?.reduce((acc: Record<string, number>, e) => {
            acc[e.course_id] = (acc[e.course_id] || 0) + 1;
            return acc;
          }, {}) || {};

          const coursesWithCounts = teacherCourses.map(course => ({
            ...course,
            enrollment_count: enrollmentCounts[course.id] || 0,
          }));

          setCourses(coursesWithCounts);
          
          // Calculate stats
          const publishedCount = coursesWithCounts.filter(c => c.is_published).length;
          const totalStudents = Object.values(enrollmentCounts).reduce((a: number, b: number) => a + b, 0) as number;
          const totalRevenue = coursesWithCounts.reduce((sum, c) => {
            return sum + (c.price * (enrollmentCounts[c.id] || 0));
          }, 0);

          setStats({
            totalCourses: coursesWithCounts.length,
            publishedCourses: publishedCount,
            totalStudents,
            totalRevenue,
          });
        }
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [supabase]);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[1600px] space-y-6 p-6 md:p-8 lg:p-10">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-[var(--brand-surface)] flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-brand" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-soft-text">
                  My Courses
                </h1>
                <p className="text-sm text-soft-text-muted mt-1">
                  Manage and edit your courses
                </p>
              </div>
            </div>
          </div>
          <Button asChild className="bg-brand hover:bg-[var(--brand-hover)] text-white">
            <Link href="/create-course">
              <Plus className="mr-2 h-4 w-4" />
              Create Course
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card className="border border-soft-border bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-soft-text">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-soft-text-muted" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-soft-text">{stats.totalCourses}</div>
            </CardContent>
          </Card>
          <Card className="border border-soft-border bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-soft-text">Published</CardTitle>
              <TrendingUp className="h-4 w-4 text-soft-text-muted" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-soft-text">{stats.publishedCourses}</div>
            </CardContent>
          </Card>
          <Card className="border border-soft-border bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-soft-text">Total Students</CardTitle>
              <Users className="h-4 w-4 text-soft-text-muted" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-soft-text">{stats.totalStudents}</div>
            </CardContent>
          </Card>
          <Card className="border border-soft-border bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-soft-text">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-soft-text-muted" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-soft-text">${stats.totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Courses List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto"></div>
            <p className="mt-4 text-sm text-soft-text-muted">Loading courses...</p>
          </div>
        ) : courses.length === 0 ? (
          <Card className="border border-soft-border bg-white shadow-sm">
            <CardContent className="pt-12 pb-12">
              <div className="text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-soft-surface-muted flex items-center justify-center mx-auto">
                  <BookOpen className="h-8 w-8 text-soft-text-muted" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-soft-text">No courses yet</h3>
                  <p className="text-sm text-soft-text-muted max-w-md mx-auto">
                    Start creating your first course to share your knowledge with students.
                  </p>
                </div>
                <Button asChild className="bg-brand hover:bg-[var(--brand-hover)] text-white mt-4">
                  <Link href="/create-course">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Course
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Card key={course.id} className="flex flex-col border border-soft-border bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 pr-2">
                      <CardTitle className="line-clamp-2 text-lg mb-2">{course.title}</CardTitle>
                      <CardDescription className="line-clamp-2 text-sm">
                        {course.description || "No description"}
                      </CardDescription>
                    </div>
                    <Badge
                      variant="outline"
                      className={course.is_published 
                        ? "bg-green-50 text-green-700 border-green-200" 
                        : "bg-yellow-50 text-yellow-700 border-yellow-200"
                      }
                    >
                      {course.is_published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col space-y-4">
                  <div className="flex items-center gap-4 text-sm text-soft-text-muted">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">{course.enrollment_count || 0}</span>
                      <span className="text-soft-text-muted0">students</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-medium">${course.price.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-soft-text-muted0">
                    <Calendar className="h-3 w-3" />
                    <span>Created {new Date(course.created_at).toLocaleDateString()}</span>
                  </div>
                </CardContent>
                <CardContent className="pt-0">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link href={`/courses/${course.slug}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


