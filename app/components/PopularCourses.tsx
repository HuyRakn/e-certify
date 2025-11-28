"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { ChevronDown, MoreVertical } from "lucide-react";
import Link from "next/link";

interface PopularCoursesProps {
  courses?: any[];
}

export function PopularCourses({ courses = [] }: PopularCoursesProps) {
  const [selectedFilter, setSelectedFilter] = useState("All Courses");

  const displayCourses = courses.length > 0 ? courses : [
    { 
      id: "1", 
      title: "Web Design", 
      slug: "web-design", 
      description: "20+ Courses"
    },
    { 
      id: "2", 
      title: "UI/UX Design", 
      slug: "uiux-design", 
      description: "38+ Courses"
    },
    { 
      id: "3", 
      title: "Product Strategy", 
      slug: "product-strategy", 
      description: "50+ Courses"
    },
    { 
      id: "4", 
      title: "Creative Coding", 
      slug: "creative-coding", 
      description: "18+ Courses"
    },
  ];

  const accentTokens = [
    { bg: "rgba(124, 62, 255, 0.14)", color: "var(--brand-primary)" },
    { bg: "rgba(124, 62, 255, 0.2)", color: "var(--brand-primary)" },
    { bg: "rgba(124, 62, 255, 0.12)", color: "var(--brand-primary)" },
    { bg: "rgba(124, 62, 255, 0.24)", color: "var(--brand-primary)" },
  ];

  return (
    <Card>
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-soft-text">
            Popular Courses
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-xs text-soft-text-muted h-8 px-3"
          >
            {selectedFilter}
            <ChevronDown className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          {displayCourses.map((course, index) => {
            const accent = accentTokens[index % accentTokens.length];

            return (
              <div
                key={course.id}
                className="group flex items-center gap-4 p-4 rounded-2xl bg-white shadow-soft-sm hover:shadow-soft hover:-translate-y-1 transition-all duration-300 ease-soft"
              >
                {/* Icon Circle */}
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-[inset_0_1px_4px_rgba(255,255,255,0.6)]"
                  style={{ backgroundColor: accent.bg, color: accent.color }}
                >
                  <span className="text-lg font-bold">
                    {course.title.charAt(0)}
                  </span>
                </div>

                {/* Course Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-soft-text truncate mb-0.5">
                    {course.title}
                  </h3>
                  <p className="text-xs text-soft-text-muted truncate">
                    {course.description}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-xs text-soft-primary hover:text-soft-primary font-medium h-8 px-4"
                    asChild
                  >
                    <Link href={`/courses/${course.slug}`}>
                      View course
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-soft-text-muted hover:text-soft-primary"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Link */}
        <Button
          variant="ghost"
          className="w-full mt-3 text-sm text-soft-primary font-medium"
          asChild
        >
          <Link href="/courses">
            View All Courses
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}