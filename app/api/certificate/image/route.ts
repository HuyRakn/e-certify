/**
 * Certificate Image Generation API
 * 
 * POST /api/certificate/image
 * Generates certificate image dynamically for student
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateCertificateImage } from '@/lib/utils/certificate-generator';
import { StudentCertificateData } from '@/lib/types/metadata';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate request body
    if (!body.name || !body.major || !body.issueDate) {
      return NextResponse.json(
        { error: 'Missing required fields: name, major, issueDate' },
        { status: 400 }
      );
    }

    const studentData: StudentCertificateData = {
      name: body.name,
      email: body.email || '',
      major: body.major,
      issueDate: body.issueDate,
      certificateId: body.certificateId,
      additionalInfo: body.additionalInfo,
    };

    // Generate certificate image
    const imageBuffer = await generateCertificateImage(studentData);

    // Return as PNG
    // Buffer is Node-specific; cast to BodyInit to satisfy NextResponse typing
    return new NextResponse(imageBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `inline; filename="certificate-${studentData.name.replace(/\s+/g, '-')}.png"`,
      },
    });
  } catch (error: any) {
    console.error('Certificate image generation error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate certificate image' },
      { status: 500 }
    );
  }
}

// GET endpoint for testing (optional)
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  
  const studentData: StudentCertificateData = {
    name: searchParams.get('name') || 'John Doe',
    email: searchParams.get('email') || 'john@example.com',
    major: searchParams.get('major') || 'Computer Science',
    issueDate: searchParams.get('issueDate') || new Date().toISOString().split('T')[0],
    certificateId: searchParams.get('certificateId') || undefined,
  };

  try {
    console.log('Generating certificate image for:', { name: studentData.name, major: studentData.major });
    
    const imageBuffer = await generateCertificateImage(studentData);
    
    console.log('Certificate image generated successfully, size:', imageBuffer.length, 'bytes');
    
    return new NextResponse(imageBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error: any) {
    console.error('Certificate image generation error:', error);
    return NextResponse.json(
      { 
        error: error?.message || 'Failed to generate certificate image',
        hint: error?.message?.includes('font') ? 'Make sure you have internet connection to load fonts from Google Fonts' : undefined
      },
      { status: 500 }
    );
  }
}

