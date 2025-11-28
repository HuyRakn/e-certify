// app/(marketing)/page.tsx
// All code and comments must be in English
"use client";

import Link from "next/link";
// Import React.Suspense and useRef for the 3D model
import React, { useState, useEffect, Suspense, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Imports for 3D model
import { Canvas, useFrame } from "@react-three/fiber";
// NEW: Import advanced 3D components for a better visual
import {
	Icosahedron,
	TorusKnot,
	OrbitControls,
	Stars,
} from "@react-three/drei";
import * as THREE from "three";

import { Button } from "@/app/components/ui/button";
import {
	GraduationCap,
	ShieldCheck,
	Award,
	TrendingUp,
	Users,
	BookOpen,
	ArrowRight,
	Database,
	Cpu,
	Globe,
	School,
	Brain,
	Code,
	ChevronDown,
	Star,
	Clock,
	BarChart,
	Plus,
	Minus,
	// FIX: Removed 'Type' as it's not a valid export from 'lucide-react'
} from "lucide-react";

// --- Animation Variants ---
const fadeInFromBottom = {
	initial: { opacity: 0, y: 30 },
	animate: {
		opacity: 1,
		y: 0,
	},
	transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const },
};

const staggerContainer = {
	initial: {},
	animate: {
		transition: {
			staggerChildren: 0.1,
			delayChildren: 0.1,
		},
	},
};

// --- Dummy Data (As provided by user) ---
const courses = [
	{
		title: "Introduction to Solana Development",
		category: "Blockchain",
		instructor: "Huy Nguyen",
		duration: "8 Hours",
		level: "Beginner",
		rating: 4.9,
		imageUrl:
			"https://images.unsplash.com/photo-1660062993674-c3830d07ca0a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1332",
	},
	{
		title: "AI in International Trade (APEC Focus)",
		category: "AI & ML",
		instructor: "Dr. Emily Tran",
		duration: "12 Hours",
		level: "Intermediate",
		rating: 4.8,
		imageUrl:
			"https://images.unsplash.com/photo-1674027444485-cec3da58eef4?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1332",
	},
	{
		title: "Cross-Border E-commerce Strategies",
		category: "Business",
		instructor: "Michael Chen",
		duration: "6 Hours",
		level: "All Levels",
		rating: 4.9,
		imageUrl:
			"https://images.unsplash.com/photo-1556740738-b6a63e27c4df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
	},
];

const testimonials = [
	{
		quote:
			"E-Certify revolutionized how I prove my skills. The on-chain certificate gave me a real edge in job interviews. A must for anyone in tech!",
		name: "David Kim",
		title: "Solana Developer, APEC Youth Connect",
		avatar: "https://randomuser.me/api/portraits/men/32.jpg",
	},
	{
		quote:
			"The courses are top-notch, taught by real experts from across the APEC region. I learned practical skills I could apply immediately.",
		name: "Sarah Chen",
		title: "Logistics Manager, Singapore",
		avatar: "https://randomuser.me/api/portraits/women/44.jpg",
	},
	{
		quote:
			"As an instructor, the platform is fantastic. As a student, knowing my achievement is permanent and verifiable on the blockchain is a game-changer.",
		name: "Kenji Tanaka",
		title: "AI Researcher, Tokyo",
		avatar: "https://randomuser.me/api/portraits/men/11.jpg",
	},
];

const faqs = [
	{
		question: "What makes E-Certify certificates special?",
		answer:
			"Our certificates are minted as NFTs (Non-Fungible Tokens) on the Solana blockchain. This means they are immutable (cannot be altered), permanently verifiable by anyone, and truly owned by you. It's the new standard for proving your skills.",
	},
	{
		question: "Why use Solana for this project?",
		answer:
			"Solana provides incredibly fast, low-cost transactions, making it ideal for minting thousands of certificates efficiently. Its high performance and scalability are perfect for the APEC ecosystem, ensuring a smooth experience for students and institutions.",
	},
	{
		question: "Are these courses recognized within APEC?",
		answer:
			"We are actively partnering with educational institutions and corporations within the APEC member economies. Our goal is to create a recognized standard for cross-border skill verification, powered by blockchain.",
	},
	{
		question: "Is this platform free to use?",
		answer:
			"Creating an account and browsing courses is free. Some courses are free, while others are paid. The cost of minting your certificate on-chain is minimal (a few cents) thanks to Solana's low fees, and is often included in the course price.",
	},
];

