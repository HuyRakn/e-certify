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
    return new NextResponse(imageBuffer, {
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
    certificateId: searchParams.get('certificateId'),
  };

  try {
    const imageBuffer = await generateCertificateImage(studentData);
    
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
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

