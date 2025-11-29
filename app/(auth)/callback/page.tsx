// app/(auth)/callback/page.tsx
// All code and comments must be in English.
"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function AuthCallbackContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const supabase = createClient();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        const code = sp.get("code");
        
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (!mounted) return;

          if (error) {
            console.error("Exchange code error:", error);
            setStatus("error");
            setTimeout(() => {
              if (mounted) router.replace("/login?error=invalid_code");
            }, 1000);
            return;
          }

          if (data.session) {
            // Wait a moment for cookies to be set
            setStatus("success");
            setTimeout(() => {
              if (mounted) {
                window.location.href = "/dashboard";
              }
            }, 500);
            return;
          }
        }

        // Fallback: try passing full URL for providers that append additional params
        const { data: data2, error: err2 } = await supabase.auth.exchangeCodeForSession(window.location.href as any);
        if (!mounted) return;

        if (!err2 && data2.session) {
          setStatus("success");
          setTimeout(() => {
            if (mounted) {
              window.location.href = "/dashboard";
            }
          }, 500);
          return;
        }
      } catch (error) {
        console.error("Callback error:", error);
        if (!mounted) return;
        setStatus("error");
      }

      // If we get here, something went wrong
      if (mounted) {
        setTimeout(() => {
          router.replace("/login?error=callback_failed");
        }, 1000);
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, [router, sp, supabase]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto"></div>
          <p className="mt-4 text-sm text-soft-text-muted">Completing sign in...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Sign in failed. Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-brand">Sign in successful! Redirecting...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto"></div>
            <p className="mt-4 text-sm text-soft-text-muted">Loading...</p>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}

