"use client";

import Link from "next/link";
import { useState } from "react";
import { GraduationCap } from "lucide-react";

import PlatformHeader from "@/app/components/PlatformHeader";
import { SidebarNav } from "./sidebar-nav";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import AuthButton from "@/app/components/auth-button";
import { cn } from "@/lib/utils";

export default function ClientPlatformLayout({ userRole, userEmail, children }: { userRole: string; userEmail: string; children: React.ReactNode; }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <div className="min-h-screen w-full bg-background">
            {/* Desktop/Tablet Fixed Sidebar */}
            <aside
                className={cn(
                    "fixed left-0 top-0 z-40 h-screen border-r bg-card transition-all duration-300 flex flex-col",
                    "lg:w-64",
                    "hidden md:flex md:w-20",
                )}
            >
                <div className="p-4 lg:p-6 border-b flex items-center justify-start shrink-0 bg-card">
                    <Link href="/dashboard" className="flex items-center gap-3 flex-1">
                        <div className="flex h-10 w-10 lg:h-12 lg:w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shrink-0">
                            <GraduationCap className="h-5 w-5 lg:h-7 lg:w-7" />
                        </div>
                        <span className="hidden lg:inline-block text-lg lg:text-xl font-bold text-foreground whitespace-nowrap">
                            E-Certify
                        </span>
                    </Link>
                </div>
                <SidebarNav userRole={userRole} />
                <div className="hidden lg:flex border-t bg-card shrink-0 flex-col gap-4">
                    {userRole === 'student' && (
                        <div className="p-4">
                            <Card className="border-2 border-secondary bg-secondary/20 shadow-md">
                                <CardContent className="p-4">
                                    <div className="mb-3 flex items-center justify-center">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary shadow-sm">
                                            <GraduationCap className="h-8 w-8 text-secondary-foreground" />
                                        </div>
                                    </div>
                                    <p className="mb-4 text-center text-sm font-medium text-foreground">
                                        Ready to start learning?
                                    </p>
                                    <Button className="w-full bg-primary text-primary-foreground hover:opacity-90 shadow-lg" asChild>
                                        <Link href="/courses">Join Course</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                    <div className="p-4 pt-0">
                        <AuthButton userEmail={userEmail} />
                    </div>
                </div>
            </aside>

            {/* Mobile Drawer Sidebar */}
            <div className={cn(
                "md:hidden",
                isSidebarOpen ? "fixed inset-0 z-50" : "hidden"
            )}>
                <div className="absolute inset-0 bg-black/40" onClick={closeSidebar} />
                <div className="absolute left-0 top-0 h-full w-72 bg-card border-r shadow-xl flex flex-col">
                    <div className="p-4 border-b flex items-center gap-3 justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                                <GraduationCap className="h-5 w-5" />
                            </div>
                            <span className="text-lg font-bold">E-Certify</span>
                        </div>
                        <button aria-label="Close" onClick={closeSidebar} className="p-2 rounded-md hover:bg-muted text-foreground/80">✕</button>
                    </div>
                    <SidebarNav userRole={userRole} showLabels />
                    <div className="mt-auto border-t p-4">
                        <AuthButton userEmail={userEmail} />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className={cn("flex flex-col min-h-screen", "md:ml-20 lg:ml-64")}>
                <PlatformHeader
                    userEmail={userEmail}
                    onMenuClick={() => setIsSidebarOpen(true)}
                    onMobileSearchToggle={() => setIsMobileSearchOpen((v) => !v)}
                    isMobileSearchOpen={isMobileSearchOpen}
                />
                <main className="flex-1 overflow-y-auto bg-muted/20 overscroll-contain">
                    {children}
                </main>
            </div>
        </div>
    );
}



