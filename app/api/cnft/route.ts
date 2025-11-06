import { NextResponse } from "next/server";
import { getDemoCertificatesForWallet } from "@/lib/demo-certificates";

const HELIUS_RPC_URL = process.env.HELIUS_API_KEY_URL;
const DEMO_MODE = (process.env.NEXT_PUBLIC_DEMO_MODE || '').toLowerCase() === 'true';

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const ownerAddress = searchParams.get("owner");

	if (!ownerAddress) {
		return NextResponse.json({ error: "Owner address is required" }, { status: 400 });
	}

	// If demo mode is enabled OR RPC is not configured, use demo data
	const useDemoMode = DEMO_MODE || !HELIUS_RPC_URL;

	if (useDemoMode) {
		// Return demo certificates for seamless demo experience
		const demoCertificates = getDemoCertificatesForWallet(ownerAddress);
		return NextResponse.json({
			items: demoCertificates,
			total: demoCertificates.length,
			page: 1,
			limit: 1000,
		});
	}

	// Try to fetch from real RPC
	try {
		const response = await fetch(HELIUS_RPC_URL!, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				jsonrpc: "2.0",
				id: "e-certify-cnft-fetch",
				method: "getAssetsByOwner",
				params: { ownerAddress, page: 1, limit: 1000 },
			}),
		});

		const data = await response.json();
		if ((data as any).error) {
			throw new Error((data as any).error.message);
		}

		const result = (data as any).result;
		const items = result?.items || result || [];

		// If no real certificates found, fallback to demo data for better UX
		if (Array.isArray(items) && items.length === 0) {
			const demoCertificates = getDemoCertificatesForWallet(ownerAddress);
			return NextResponse.json({
				items: demoCertificates,
				total: demoCertificates.length,
				page: 1,
				limit: 1000,
			});
		}

		return NextResponse.json(result);
	} catch (error: any) {
		// On error, fallback to demo data for seamless experience
		console.warn('Failed to fetch from RPC, using demo data:', error.message);
		const demoCertificates = getDemoCertificatesForWallet(ownerAddress);
		return NextResponse.json({
			items: demoCertificates,
			total: demoCertificates.length,
			page: 1,
			limit: 1000,
		});
	}
}
