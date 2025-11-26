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
        <div className="min-h-screen w-full" style={{ backgroundColor: "var(--soft-bg)" }}>
            {/* Desktop/Tablet Fixed Sidebar */}
            <aside
                className={cn(
                    "fixed left-4 top-4 bottom-4 z-50 hidden md:flex w-64 flex-col transition-all duration-300",
                    "rounded-3xl border border-white/25 bg-white/90 shadow-soft backdrop-blur-xl"
                )}
            >
                <div className="p-4 lg:p-6 border-b border-white/30 flex items-center justify-start shrink-0 bg-transparent">
                    <Link href="/dashboard" className="flex items-center gap-3 flex-1">
                        <div className="flex h-10 w-10 lg:h-12 lg:w-12 items-center justify-center rounded-xl shadow-soft-sm" style={{ backgroundColor: "var(--brand-primary)", color: "var(--brand-primary-foreground)" }}>
                            <GraduationCap className="h-5 w-5 lg:h-7 lg:w-7" />
                        </div>
                        <span className="hidden lg:inline-block text-lg lg:text-xl font-bold text-foreground whitespace-nowrap">
                            E-Certify
                        </span>
                    </Link>
                </div>
                <SidebarNav userRole={userRole} />
                <div className="hidden lg:flex border-t border-white/30 bg-transparent shrink-0 flex-col gap-4">
                    {userRole === 'student' && (
                        <div className="p-4">
                            <Card className="border border-white/40 bg-white/85 shadow-soft text-soft-text">
                                <CardContent className="p-4">
                                    <div className="mb-3 flex items-center justify-center">
                                        <div
                                            className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] shadow-soft-sm"
                                            style={{ backgroundColor: "var(--brand-surface)", color: "var(--brand-primary)" }}
                                        >
                                            <GraduationCap className="h-8 w-8" />
                                        </div>
                                    </div>
                                    <p className="mb-4 text-center text-sm font-medium text-soft-text">
                                        Ready to start learning?
                                    </p>
                                    <Button
                                        className="w-full text-white shadow-lg"
                                        style={{ backgroundColor: "var(--brand-primary)" }}
                                        asChild
                                    >
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
            <div
                className={cn(
                    "flex flex-col min-h-screen transition-all duration-300",
                    "pt-4 pb-8",
                    "px-1 sm:px-2 lg:px-3",
                    "md:ml-[calc(16rem+1.5rem)] lg:ml-[calc(16rem+1.75rem)] xl:ml-[calc(16rem+2rem)]",
                    "md:mr-2 lg:mr-3 xl:mr-4"
                )}
            >
                <div className="flex flex-col flex-1 w-full space-y-3">
                    <PlatformHeader
                        userEmail={userEmail}
                        onMenuClick={() => setIsSidebarOpen(true)}
                        onMobileSearchToggle={() => setIsMobileSearchOpen((v) => !v)}
                        isMobileSearchOpen={isMobileSearchOpen}
                    />
                    <main className="flex-1">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}



