import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ClientPlatformLayout from "./_components/client-layout";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  
  // Use getUser() for server components
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    console.error("Layout auth error:", error);
    redirect("/login");
  }

  // Get the role from JWT token (user_role claim added by Auth Hook)
  // Fallback to database query if JWT claim is not available
  let userRole = 'student';
  let userEmail = user.email || '';
  
  // Try to get role from JWT token first (faster, no DB query)
  if ((user as any).user_metadata?.user_role) {
    userRole = (user as any).user_metadata.user_role;
  } else if ((user as any).app_metadata?.user_role) {
    userRole = (user as any).app_metadata.user_role;
  } else {
    // Fallback: query database if JWT claim is not available
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        userRole = profile.role || 'student';
      }
    } catch (error) {
      // Silently fail and default to student role
    }
  }

  return (
    <ClientPlatformLayout userRole={userRole} userEmail={userEmail}>
      {children}
    </ClientPlatformLayout>
  );
}
