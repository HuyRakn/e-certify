// app/(platform)/courses/page.tsx
// All code and comments must be in English.
"use client";

import { useEffect, useState } from "react";
import CourseCard from "@/app/components/course-card";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import { Search, Filter, BookOpen, TrendingUp, Clock } from "lucide-react";
import { Button } from "@/app/components/ui/button";

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const supabase = createClient();

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const { data, error } = await supabase
          .from("courses")
          .select("*")
          .eq("is_published", true)
          .order("created_at", { ascending: false });
        
        if (error) {
          const errorMessage = error.message || String(error);
          const isTableNotFound = errorMessage.includes("Could not find the table") || 
                                  errorMessage.includes("does not exist");
          
          if (isTableNotFound) {
            console.info("Courses table not found in Supabase, using mock data");
          } else {
            console.warn("Supabase query error:", errorMessage);
          }
        } else if (data && data.length > 0) {
          setCourses(data);
          setLoading(false);
          return;
        }
        
        try {
          const res = await fetch("/api/courses");
          if (res.ok) {
            const apiData = await res.json();
            if (apiData && Array.isArray(apiData) && apiData.length > 0) {
              setCourses(apiData);
              setLoading(false);
              return;
            }
          }
        } catch (apiError) {
          // Silently continue to mock data
        }
        
        // Fallback: Mock data
        setCourses([
          {
            id: "c1",
            title: "Beginner's Guide To Becoming A Professional Frontend Developer",
            slug: "frontend-101",
            description: "Learn React, UI, and tooling to build modern web applications.",
            thumbnail_url: "",
            price: 49.99,
            is_published: true,
          },
          {
            id: "c2",
            title: "Product Design Essentials",
            slug: "product-design",
            description: "Master design thinking, prototyping, and user experience principles.",
            thumbnail_url: "",
            price: 39.99,
            is_published: true,
          },
        ]);
      } catch (error: any) {
        const errorMessage = error?.message || String(error) || "Unknown error";
        const isTableNotFound = errorMessage.includes("Could not find the table") || 
                                errorMessage.includes("does not exist");
        
        if (!isTableNotFound) {
          console.error("Failed to load courses:", errorMessage);
        }
        
        setCourses([
          {
            id: "c1",
            title: "Beginner's Guide To Becoming A Professional Frontend Developer",
            slug: "frontend-101",
            description: "Learn React, UI, and tooling.",
            thumbnail_url: "",
            price: 49.99,
          },
          {
            id: "c2",
            title: "Product Design Essentials",
            slug: "product-design",
            description: "Design thinking & prototyping.",
            thumbnail_url: "",
            price: 39.99,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [supabase]);

  const filteredCourses = courses.filter((course) =>
    course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[1600px] space-y-6 p-6 md:p-8 lg:p-10">
        {/* Page Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-[var(--brand-surface)] flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-brand" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-soft-text">
                Browse Courses
              </h1>
              <p className="text-sm text-soft-text-muted mt-1">
                Discover new skills and advance your career
              </p>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border border-soft-border bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-soft-text-muted">Total Courses</p>
                  <p className="text-2xl font-bold text-soft-text mt-1">{courses.length}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-[var(--brand-surface)] flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-brand" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-soft-border bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-soft-text-muted">Available Now</p>
                  <p className="text-2xl font-bold text-soft-text mt-1">{filteredCourses.length}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-[var(--brand-surface)] flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-brand" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-soft-border bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-soft-text-muted">Average Duration</p>
                  <p className="text-2xl font-bold text-soft-text mt-1">8h</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="border border-soft-border bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-soft-text-muted" />
                <Input
                  placeholder="Search courses by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="shrink-0">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Courses Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="border border-soft-border animate-pulse">
                <div className="h-48 bg-soft-surface-muted" />
                <CardContent className="p-6">
                  <div className="h-4 w-3/4 bg-soft-surface-muted rounded" />
                  <div className="mt-2 h-4 w-1/2 bg-soft-surface-muted rounded" />
                  <div className="mt-4 h-8 w-full bg-soft-surface-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredCourses.length > 0 ? (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-soft-text-muted">
                Showing <span className="font-semibold text-soft-text">{filteredCourses.length}</span> course{filteredCourses.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch">
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </>
        ) : (
          <Card className="border border-soft-border bg-white shadow-sm">
            <CardContent className="py-16">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-soft-surface-muted flex items-center justify-center">
                  <Search className="h-8 w-8 text-soft-text-muted" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold text-soft-text">No courses found</h3>
                  <p className="text-sm text-soft-text-muted max-w-md">
                    Try adjusting your search terms or filters to find what you're looking for.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

