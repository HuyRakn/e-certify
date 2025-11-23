"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { BookOpen, Clock, Play } from "lucide-react";

export default function CourseCard({ course, isEnrolled }: { course: any; isEnrolled?: boolean }) {
  const thumbnailColors = [
    "bg-primary",
    "bg-secondary",
    "bg-accent",
    "bg-success",
    "bg-info",
  ];
  const colorIndex = Math.abs((course?.id?.charCodeAt(0) || 0) % thumbnailColors.length);

  return (
    <Card className="group flex h-full flex-col overflow-hidden transition-all hover:shadow-lg">
      <div className={cn("relative h-48 w-full overflow-hidden", thumbnailColors[colorIndex])}>
        <div className="absolute inset-0 flex items-center justify-center">
          <BookOpen className="h-16 w-16 text-white/20" />
        </div>
        {course?.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="h-full w-full object-cover"
          />
        ) : null}
        {isEnrolled && (
          <Badge className="absolute right-2 top-2 bg-primary text-primary-foreground">
            Enrolled
          </Badge>
        )}
      </div>
      <CardHeader>
        <CardTitle className="line-clamp-2 text-lg">{course?.title}</CardTitle>
        <CardDescription className="line-clamp-2">{course?.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col space-y-3">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>8 lessons</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            <span>Intermediate</span>
          </div>
        </div>
        <div className="mt-auto flex items-center gap-2">
          <Button
            asChild
            className={cn(
              "flex-1",
              isEnrolled ? "bg-secondary text-secondary-foreground hover:opacity-90" : ""
            )}
          >
            <Link href={`/courses/${course?.slug}`}>
              {isEnrolled ? (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Continue
                </>
              ) : (
                "View Details"
              )}
            </Link>
          </Button>
          {!isEnrolled && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={async (e) => {
                e.preventDefault();
                try {
                  await fetch("/api/demo/credentials", { method: "POST" });
                  toast.success("Enrolled successfully!");
                } catch {
                  toast.error("Failed to enroll");
                }
              }}
            >
              Enroll
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}




