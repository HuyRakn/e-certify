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
    const AdminService = (await import('../../../ts/adminMint')).default;
    const admin = new AdminService();

    // Transform CSV rows to Student format
    const students = payload.rows.map((row) => ({
      name: row.student_name,
      email: row.student_email,
      wallet: row.wallet || '', // Will need to look up from email -> wallet mapping
      major: row.major,
      issue_date: row.issue_date,
    }));

    // Validate all students have wallet addresses
    const studentsWithoutWallet = students.filter(s => !s.wallet);
    if (studentsWithoutWallet.length > 0) {
      return NextResponse.json(
        { 
          error: `Missing wallet addresses for ${studentsWithoutWallet.length} student(s)`,
          students: studentsWithoutWallet.map(s => s.email || s.name),
        },
        { status: 400 }
      );
    }

    // Call real minting service
    const result = await admin.batchMintCredentials(
      merkleTree,
      collectionMint,
      students
    );

    return NextResponse.json({
      ok: result.success,
      count: result.results.length,
      successful: result.results.filter(r => r.tx).length,
      failed: result.results.filter(r => r.error).length,
      results: result.results,
      collectionMint,
      merkleTree,
    });
  } catch (e: any) {
    console.error('Mint API error:', e);
    return NextResponse.json(
      { error: e?.message || 'Mint failed', details: e?.stack },
      { status: 500 }
    );
  }
}
