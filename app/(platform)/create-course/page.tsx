// app/(platform)/create-course/page.tsx
// All code and comments must be in English.
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
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
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateCoursePage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    slug: "",
    price: "0",
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData({
      ...formData,
      title,
      slug: formData.slug || generateSlug(title),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("You must be logged in to create a course");
      }

      // Validate slug uniqueness
      const { data: existingCourse } = await supabase
        .from("courses")
        .select("id")
        .eq("slug", formData.slug)
        .single();

      if (existingCourse) {
        throw new Error("A course with this slug already exists. Please choose a different one.");
      }

      // Create course
      const { data: course, error: createError } = await supabase
        .from("courses")
        .insert({
          title: formData.title,
          description: formData.description || null,
          slug: formData.slug,
          price: parseFloat(formData.price) || 0,
          instructor_id: user.id,
          is_published: false, // Start as draft
        })
        .select()
        .single();

      if (createError) {
        throw new Error(createError.message || "Failed to create course");
      }

      // Redirect to course edit page or teacher courses
      router.push(`/teacher/courses`);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl space-y-6 p-6 md:p-8 lg:p-10">
        {/* Page Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/teacher/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-bold text-soft-text">
              Create New Course
            </h1>
            <p className="text-sm text-soft-text-muted">
              Start a new course and share your knowledge
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
              <CardDescription>
                Fill in the details for your new course
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Course Title *
                </label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={handleTitleChange}
                  placeholder="e.g., Introduction to Web Development"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  Slug *
                </label>
                <Input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: generateSlug(e.target.value) })
                  }
                  placeholder="auto-generated-from-title"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  URL-friendly version of your title (auto-generated)
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  Description
                </label>
                <textarea
                  className="w-full rounded-md border px-3 py-2 min-h-[100px]"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe what students will learn in this course..."
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  Price (USD) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  placeholder="0.00"
                  required
                />
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Course"}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/teacher/dashboard">Cancel</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}


