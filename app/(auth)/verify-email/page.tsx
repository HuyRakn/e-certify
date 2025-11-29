// app/(auth)/verify-email/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { Mail, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function VerifyEmailPage() {
  const supabase = createClient();
  const [email, setEmail] = useState<string>("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email || "");
    });
  }, []);

  const resend = async () => {
    setSending(true);
    setError(null);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
      setSent(true);
    } catch (e: any) {
      setError(e?.message || "Failed to resend verification email");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-soft-surface-muted p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader>
          <CardTitle className="text-2xl">Verify your email</CardTitle>
          <CardDescription>
            We sent a verification link to {email || "your email"}. Please verify to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 text-soft-text">
            <Mail className="h-5 w-5 text-brand" />
            <span>Didn&apos;t get the email?</span>
          </div>
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">{error}</div>
          )}
          {sent && (
            <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">
              Verification email sent. Please check your inbox.
            </div>
          )}
          <div className="flex gap-3">
            <Button onClick={resend} disabled={!email || sending} className="bg-brand hover:bg-[var(--brand-hover)]">
              <RefreshCw className="h-4 w-4 mr-2" />
              {sending ? "Sending..." : "Resend verification email"}
            </Button>
            <Link href="/login" className="ml-auto text-sm text-soft-text-muted hover:text-soft-text self-center">Back to sign in</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



