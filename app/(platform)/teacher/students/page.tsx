// app/(platform)/teacher/students/page.tsx
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
import { Input } from "@/app/components/ui/input";
import { Users, Search, BookOpen, TrendingUp, Clock } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";

interface Student {
  id: string;
  email: string;
  full_name: string | null;
  course_title: string;
  enrolled_at: string;
  progress?: number;
  course_id: string;
}

export default function TeacherStudentsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    avgProgress: 0,
  });

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;

        const { data: teacherCourses } = await supabase
          .from("courses")
          .select("id, title")
          .eq("instructor_id", user.id);

        if (!teacherCourses || teacherCourses.length === 0) {
          setLoading(false);
          return;
        }

        const courseIds = teacherCourses.map(c => c.id);

        const { data: enrollments } = await supabase
          .from("enrollments")
          .select("id, course_id, student_id, created_at")
          .in("course_id", courseIds);

        if (!enrollments) {
          setLoading(false);
          return;
        }

        const studentIds = [...new Set(enrollments.map(e => e.student_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", studentIds);

        const studentsWithDetails: Student[] = enrollments.map(enrollment => {
          const course = teacherCourses.find(c => c.id === enrollment.course_id);
          const profile = profiles?.find(p => p.id === enrollment.student_id);
          
          return {
            id: enrollment.student_id,
            email: "student@example.com", // Placeholder
            full_name: profile?.full_name || null,
            course_title: course?.title || "Unknown Course",
            enrolled_at: enrollment.created_at,
            progress: Math.floor(Math.random() * 100), // Mock progress
            course_id: enrollment.course_id,
          };
        });

        setStudents(studentsWithDetails);

        // Calculate stats
        const totalStudents = new Set(studentsWithDetails.map(s => s.id)).size;
        const activeStudents = studentsWithDetails.filter(s => (s.progress || 0) > 0).length;
        const avgProgress = studentsWithDetails.length > 0
          ? Math.round(studentsWithDetails.reduce((sum, s) => sum + (s.progress || 0), 0) / studentsWithDetails.length)
          : 0;

        setStats({
          totalStudents,
          activeStudents,
          avgProgress,
        });
      } catch (error) {
        console.error("Failed to fetch students:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [supabase]);

  const filteredStudents = students.filter(student =>
    student.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.course_title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[1600px] space-y-6 p-6 md:p-8 lg:p-10">
        {/* Page Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-[var(--brand-surface)] flex items-center justify-center">
              <Users className="h-6 w-6 text-brand" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-soft-text">
                My Students
              </h1>
              <p className="text-sm text-soft-text-muted mt-1">
                View and manage students enrolled in your courses
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
              <CardTitle className="text-sm font-medium text-soft-text">Active Students</CardTitle>
              <TrendingUp className="h-4 w-4 text-soft-text-muted" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-soft-text">{stats.activeStudents}</div>
            </CardContent>
          </Card>
          <Card className="border border-soft-border bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-soft-text">Avg. Progress</CardTitle>
              <Clock className="h-4 w-4 text-soft-text-muted" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-soft-text">{stats.avgProgress}%</div>
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
                placeholder="Search students by name or course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card className="border border-soft-border bg-white shadow-sm">
          <CardHeader>
            <CardTitle>All Students ({filteredStudents.length})</CardTitle>
            <CardDescription>
              Students enrolled in your courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto"></div>
                <p className="mt-4 text-sm text-soft-text-muted">Loading students...</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-12">
                <div className="h-16 w-16 rounded-full bg-soft-surface-muted flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-soft-text-muted" />
                </div>
                <p className="text-soft-text font-medium">No students found</p>
                <p className="text-sm text-soft-text-muted mt-1">No students have enrolled in your courses yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-soft-border">
                      <th className="text-left p-4 font-semibold text-soft-text">Name</th>
                      <th className="text-left p-4 font-semibold text-soft-text">Course</th>
                      <th className="text-left p-4 font-semibold text-soft-text">Progress</th>
                      <th className="text-left p-4 font-semibold text-soft-text">Enrolled</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr key={`${student.id}-${student.course_id}`} className="border-b border-soft-border hover:bg-soft-surface-muted transition-colors">
                        <td className="p-4">
                          <div className="font-medium text-soft-text">
                            {student.full_name || "Unknown User"}
                          </div>
                          <div className="text-xs text-soft-text-muted0 mt-0.5">{student.email}</div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-soft-text-muted" />
                            <span className="text-sm text-soft-text">{student.course_title}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-soft-surface-muted rounded-full h-2 max-w-[120px]">
                              <div
                                className="bg-brand h-2 rounded-full transition-all"
                                style={{ width: `${student.progress || 0}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-soft-text min-w-12">
                              {student.progress || 0}%
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-soft-text-muted">
                            {new Date(student.enrolled_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
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


