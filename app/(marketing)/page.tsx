// app/(marketing)/page.tsx
// All code and comments must be in English.
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { GraduationCap, ShieldCheck, Award, TrendingUp, Users, BookOpen, ArrowRight, CheckCircle2 } from "lucide-react";

export default function HomePage() {
	return (
		<div className="min-h-screen bg-white">
			{/* Navigation */}
			<nav className="container mx-auto px-6 py-6 flex items-center justify-between border-b border-slate-200">
				<div className="flex items-center gap-2">
					<div className="h-10 w-10 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg">
						<GraduationCap className="h-6 w-6 text-white" />
					</div>
					<span className="text-xl font-bold text-gray-900">E-Certify</span>
				</div>
				<div className="flex items-center gap-4">
					<Link href="/courses" className="text-gray-700 hover:text-gray-900 font-medium">
						Courses
					</Link>
					<Link href="/login">
						<Button variant="ghost" className="font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100">
							Sign in
						</Button>
					</Link>
					<Link href="/signup">
						<Button className="bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-md">
							Get started
						</Button>
					</Link>
				</div>
			</nav>

			{/* Hero Section */}
			<main className="container mx-auto px-6 py-20">
				<section className="max-w-5xl mx-auto text-center space-y-8">
					<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-4">
						<Award className="h-4 w-4" />
						<span>Verifiable On-Chain Certificates</span>
					</div>
					
					<h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
						Learn Skills That
						<span className="text-purple-600"> Matter</span>
					</h1>
					
					<p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
						Professional online courses with blockchain-verified certificates. 
						Learn, earn, and showcase your achievements with confidence.
					</p>
					
					<div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
						<Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-lg px-8 py-6 shadow-lg">
							<Link href="/signup">
								Get Started Free
								<ArrowRight className="ml-2 h-5 w-5" />
							</Link>
						</Button>
						<Button asChild variant="outline" size="lg" className="font-semibold text-lg px-8 py-6 border-2 border-gray-300 text-gray-900 hover:bg-gray-50 hover:border-gray-400">
							<Link href="/courses">
								<BookOpen className="mr-2 h-5 w-5" />
								Browse Courses
							</Link>
						</Button>
					</div>

					{/* Stats */}
					<div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-16">
						<div className="text-center">
							<div className="text-3xl md:text-4xl font-bold text-gray-900">1000+</div>
							<div className="text-sm text-gray-600 mt-1">Active Students</div>
						</div>
						<div className="text-center">
							<div className="text-3xl md:text-4xl font-bold text-gray-900">50+</div>
							<div className="text-sm text-gray-600 mt-1">Expert Courses</div>
						</div>
						<div className="text-center">
							<div className="text-3xl md:text-4xl font-bold text-gray-900">95%</div>
							<div className="text-sm text-gray-600 mt-1">Completion Rate</div>
						</div>
						<div className="text-center">
							<div className="text-3xl md:text-4xl font-bold text-gray-900">4.9/5</div>
							<div className="text-sm text-gray-600 mt-1">Avg. Rating</div>
						</div>
					</div>
				</section>

				{/* Features Section */}
				<section className="max-w-6xl mx-auto mt-32 space-y-12">
					<div className="text-center space-y-4">
						<h2 className="text-4xl md:text-5xl font-bold text-gray-900">
							Why Choose <span className="text-purple-600">E-Certify?</span>
						</h2>
						<p className="text-lg text-gray-600 max-w-2xl mx-auto">
							Everything you need to learn, grow, and prove your skills
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8">
						<div className="p-8 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-shadow">
							<div className="h-14 w-14 rounded-xl bg-purple-600 flex items-center justify-center mb-4">
								<ShieldCheck className="h-7 w-7 text-white" />
							</div>
							<h3 className="text-xl font-bold text-gray-900 mb-2">Blockchain Verified</h3>
							<p className="text-gray-600">
								All certificates are stored on-chain using Solana's compressed NFTs. 
								Immutable, verifiable, and forever yours.
							</p>
						</div>

						<div className="p-8 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-shadow">
							<div className="h-14 w-14 rounded-xl bg-blue-600 flex items-center justify-center mb-4">
								<TrendingUp className="h-7 w-7 text-white" />
							</div>
							<h3 className="text-xl font-bold text-gray-900 mb-2">Expert Instructors</h3>
							<p className="text-gray-600">
								Learn from industry professionals and experts who are passionate 
								about sharing their knowledge with you.
							</p>
						</div>

						<div className="p-8 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-shadow">
							<div className="h-14 w-14 rounded-xl bg-indigo-600 flex items-center justify-center mb-4">
								<Users className="h-7 w-7 text-white" />
							</div>
							<h3 className="text-xl font-bold text-gray-900 mb-2">Learn at Your Pace</h3>
							<p className="text-gray-600">
								Self-paced learning with lifetime access. Study when and where 
								it's convenient for you.
							</p>
						</div>
					</div>
				</section>

				{/* CTA Section */}
				<section className="max-w-4xl mx-auto mt-32 p-12 rounded-3xl bg-purple-600 text-white text-center shadow-2xl">
					<h2 className="text-4xl md:text-5xl font-bold mb-4">
						Ready to Start Learning?
					</h2>
					<p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
						Join thousands of students who are already advancing their careers with verifiable certificates.
					</p>
					<Button asChild size="lg" className="bg-white text-purple-600 hover:bg-gray-100 font-semibold text-lg px-8 py-6 shadow-lg">
						<Link href="/signup">
							Create Free Account
							<ArrowRight className="ml-2 h-5 w-5" />
						</Link>
					</Button>
				</section>
			</main>

			{/* Footer */}
			<footer className="container mx-auto px-6 py-12 mt-20 border-t border-gray-200">
				<div className="flex flex-col md:flex-row items-center justify-between gap-4">
					<div className="flex items-center gap-2">
						<div className="h-8 w-8 rounded-lg bg-purple-600 flex items-center justify-center">
							<GraduationCap className="h-5 w-5 text-white" />
						</div>
						<span className="text-lg font-semibold text-gray-900">E-Certify</span>
					</div>
					<p className="text-sm text-gray-600">
						© 2025 E-Certify. All rights reserved.
					</p>
				</div>
			</footer>
		</div>
	);
}