// --- Re-usable Components ---

// --- (FIXED) 3D Abstract Model Component ---
// MOVED outside the HomePage component to prevent re-renders.
// This is the correct way to define components for react-three-fiber.
const Abstract3DModel: React.FC = () => {
	const meshRef = useRef<THREE.Mesh>(null!);

	// This hook rotates the model on every frame
	useFrame((state, delta) => {
		if (meshRef.current) {
			meshRef.current.rotation.x += delta * 0.1;
			meshRef.current.rotation.y += delta * 0.2;
		}
	});

	return (
		<mesh ref={meshRef}>
			{/* Using TorusKnot for a more complex and "abstract tech" look.
        Args: [radius, tubeRadius, tubularSegments, radialSegments, p, q]
      */}
			<TorusKnot args={[0.8, 0.2, 128, 16]}>
				{/* Using a 'physical' material that reacts to light.
          This looks much better and more professional.
        */}
				<meshStandardMaterial
					color="#8B5CF6"
					metalness={0.6}
					roughness={0.2}
					emissive="#6d2fdc" // Brand accent for 3D object glow
					emissiveIntensity={0.5}
				/>
			</TorusKnot>
		</mesh>
	);
};

// --- Navigation Component (Unchanged) ---
const Navigation: React.FC = () => {
	const [isScrolled, setIsScrolled] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 10);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<motion.nav
			// 80px is the approx height of this nav, used in h-calc() for hero
			className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-[80px] ${
				isScrolled
					? "bg-white/90 shadow-md backdrop-blur-lg"
					: "bg-white/0 shadow-none"
			}`}
		>
			<div className="container mx-auto px-6 h-full flex items-center justify-between">
				<Link href="/" className="flex items-center gap-2 group">
					<motion.div
						className="h-10 w-10 rounded-xl brand-solid flex items-center justify-center shadow-lg"
						whileHover={{ scale: 1.1, rotate: -15 }}
					>
						<GraduationCap className="h-6 w-6 text-white" />
					</motion.div>
					<span className="text-xl font-bold text-gray-900">E-Certify</span>
				</Link>
				<div className="hidden md:flex items-center gap-2">
					<Button asChild variant="ghost" className="font-medium text-gray-700">
						<Link href="#features">Features</Link>
					</Button>
					<Button asChild variant="ghost" className="font-medium text-gray-700">
						<Link href="#courses">Courses</Link>
					</Button>
					<Button asChild variant="ghost" className="font-medium text-gray-700">
						<Link href="#faq">FAQ</Link>
					</Button>
					<Link href="/login">
						<Button
							variant="ghost"
							className="font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
						>
							Sign in
						</Button>
					</Link>
					<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
						<Button
							asChild
							className="brand-solid font-medium shadow-md"
						>
							<Link href="/signup">Get started</Link>
						</Button>
					</motion.div>
				</div>
				<div className="md:hidden">
					<Button variant="ghost" size="icon">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="h-6 w-6"
						>
							<line x1="3" y1="12" x2="21" y2="12"></line>
							<line x1="3" y1="6" x2="21" y2="6"></line>
							<line x1="3" y1="18" x2="21" y2="18"></line>
						</svg>
					</Button>
				</div>
			</div>
		</motion.nav>
	);
};

// --- Scrolling Logos Component (Unchanged) ---
const ScrollingLogos: React.FC = () => {
	const icons = [
		{ name: "Solana", icon: <Database className="h-8 w-8" /> },
		{ name: "APEC", icon: <Globe className="h-8 w-8" /> },
		{ name: "Blockchain", icon: <Cpu className="h-8 w-8" /> },
		{ name: "Education", icon: <School className="h-8 w-8" /> },
		{ name: "AI Learning", icon: <Brain className="h-8 w-8" /> },
		{ name: "Development", icon: <Code className="h-8 w-8" /> },
		{ name: "Verified", icon: <ShieldCheck className="h-8 w-8" /> },
	];
	const allIcons = [...icons, ...icons, ...icons];

	return (
		<div className="w-full overflow-x-hidden py-12 bg-gray-50 border-y border-gray-200">
			<div className="text-center mb-8">
				<h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
					Powering the Future of Education with
				</h3>
			</div>
			<div className="flex animate-scroll group-hover:pause-animation">
				{allIcons.map((item, index) => (
					<div
						key={index}
						className="flex items-center justify-center w-64 shrink-0"
					>
						<div className="flex items-center gap-3 text-gray-500">
							{item.icon}
							<span className="text-lg font-medium">{item.name}</span>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

// --- FAQ Item Component (Unchanged) ---
const FaqItem: React.FC<{ question: string; answer: string }> = ({
	question,
	answer,
}) => {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<motion.div
			className="border-b border-gray-200"
			variants={fadeInFromBottom}
		>
			<button
				className="flex items-center justify-between w-full py-6 text-left"
				onClick={() => setIsOpen(!isOpen)}
			>
				<span className="text-lg font-medium text-gray-900">{question}</span>
				<motion.div
					animate={{ rotate: isOpen ? 180 : 0 }}
					transition={{ duration: 0.3 }}
				>
					<ChevronDown
						className={`h-6 w-6 text-brand transition-transform ${
							isOpen ? "transform rotate-180" : ""
						}`}
					/>
				</motion.div>
			</button>
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
						className="overflow-hidden"
					>
						<p className="pb-6 text-gray-600 leading-relaxed">{answer}</p>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
};

// --- Main Page Component ---
export default function HomePage() {
	return (
		<div className="min-h-screen bg-white overflow-x-hidden">
			<Navigation />

			<main className="pt-[80px]">
				{/* --- (REVISED) Hero Section --- */}
				<motion.section
					className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center min-h-[calc(100vh-80px)] py-4 md:py-6"
					initial="initial"
					animate="animate"
					variants={staggerContainer}
				>
					{/* Left Column (Text & CTAs) */}
					<motion.div
						className="flex flex-col text-left space-y-5 justify-center w-full"
						variants={staggerContainer}
					>
						<motion.div variants={fadeInFromBottom}>
							<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--brand-surface)] text-brand text-sm font-medium">
								<Award className="h-4 w-4" />
								<span>Verifiable <span className="whitespace-nowrap">On-Chain</span> Certificates on Solana</span>
							</div>
						</motion.div>

						<motion.h1
							className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight"
							variants={fadeInFromBottom}
						>
							The New Standard
							<br />
							for <span className="text-brand text-[2.4rem] md:text-[3.5rem] lg:text-[4.2rem] whitespace-nowrap">Verified Skills</span>
						</motion.h1>

						<motion.p
							className="text-lg md:text-xl text-gray-600 max-w-2xl leading-relaxed"
							variants={fadeInFromBottom}
						>
							Professional online courses for the APEC ecosystem.{" "}
							<span className="whitespace-nowrap">Learn, earn,</span> and showcase your achievements with{" "}
							<span className="whitespace-nowrap">blockchain-verified</span> certificates.
						</motion.p>

						<motion.div
							className="w-full"
							variants={fadeInFromBottom}
						>
							<div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3 sm:gap-6 w-full sm:w-[520px]">
								<motion.div 
									className="w-full sm:w-auto sm:flex-1"
									whileHover={{ scale: 1.02 }} 
									whileTap={{ scale: 0.98 }}
								>
									<Button
										asChild
										size="lg"
										className="brand-solid w-full sm:w-auto text-white font-semibold text-lg px-8 py-6 shadow-lg"
									>
										<Link href="/signup" className="flex items-center justify-center">
											Get Started Free
											<ArrowRight className="ml-2 h-5 w-5" />
										</Link>
									</Button>
								</motion.div>
								<motion.div 
									className="w-full sm:w-auto sm:flex-1"
									whileHover={{ scale: 1.02 }} 
									whileTap={{ scale: 0.98 }}
								>
									<Button
										asChild
										variant="outline"
										size="lg"
										className="w-full sm:w-auto font-semibold text-lg px-8 py-6 border-2 border-gray-300 text-gray-900 hover:bg-gray-50 hover:border-gray-400"
									>
										<Link href="#courses" className="flex items-center justify-center">
											<BookOpen className="mr-2 h-5 w-5" />
											Browse Courses
										</Link>
									</Button>
								</motion.div>
							</div>
						</motion.div>

						{/* Stats Section - Moved inside hero, below CTAs */}
						<motion.div
							className="w-full pt-6"
							variants={fadeInFromBottom}
						>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 w-full md:w-[520px] justify-items-center md:justify-items-start">
								<motion.div 
									className="text-center md:text-left" 
									variants={fadeInFromBottom}
									whileHover={{ scale: 1.05 }}
									transition={{ type: "spring", stiffness: 300 }}
								>
									<div className="text-2xl md:text-3xl font-bold text-gray-900 leading-none">
										1000+
									</div>
									<div className="text-xs md:text-sm text-gray-600 mt-1 font-medium">
										Active Students
									</div>
								</motion.div>
								<motion.div 
									className="text-center md:text-left" 
									variants={fadeInFromBottom}
									whileHover={{ scale: 1.05 }}
									transition={{ type: "spring", stiffness: 300 }}
								>
									<div className="text-2xl md:text-3xl font-bold text-gray-900 leading-none">
										50+
									</div>
									<div className="text-xs md:text-sm text-gray-600 mt-1 font-medium">
										Expert Courses
									</div>
								</motion.div>
								<motion.div 
									className="text-center md:text-left" 
									variants={fadeInFromBottom}
									whileHover={{ scale: 1.05 }}
									transition={{ type: "spring", stiffness: 300 }}
								>
									<div className="text-2xl md:text-3xl font-bold text-gray-900 leading-none">
										95%
									</div>
									<div className="text-xs md:text-sm text-gray-600 mt-1 font-medium whitespace-nowrap">
										Completion Rate
									</div>
								</motion.div>
								<motion.div 
									className="text-center md:text-left" 
									variants={fadeInFromBottom}
									whileHover={{ scale: 1.05 }}
									transition={{ type: "spring", stiffness: 300 }}
								>
									<div className="text-2xl md:text-3xl font-bold text-gray-900 leading-none">
										4.9/5
									</div>
									<div className="text-xs md:text-sm text-gray-600 mt-1 font-medium">
										Avg. Rating
									</div>
								</motion.div>
							</div>
						</motion.div>
					</motion.div>

					{/* Right Column (3D Model) - UPGRADED */}
					<motion.div
						className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing min-h-[400px] md:min-h-[500px]"
						variants={fadeInFromBottom}
						transition={{ delay: 0.3, duration: 0.6 }}
					>
						<Suspense
							fallback={
								<div className="h-full w-full flex items-center justify-center text-brand">
									Loading 3D Model...
								</div>
							}
						>
							<Canvas
								camera={{ position: [0, 0, 5.5], fov: 45 }}
								style={{ width: "100%", height: "100%" }}
							>
								{/* Upgraded Lighting */}
								<ambientLight intensity={0.5} />
								<directionalLight position={[10, 10, 5]} intensity={1.5} />
								<pointLight position={[-10, -10, -10]} intensity={0.5} />

								{/* NEW: Starry background */}
								<Stars
									radius={100}
									depth={50}
									count={5000}
									factor={4}
									saturation={0}
									fade
									speed={1}
								/>

								{/* Upgraded 3D Model */}
								<Abstract3DModel />

								{/* NEW: OrbitControls to make it interactive */}
								<OrbitControls
									enableZoom={true}
									enablePan={false}
									autoRotate
									autoRotateSpeed={0.5}
								/>
							</Canvas>
						</Suspense>
					</motion.div>
				</motion.section>

				{/* --- Scrolling Banner Section (Unchanged) --- */}
				<motion.section
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: true, amount: 0.2 }}
					transition={{ duration: 0.8 }}
				>
					<ScrollingLogos />
				</motion.section>

				{/* --- How It Works Section (Unchanged) --- */}
				<motion.section
					className="container mx-auto px-6 max-w-6xl mt-32 space-y-16"
					initial="initial"
					whileInView="animate"
					variants={staggerContainer}
					viewport={{ once: true, amount: 0.2 }}
				>
					<motion.div
						className="text-center space-y-4"
						variants={fadeInFromBottom}
					>
						<h2 className="text-4xl md:text-5xl font-bold text-gray-900">
							Start Learning in 3 Simple Steps
						</h2>
						<p className="text-lg text-gray-600 max-w-2xl mx-auto">
							Go from learner to certified professional, all on one platform.
						</p>
					</motion.div>
					<div className="grid md:grid-cols-3 gap-8">
						<motion.div
							className="p-8 text-center"
							variants={fadeInFromBottom}
						>
							<div className="h-20 w-20 rounded-full bg-[var(--brand-surface)] flex items-center justify-center mb-6 mx-auto">
								<BookOpen className="h-10 w-10 text-brand" />
							</div>
							<h3 className="text-2xl font-bold text-gray-900 mb-2">
								1. Enroll in a Course
							</h3>
							<p className="text-gray-600">
								Browse our catalog of expert-led courses and find the
								perfect one to advance your skills.
							</p>
						</motion.div>
						<motion.div
							className="p-8 text-center"
							variants={fadeInFromBottom}
						>
							<div className="h-20 w-20 rounded-full bg-[var(--brand-surface)] flex items-center justify-center mb-6 mx-auto">
								<TrendingUp className="h-10 w-10 text-brand" />
							</div>
							<h3 className="text-2xl font-bold text-gray-900 mb-2">
								2. Learn & Master
							</h3>
							<p className="text-gray-600">
								Complete video lectures, projects, and assessments at your
								own pace, from anywhere in the world.
							</p>
						</motion.div>
						<motion.div
							className="p-8 text-center"
							variants={fadeInFromBottom}
						>
							<div className="h-20 w-20 rounded-full bg-[var(--brand-surface)] flex items-center justify-center mb-6 mx-auto">
								<ShieldCheck className="h-10 w-10 text-brand" />
							</div>
							<h3 className="text-2xl font-bold text-gray-900 mb-2 whitespace-nowrap">
								3. Get Verified On-Chain
							</h3>
							<p className="text-gray-600">
								Receive your permanent, tamper-proof certificate as an NFT
								on the Solana blockchain.
							</p>
						</motion.div>
					</div>
				</motion.section>

				{/* --- Features Section (Unchanged) --- */}
				<motion.section
					id="features"
					className="container mx-auto px-6 max-w-6xl mt-32 space-y-16"
					initial="initial"
					whileInView="animate"
					variants={staggerContainer}
					viewport={{ once: true, amount: 0.2 }}
				>
					<motion.div
						className="text-center space-y-4"
						variants={fadeInFromBottom}
					>
						<h2 className="text-4xl md:text-5xl font-bold text-gray-900">
							Why Choose <span className="text-brand">E-Certify?</span>
						</h2>
						<p className="text-lg text-gray-600 max-w-2xl mx-auto">
							Everything you need to learn, grow, and prove your skills
						</p>
					</motion.div>
					<div className="grid md:grid-cols-3 gap-8">
						<motion.div
							className="p-8 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
							variants={fadeInFromBottom}
							whileHover={{ scale: 1.03 }}
						>
							<div className="h-14 w-14 rounded-xl brand-solid flex items-center justify-center mb-4">
								<ShieldCheck className="h-7 w-7 text-white" />
							</div>
							<h3 className="text-xl font-bold text-gray-900 mb-2">
								Blockchain Verified
							</h3>
							<p className="text-gray-600">
								All certificates are stored on-chain using Solana.
								Immutable, verifiable, and forever yours.
							</p>
						</motion.div>
						<motion.div
							className="p-8 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
							variants={fadeInFromBottom}
							whileHover={{ scale: 1.03 }}
						>
							<div className="h-14 w-14 rounded-xl brand-solid flex items-center justify-center mb-4">
								<TrendingUp className="h-7 w-7 text-white" />
							</div>
							<h3 className="text-xl font-bold text-gray-900 mb-2">
								APEC Expert Instructors
							</h3>
							<p className="text-gray-600">
								Learn from industry professionals across the APEC region,
								passionate about sharing their knowledge.
							</p>
						</motion.div>
						<motion.div
							className="p-8 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
							variants={fadeInFromBottom}
							whileHover={{ scale: 1.03 }}
						>
							<div className="h-14 w-14 rounded-xl brand-solid flex items-center justify-center mb-4">
								<Users className="h-7 w-7 text-white" />
							</div>
							<h3 className="text-xl font-bold text-gray-900 mb-2">
								Learn at Your Pace
							</h3>
							<p className="text-gray-600">
								Self-paced learning with lifetime access. Study when and where
								it's convenient for you.
							</p>
						</motion.div>
					</div>
				</motion.section>

				{/* --- Featured Courses Section (Unchanged) --- */}
				<motion.section
					id="courses"
					className="container mx-auto px-6 max-w-6xl mt-32 space-y-16"
					initial="initial"
					whileInView="animate"
					variants={staggerContainer}
					viewport={{ once: true, amount: 0.2 }}
				>
					<motion.div
						className="text-center space-y-4"
						variants={fadeInFromBottom}
					>
						<h2 className="text-4xl md:text-5xl font-bold text-gray-900">
							Explore Our Featured Courses
						</h2>
						<p className="text-lg text-gray-600 max-w-2xl mx-auto">
							Hand-picked courses to help you get ahead in the digital
							economy.
						</p>
					</motion.div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{courses.map((course, index) => (
							<motion.div
								key={index}
								className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden group transition-all duration-300 hover:shadow-xl"
								variants={fadeInFromBottom}
								whileHover={{ y: -5 }}
							>
								<Link href="/courses/1">
									<div className="aspect-video overflow-hidden">
										<img
											src={course.imageUrl}
											alt={course.title}
											className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
										/>
									</div>
									<div className="p-6 space-y-4">
										<div className="flex items-center justify-between">
											<span className="inline-block px-3 py-1 rounded-full bg-[var(--brand-surface)] text-brand text-xs font-medium">
												{course.category}
											</span>
											<div className="flex items-center gap-1 text-yellow-500">
												<Star className="h-4 w-4 fill-current" />
												<span className="text-sm font-medium text-gray-700">
													{course.rating}
												</span>
											</div>
										</div>
										<h3 className="text-xl font-bold text-gray-900 group-hover:text-brand transition-colors">
											{course.title}
										</h3>
										<div className="flex items-center justify-between text-sm text-gray-600 border-t border-gray-100 pt-4">
											<div className="flex items-center gap-2">
												<Clock className="h-4 w-4" />
												<span>{course.duration}</span>
											</div>
											<div className="flex items-center gap-2">
												<BarChart className="h-4 w-4" />
												<span>{course.level}</span>
											</div>
										</div>
									</div>
								</Link>
							</motion.div>
						))}
					</div>
					<motion.div className="text-center" variants={fadeInFromBottom}>
						<Button
							asChild
							size="lg"
							variant="outline"
							className="font-semibold text-lg px-8 py-6 border-2 border-gray-300 text-gray-900 hover:bg-gray-50 hover:border-gray-400"
						>
							<Link href="/courses">
								Browse All Courses
								<ArrowRight className="ml-2 h-5 w-5" />
							</Link>
						</Button>
					</motion.div>
				</motion.section>

				{/* --- Testimonials Section (Unchanged) --- */}
				<motion.section
					className="container mx-auto px-6 max-w-6xl mt-32 space-y-16"
					initial="initial"
					whileInView="animate"
					variants={staggerContainer}
					viewport={{ once: true, amount: 0.2 }}
				>
					<motion.div
						className="text-center space-y-4"
						variants={fadeInFromBottom}
					>
						<h2 className="text-4xl md:text-5xl font-bold text-gray-900">
							What Our <span className="text-brand">Students Say</span>
						</h2>
						<p className="text-lg text-gray-600 max-w-2xl mx-auto">
							Real feedback from learners across the APEC ecosystem.
						</p>
					</motion.div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{testimonials.map((item, index) => (
							<motion.div
								key={index}
								className="p-8 rounded-2xl bg-gray-50 border border-gray-200"
								variants={fadeInFromBottom}
							>
								<div className="flex items-center gap-1 text-yellow-500 mb-4">
									<Star className="h-5 w-5 fill-current" />
									<Star className="h-5 w-5 fill-current" />
									<Star className="h-5 w-5 fill-current" />
									<Star className="h-5 w-5 fill-current" />
									<Star className="h-5 w-5 fill-current" />
								</div>
								<p className="text-gray-700 text-lg leading-relaxed mb-6 text-justify">
									"{item.quote}"
								</p>
								<div className="flex items-center gap-4">
									<img
										src={item.avatar}
										alt={item.name}
										className="h-12 w-12 rounded-full object-cover"
									/>
									<div>
										<h4 className="font-bold text-gray-900">
											{item.name}
										</h4>
										<p className="text-sm text-gray-600">
											{item.title}
										</p>
									</div>
								</div>
							</motion.div>
						))}
					</div>
				</motion.section>

				{/* --- FAQ Section (Unchanged) --- */}
				<motion.section
					id="faq"
					className="container mx-auto px-6 max-w-4xl mt-32 space-y-8"
					initial="initial"
					whileInView="animate"
					variants={staggerContainer}
					viewport={{ once: true, amount: 0.2 }}
				>
					<motion.div
						className="text-center space-y-4"
						variants={fadeInFromBottom}
					>
						<h2 className="text-4xl md:text-5xl font-bold text-gray-900">
							Frequently Asked Questions
						</h2>
						<p className="text-lg text-gray-600 max-w-2xl mx-auto">
							Have questions? We've got answers.
						</p>
					</motion.div>
					<div className="border-t border-gray-200">
						{faqs.map((faq, index) => (
							<FaqItem
								key={index}
								question={faq.question}
								answer={faq.answer}
							/>
						))}
					</div>
				</motion.section>

				{/* --- CTA Section (Unchanged) --- */}
				<motion.section
					className="container mx-auto px-6 max-w-4xl mt-32"
					initial="initial"
					whileInView="animate"
					variants={fadeInFromBottom}
					viewport={{ once: true, amount: 0.5 }}
				>
					<div className="p-12 rounded-3xl brand-solid text-center shadow-2xl relative overflow-hidden">
						<div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
						<div className="absolute -bottom-20 -left-10 w-52 h-52 bg-white/10 rounded-full" />
						<div className="relative z-10">
							<h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
								Ready to Start Learning?
							</h2>
							<p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
								Join thousands of students who are already advancing their
								careers with verifiable certificates.
							</p>
							<motion.div
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								className="inline-block"
							>
								<Button
									asChild
									size="lg"
									className="brand-solid--inverted font-semibold text-lg px-8 py-6 shadow-lg"
								>
									<Link href="/signup">
										Create Free Account
										<ArrowRight className="ml-2 h-5 w-5" />
									</Link>
								</Button>
							</motion.div>
						</div>
					</div>
				</motion.section>
			</main>

			{/* --- Footer (Unchanged) --- */}
			<motion.footer
				className="container mx-auto px-6 py-12 mt-32 border-t border-gray-200"
				initial={{ opacity: 0 }}
				whileInView={{ opacity: 1 }}
				transition={{ duration: 0.5 }}
				viewport={{ once: true }}
			>
				<div className="flex flex-col md:flex-row items-center justify-between gap-8">
					<div className="flex items-center gap-2">
						<div className="h-8 w-8 rounded-lg brand-solid flex items-center justify-center">
							<GraduationCap className="h-5 w-5 text-white" />
						</div>
						<span className="text-lg font-semibold text-gray-900">
							E-Certify
						</span>
					</div>
					<div className="flex flex-wrap justify-center gap-6 text-gray-600 font-medium">
						<Link href="#features" className="hover:text-brand">
							Features
						</Link>
						<Link href="#courses" className="hover:text-brand">
							Courses
						</Link>
						<Link href="#faq" className="hover:text-brand">
							FAQ
						</Link>
						<Link href="#" className="hover:text-brand">
							Contact
						</Link>
					</div>
					<p className="text-sm text-gray-600 text-center md:text-right">
						© {new Date().getFullYear()} E-Certify. All rights reserved.
					</p>
				</div>
			</motion.footer>
		</div>
	);
}