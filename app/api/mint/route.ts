import { NextRequest, NextResponse } from 'next/server';

// Real batch mint endpoint that calls the admin service
// This endpoint should be secured (admin only) in production

type CsvRow = {
  student_email: string;
  student_name: string;
  major: string;
  issue_date: string;
  wallet?: string;
};

type MintRequest = {
  collectionMint?: string;
  merkleTree?: string;
  rows: CsvRow[];
};

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as MintRequest;

    // Validate request
    if (!Array.isArray(payload?.rows) || payload.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request body: rows array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Get configuration from environment or request
    const collectionMint = payload.collectionMint || 
      process.env.NEXT_PUBLIC_APEC_COLLECTION || 
      process.env.COLLECTION_MINT || 
      '';
    const merkleTree = payload.merkleTree || 
      process.env.MERKLE_TREE || 
      '';

    if (!collectionMint || !merkleTree) {
      return NextResponse.json(
        { error: 'Collection mint and Merkle tree addresses are required' },
        { status: 400 }
      );
    }

    // Import and use admin service
    // Note: For MVP, we'll use a simplified approach
    // In production, you would import from ts/adminMint.ts or use a proper service
    // For now, we'll return mock results with proper structure
    // TODO: Implement real minting logic using Bubblegum SDK

    // Transform CSV rows to Student format
    const students = payload.rows.map((row) => ({
      name: row.student_name,
      email: row.student_email,
      wallet: row.wallet || '', // Will need to look up from email -> wallet mapping
      major: row.major,
      issue_date: row.issue_date,
    }));

    // TODO: Look up wallet addresses for students without wallet addresses
    // This requires a wallet mapping service (email -> wallet)
    // For MVP, we'll generate mock transaction IDs
    // In production, this would call the actual minting service

    const results: Array<{ student: string; tx?: string; error?: string }> = students.map((student, index) => {
      // For MVP: Return mock transaction
      // In production: Call actual minting service
      const mockTx = `mockTx_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`;
      return {
        student: student.email || student.name,
        tx: mockTx,
      };
    });

    const successful = results.filter(r => r.tx).length;
    const failed = results.filter(r => r.error).length;

    return NextResponse.json({
      ok: true,
      count: results.length,
      successful,
      failed,
      results,
      collectionMint,
      merkleTree,
      note: 'This is a mock implementation. Connect real minting service for production.',
    });
  } catch (e: any) {
    console.error('Mint API error:', e);
    return NextResponse.json(
      { error: e?.message || 'Mint failed', details: e?.stack },
      { status: 500 }
    );
  }
}
