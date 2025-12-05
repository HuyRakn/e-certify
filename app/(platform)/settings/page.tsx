// app/(platform)/settings/page.tsx
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
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { UserAvatar } from "@/app/components/user-avatar";
import { Mail, User, ShieldCheck, Key, Bell, Globe } from "lucide-react";

export default function SettingsPage() {
  const supabase = createClient();
  const [email, setEmail] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          setEmail(user.email || "");
          
          // Fetch profile data
          const { data: profile } = await supabase
            .from('profiles')
            .select('role, full_name')
            .eq('id', user.id)
            .single();
          
          if (profile) {
            setRole(profile.role || 'student');
            setFullName(profile.full_name || '');
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [supabase]);

  const updateProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id);

      if (error) {
        console.error("Error updating profile:", error);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div className="min-h-screen bg-soft-bg">
      <div className="space-y-6">
        <div className="rounded-3xl border border-soft-border/70 bg-white shadow-soft p-6 md:p-7 lg:p-8 space-y-6">
          {/* Page Header */}
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-bold text-soft-text">
              My Settings
            </h1>
            <p className="text-sm text-soft-text-muted">
              Manage your account settings and preferences
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Profile */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Information */}
              <Card className="border border-soft-border bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-soft-text" />
                    Profile Information
                  </CardTitle>
                  <CardDescription>
                    Update your personal information and profile details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6 pb-6 border-b border-soft-border">
                    <UserAvatar value={email || "user"} size={80} />
                    <div>
                      <h3 className="text-lg font-semibold text-brand">
                        {fullName || email?.split("@")[0] || "User"}
                      </h3>
                      <p className="text-sm text-soft-text-muted">{email}</p>
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--brand-surface)] text-brand capitalize">
                          {role || "student"}
                        </span>
                      </div>
                    </div>
                  </div>

    <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="fullName" className="text-sm font-medium text-soft-text flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Full Name
                      </label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-soft-text flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email Address
                      </label>
                      <Input
                        id="email"
                        value={email}
                        disabled
                        className="bg-soft-surface-muted"
                      />
                      <p className="text-xs text-soft-text-muted">Email cannot be changed</p>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="role" className="text-sm font-medium text-soft-text flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        Account Role
                      </label>
                      <Input
                        id="role"
                        value={role ? role.charAt(0).toUpperCase() + role.slice(1) : ""}
                        disabled
                        className="bg-soft-surface-muted capitalize"
                      />
                      <p className="text-xs text-soft-text-muted">Role is managed by administrators</p>
                    </div>

                    <Button onClick={updateProfile} className="mt-4">
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Security Settings */}
              <Card className="border border-soft-border bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-soft-text" />
                    Security
                  </CardTitle>
                  <CardDescription>
                    Manage your password and security settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <Key className="mr-2 h-4 w-4" />
                    Change Password
                  </Button>
                  <p className="text-xs text-soft-text-muted">
                    Update your password to keep your account secure
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Quick Actions */}
            <div className="space-y-6">
              {/* Preferences */}
              <Card className="border border-soft-border bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-soft-text" />
                    Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-soft-border">
                    <div>
                      <p className="text-sm font-medium text-soft-text">Email Notifications</p>
                      <p className="text-xs text-soft-text-muted">Receive updates via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-soft-surface-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-soft-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between pt-3">
                    <div>
                      <p className="text-sm font-medium text-soft-text">Course Updates</p>
                      <p className="text-xs text-soft-text-muted">Get notified about new courses</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-soft-surface-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-soft-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
                    </label>
                  </div>
                </CardContent>
              </Card>

              {/* Account Info */}
              <Card className="border border-soft-border bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-soft-text" />
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-soft-border">
                    <span className="text-sm text-soft-text-muted">Member since</span>
                    <span className="text-sm font-medium text-soft-text">
                      {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-soft-border">
                    <span className="text-sm text-soft-text-muted">Account status</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-soft-text-muted">Verification</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Verified
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
        </div>
        </div>
      </div>
    </div>
  );
}

