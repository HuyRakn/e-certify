import { NextRequest, NextResponse } from 'next/server';
import { getDemoCertificateById } from '@/lib/demo-certificates';

export async function POST(req: NextRequest) {
  const { assetId } = await req.json();
  
  // Try to get demo certificate by ID
  const demoCert = getDemoCertificateById(assetId || '');
  
  if (demoCert) {
    return NextResponse.json({
      ok: true,
      asset: demoCert,
      proof: { 
        root: `DEMO_ROOT_${assetId}`, 
        leaf: `DEMO_LEAF_${assetId}`,
        proof: ['proof1', 'proof2', 'proof3'],
        tree_id: 'DEMO_TREE',
      },
    });
  }

  // Fallback for unknown demo assets
  return NextResponse.json({
    ok: true,
    asset: {
      id: assetId || 'demo-asset',
      content: { metadata: { name: 'Verified Demo Credential' } },
    },
    proof: { 
      root: `DEMO_ROOT_${assetId}`, 
      leaf: `DEMO_LEAF_${assetId}`,
      proof: ['proof1', 'proof2', 'proof3'],
      tree_id: 'DEMO_TREE',
    },
  });
}



