import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

/**
 * Generate OG Image for Verify Page
 * 
 * This route generates a dynamic Open Graph image for certificate verification pages.
 * When shared on Facebook/LinkedIn, it will display a preview with certificate information.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  try {
    const { assetId } = await params;
    
    // Fetch asset data from Helius DAS API
    const dasUrl = process.env.NEXT_PUBLIC_DAS_URL || process.env.DAS_URL || '';
    let assetData: any = null;
    
    if (dasUrl) {
      try {
        const assetResponse = await fetch(dasUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 'og-image-asset',
            method: 'getAsset',
            params: { id: assetId },
          }),
        });
        
        const assetJson = await assetResponse.json();
        assetData = assetJson?.result;
      } catch (error) {
        console.error('Failed to fetch asset for OG image:', error);
      }
    }
    
    // Extract metadata
    const metadata = assetData?.content?.metadata || {};
    const certificateName = metadata.name || 'Certificate';
    const description = metadata.description || 'Verified on Solana blockchain';
    
    // Extract institution from attributes
    const attributes = metadata.attributes || [];
    const institutionAttr = attributes.find(
      (attr: any) =>
        attr.trait_type?.toLowerCase().includes('institution') ||
        attr.trait_type?.toLowerCase().includes('school') ||
        attr.trait_type?.toLowerCase().includes('university')
    );
    const institution = institutionAttr?.value || 'APEC University';
    
    // Extract issue date
    const issueDateAttr = attributes.find(
      (attr: any) =>
        attr.trait_type?.toLowerCase().includes('issued') ||
        attr.trait_type?.toLowerCase().includes('date')
    );
    const issueDate = issueDateAttr?.value || '';
    
    // Generate OG Image
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            padding: '60px',
          }}
        >
          {/* Verified Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '40px',
            }}
          >
            <div
              style={{
                backgroundColor: '#10b981',
                borderRadius: '50%',
                width: '80px',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px',
                color: 'white',
              }}
            >
              ✓
            </div>
          </div>
          
          {/* Certificate Name */}
          <div
            style={{
              fontSize: '56px',
              fontWeight: 'bold',
              color: 'white',
              textAlign: 'center',
              marginBottom: '20px',
              maxWidth: '1000px',
            }}
          >
            {certificateName}
          </div>
          
          {/* Institution */}
          <div
            style={{
              fontSize: '32px',
              color: 'rgba(255, 255, 255, 0.9)',
              textAlign: 'center',
              marginBottom: '30px',
            }}
          >
            {institution}
          </div>
          
          {/* Issue Date */}
          {issueDate && (
            <div
              style={{
                fontSize: '24px',
                color: 'rgba(255, 255, 255, 0.8)',
                textAlign: 'center',
                marginBottom: '30px',
              }}
            >
              Issued: {issueDate}
            </div>
          )}
          
          {/* Verified Text */}
          <div
            style={{
              fontSize: '20px',
              color: 'rgba(255, 255, 255, 0.9)',
              textAlign: 'center',
              marginTop: '40px',
              padding: '16px 32px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
            }}
          >
            ✓ Verified on Solana Blockchain
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error: any) {
    console.error('OG Image generation error:', error);
    
    // Fallback: Return a simple error image
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <div
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: 'white',
              textAlign: 'center',
            }}
          >
            Certificate Verification
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
}

