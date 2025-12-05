// app/(auth)/signup/page.tsx
// All code and comments must be in English.
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import Link from "next/link";
import { GraduationCap, Lock, Mail, UserCheck } from "lucide-react";

export default function SignUpPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { 
          role,
          full_name: fullName || null,
        },
      },
    });
    
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: "student" as const, label: "Student", desc: "Learn and earn certificates" },
    { value: "teacher" as const, label: "Teacher", desc: "Create and teach courses" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-soft-bg p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-brand shadow-soft mb-4">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-soft-text">Create your account</h1>
          <p className="text-soft-text-muted">Join E-Certify and start your learning journey</p>
        </div>

        {/* Signup Card */}
        <Card className="shadow-soft-lg border border-soft-border/60 bg-soft-surface backdrop-blur-2xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-semibold">Get started</CardTitle>
            <CardDescription>Fill in your details to create your account</CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="text-center space-y-4 py-6">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mx-auto">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-soft-text">Check your email</h3>
                  <p className="text-sm text-soft-text-muted">
                    We sent a verification link to <span className="font-medium">{email}</span>
                  </p>
                  <p className="text-sm text-soft-text-muted">Please check your inbox and click the link to verify your account.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={signUp} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="fullName" className="text-sm font-medium text-soft-text flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    Full Name (Optional)
                  </label>
                  <Input
                    id="fullName"
                    className="w-full h-11"
                    placeholder="John Doe"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-soft-text flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </label>
                  <Input
                    id="email"
                    className="w-full h-11"
                    placeholder="you@example.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-soft-text flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Password
                  </label>
                  <Input
                    id="password"
                    className="w-full h-11"
                    placeholder="At least 6 characters"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-soft-text-muted">Must be at least 6 characters long</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-soft-text">Choose your role</label>
                  <div className="grid grid-cols-2 gap-2">
                    {roleOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setRole(option.value)}
                        className={`p-3 rounded-lg border-2 transition-all text-center ${
                          role === option.value
                            ? "border-brand bg-[var(--brand-surface)] text-brand"
                            : "border-soft-border hover:border-soft-border text-soft-text"
                        }`}
                      >
                        <div className="text-xs font-semibold mb-1">{option.label}</div>
                        <div className="text-[10px] text-soft-text-muted">{option.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 brand-solid shadow-soft-sm"
                  disabled={!email || !password || loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                      Creating...
                    </span>
                  ) : (
                    "Create account"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-3 pt-4 border-t">
            <p className="text-sm text-soft-text-muted text-center">
              Already have an account?{" "}
              <Link href="/login" className="text-brand hover:text-brand-hover font-medium hover:underline">
                Sign in
              </Link>
            </p>
            <Link href="/" className="text-sm text-soft-text-muted hover:text-soft-text text-center">
              ← Back to home
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

