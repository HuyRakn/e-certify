// app/(platform)/admin/courses/page.tsx
// All code and comments must be in English.
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { BookCopy, Search, CheckCircle2, XCircle, Users, DollarSign, TrendingUp } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import Link from "next/link";

interface Course {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  price: number;
  is_published: boolean;
  created_at: string;
  instructor_id: string;
  instructor_name?: string;
}

export default function AdminCourseManagementPage() {
  const supabase = createClient();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    totalCourses: 0,
    publishedCourses: 0,
    pendingCourses: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Fetch all courses with instructor info
        const { data: coursesData, error } = await supabase
          .from("courses")
          .select(`
            id,
            title,
            description,
            slug,
            price,
            is_published,
            created_at,
            instructor_id,
            profiles!courses_instructor_id_fkey(full_name)
          `)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching courses:", error);
          setLoading(false);
          return;
        }

        if (coursesData) {
          const coursesWithInstructors = coursesData.map((course: any) => ({
            ...course,
            instructor_name: course.profiles?.full_name || "Unknown",
          }));

          setCourses(coursesWithInstructors);

          // Calculate stats
          const publishedCount = coursesWithInstructors.filter((c: Course) => c.is_published).length;
          const pendingCount = coursesWithInstructors.filter((c: Course) => !c.is_published).length;
          const totalRevenue = coursesWithInstructors.reduce((sum: number, c: Course) => sum + (c.price || 0), 0);

          setStats({
            totalCourses: coursesWithInstructors.length,
            publishedCourses: publishedCount,
            pendingCourses: pendingCount,
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

  const togglePublish = async (courseId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("courses")
        .update({ is_published: !currentStatus })
        .eq("id", courseId);

      if (error) {
        console.error("Error updating course:", error);
        alert("Failed to update course status");
      } else {
        // Update local state
        setCourses(courses.map(c => 
          c.id === courseId ? { ...c, is_published: !currentStatus } : c
        ));
      }
    } catch (error) {
      console.error("Error toggling publish:", error);
      alert("Failed to update course status");
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.instructor_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[1600px] space-y-6 p-6 md:p-8 lg:p-10">
        {/* Page Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-[var(--brand-surface)] flex items-center justify-center">
              <BookCopy className="h-6 w-6 text-brand" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-soft-text">
                Course Management
              </h1>
              <p className="text-sm text-soft-text-muted mt-1">
                Review and manage all courses on the platform
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card className="border border-soft-border bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-soft-text">Total Courses</CardTitle>
              <BookCopy className="h-4 w-4 text-soft-text-muted" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-soft-text">{stats.totalCourses}</div>
            </CardContent>
          </Card>
          <Card className="border border-soft-border bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-soft-text">Published</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-soft-text">{stats.publishedCourses}</div>
            </CardContent>
          </Card>
          <Card className="border border-soft-border bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-soft-text">Pending Review</CardTitle>
              <XCircle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-soft-text">{stats.pendingCourses}</div>
            </CardContent>
          </Card>
          <Card className="border border-soft-border bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-soft-text">Platform Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-soft-text-muted" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-soft-text">${stats.totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <Card className="border border-soft-border bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-soft-text-muted" />
              <Input
                type="search"
                placeholder="Search courses by title, description, or instructor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Courses Table */}
        <Card className="border border-soft-border bg-white shadow-sm">
          <CardHeader>
            <CardTitle>All Courses ({filteredCourses.length})</CardTitle>
            <CardDescription>
              Manage course publishing and review course details
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto"></div>
                <p className="mt-4 text-sm text-soft-text-muted">Loading courses...</p>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-12">
                <div className="h-16 w-16 rounded-full bg-soft-surface-muted flex items-center justify-center mx-auto mb-4">
                  <BookCopy className="h-8 w-8 text-soft-text-muted" />
                </div>
                <p className="text-soft-text font-medium">No courses found</p>
                <p className="text-sm text-soft-text-muted mt-1">No courses match your search criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-soft-border">
                      <th className="text-left p-4 font-semibold text-soft-text">Course</th>
                      <th className="text-left p-4 font-semibold text-soft-text">Instructor</th>
                      <th className="text-left p-4 font-semibold text-soft-text">Price</th>
                      <th className="text-left p-4 font-semibold text-soft-text">Status</th>
                      <th className="text-left p-4 font-semibold text-soft-text">Created</th>
                      <th className="text-left p-4 font-semibold text-soft-text">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCourses.map((course) => (
                      <tr key={course.id} className="border-b border-soft-border hover:bg-soft-surface-muted transition-colors">
                        <td className="p-4">
                          <div className="font-medium text-soft-text line-clamp-1">{course.title}</div>
                          <div className="text-xs text-soft-text-muted0 mt-0.5 line-clamp-1">{course.description || "No description"}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-soft-text">{course.instructor_name}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm font-medium text-soft-text">${course.price?.toFixed(2) || "0.00"}</div>
                        </td>
                        <td className="p-4">
                          <Badge
                            variant="outline"
                            className={course.is_published 
                              ? "bg-green-50 text-green-700 border-green-200" 
                              : "bg-yellow-50 text-yellow-700 border-yellow-200"
                            }
                          >
                            {course.is_published ? "Published" : "Draft"}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-soft-text-muted">
                            {new Date(course.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => togglePublish(course.id, course.is_published)}
                              className={course.is_published 
                                ? "text-yellow-700 hover:text-yellow-800" 
                                : "text-green-700 hover:text-green-800"
                              }
                            >
                              {course.is_published ? (
                                <>
                                  <XCircle className="mr-1 h-3 w-3" />
                                  Unpublish
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="mr-1 h-3 w-3" />
                                  Approve
                                </>
                              )}
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/courses/${course.slug}`}>
                                View
                              </Link>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


