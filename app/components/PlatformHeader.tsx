// app/(platform)/_components/PlatformHeader.tsx
// All code and comments must be in English.
"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Search, Bell, Menu } from "lucide-react";
import { motion } from "framer-motion";

import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

interface PlatformHeaderProps {
	userEmail?: string | null;
}

// AddressCard replaces avatar + dropdown: simple rounded white card showing wallet
function AddressCard() {
    return (
        <div className="hidden sm:flex items-center">
            <WalletMultiButton />
        </div>
    );
}

// --- Main PlatformHeader ---
export default function PlatformHeader({ userEmail, onMenuClick, onMobileSearchToggle, isMobileSearchOpen }: PlatformHeaderProps & { onMenuClick?: () => void; onMobileSearchToggle?: () => void; isMobileSearchOpen?: boolean; }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [isVisible, setIsVisible] = useState(true);
    const lastScrollY = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY < 50) {
                // Always show when near top
                setIsVisible(true);
            } else if (currentScrollY > lastScrollY.current) {
                // Scrolling down - hide
                setIsVisible(false);
            } else {
                // Scrolling up - show
                setIsVisible(true);
            }
            
            lastScrollY.current = currentScrollY;
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

return (
		<header 
            className={`sticky top-4 z-50 w-full border border-white/25 bg-white/80 backdrop-blur-2xl backdrop-saturate-180 supports-[backdrop-filter]:bg-white/65 shadow-[0_8px_30px_rgba(15,23,42,0.12)] rounded-3xl transition-all duration-300 ${
                isVisible ? "translate-y-0 opacity-100" : "-translate-y-[calc(100%+2rem)] opacity-0"
            }`}
        >
			<motion.div
				className="flex h-16 items-center justify-between gap-4 px-4 md:px-5 lg:px-6"
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3, ease: "easeInOut" }}
			>
				{/* Left side: Hamburger + Search */}
				<div className="flex items-center gap-4 flex-1 min-w-0">
					{/* Hamburger Menu - Mobile Only */}
                    <Button
						variant="ghost"
						size="icon"
						className="lg:hidden shrink-0"
                        onClick={onMenuClick}
					>
						<Menu className="h-5 w-5" />
					</Button>

					{/* Search Bar */}
					<div className="relative max-w-md w-full hidden lg:block">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							type="search"
							placeholder="Search for courses, users, or credentials..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full pl-9 pr-4 h-11 rounded-full bg-transparent border border-transparent shadow-none focus:bg-white focus:border-gray-200 focus:shadow-sm focus-visible:ring-0 focus-visible:ring-offset-0"
						/>
					</div>
				</div>

				{/* Right side: Notifications and new UserNav */}
                <div className="flex items-center gap-3 shrink-0">
					{/* Mobile Search Icon */}
                    <Button
						variant="ghost"
						size="icon"
						className="lg:hidden shrink-0 text-muted-foreground hover:text-foreground"
                        onClick={onMobileSearchToggle}
					>
						<Search className="h-5 w-5" />
					</Button>

					{/* Notification Icon */}
					<Button
						variant="ghost"
						size="icon"
						className="relative h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-muted"
					>
						<Bell className="h-5 w-5" />
						<span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-[#ff4d6d] border-2 border-white" />
					</Button>

				{/* Address card (replaces avatar + dropdown) */}
				<AddressCard />
                </div>
			</motion.div>
            {/* Mobile expanding search input */}
            <div className="lg:hidden px-4 md:px-5 pb-3">
                <motion.div
                    initial={false}
                    animate={{ height: isMobileSearchOpen ? "auto" : 0, opacity: isMobileSearchOpen ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                >
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search for courses, users, or credentials..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 h-11 rounded-full bg-transparent border border-input"
                        />
                    </div>
                </motion.div>
            </div>
        </header>
	);
}
