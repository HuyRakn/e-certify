import { NextResponse } from "next/server";
import { getDemoCertificatesForWallet } from "@/lib/demo-certificates";

const HELIUS_RPC_URL = process.env.HELIUS_API_KEY_URL;
const DEMO_MODE = (process.env.NEXT_PUBLIC_DEMO_MODE || '').toLowerCase() === 'true';

/**
 * Filter assets by collection mint address
 * Checks grouping array for collection match
 */
function filterByCollection(assets: any[], collectionMint: string): any[] {
	if (!collectionMint) return assets;
	
	return assets.filter((asset) => {
		// Check grouping array for collection
		if (!asset.grouping || !Array.isArray(asset.grouping)) {
			return false; // No grouping, filter out (spam protection)
		}
		
		const collectionGroup = asset.grouping.find(
			(g: any) => g.group_key === 'collection' || g.group_key === 'Collection'
		);
		
		if (!collectionGroup) {
			return false; // No collection grouping, filter out
		}
		
		// Compare collection mint address
		return collectionGroup.group_value === collectionMint;
	});
}

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const ownerAddress = searchParams.get("owner");
	const collectionMint = searchParams.get("collection") || process.env.NEXT_PUBLIC_APEC_COLLECTION || process.env.COLLECTION_MINT;

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
		let items = result?.items || result || [];

		// Filter by collection if collectionMint is provided
		if (collectionMint && Array.isArray(items) && items.length > 0) {
			items = filterByCollection(items, collectionMint);
		}

		// If no real certificates found, fallback to demo data for better UX
		if (Array.isArray(items) && items.length === 0) {
			const demoCertificates = getDemoCertificatesForWallet(ownerAddress);
			// Filter demo certificates too if collection filter is set
			const filteredDemo = collectionMint 
				? filterByCollection(demoCertificates, collectionMint)
				: demoCertificates;
			return NextResponse.json({
				items: filteredDemo,
				total: filteredDemo.length,
				page: 1,
				limit: 1000,
			});
		}

		return NextResponse.json({
			...result,
			items,
			total: items.length,
		});
	} catch (error: any) {
		// On error, fallback to demo data for seamless experience
		console.warn('Failed to fetch from RPC, using demo data:', error.message);
		const demoCertificates = getDemoCertificatesForWallet(ownerAddress);
		// Filter demo certificates too if collection filter is set
		const filteredDemo = collectionMint 
			? filterByCollection(demoCertificates, collectionMint)
			: demoCertificates;
		return NextResponse.json({
			items: filteredDemo,
			total: filteredDemo.length,
			page: 1,
			limit: 1000,
		});
	}
}
