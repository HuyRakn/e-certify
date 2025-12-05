// app/(auth)/layout.tsx
// All code and comments must be in English.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-screen bg-soft-bg text-soft-text">
			{children}
		</div>
	);
}
