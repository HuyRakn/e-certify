/**
 * Certificate Image Generator using Satori
 * 
 * Generates certificate images dynamically using satori (SVG to PNG)
 */

import satori from 'satori';
import { StudentCertificateData } from '../types/metadata';
import { loadFontForSatori } from './font-loader';

// Certificate dimensions
const CERTIFICATE_WIDTH = 1200;
const CERTIFICATE_HEIGHT = 800;

/**
 * Generate certificate image as PNG buffer
 * 
 * @param studentData Student information to display on certificate
 * @returns PNG image buffer
 */
export async function generateCertificateImage(
  studentData: StudentCertificateData
): Promise<Buffer> {
  // Load fonts from CDN or local files
  const fontData = await loadFontForSatori();
  
  // Generate SVG using satori
  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '60px',
          fontFamily: fontData.name || 'Inter, Roboto, system-ui, sans-serif',
        },
        children: [
          // Header
          {
            type: 'div',
            props: {
              style: {
                fontSize: '36px',
                fontWeight: 'bold',
                color: '#ffffff',
                marginBottom: '20px',
                textAlign: 'center',
              },
              children: 'APEC UNIVERSITY',
            },
          },
          {
            type: 'div',
            props: {
              style: {
                fontSize: '24px',
                color: '#ffffff',
                marginBottom: '60px',
                textAlign: 'center',
                opacity: 0.9,
              },
              children: 'Certificate of Achievement',
            },
          },
          // Main content
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                padding: '60px',
                width: '90%',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              },
              children: [
                // Student name
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '48px',
                      fontWeight: 'bold',
                      color: '#1a202c',
                      marginBottom: '30px',
                      textAlign: 'center',
                    },
                    children: studentData.name,
                  },
                },
                // Major
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '28px',
                      color: '#4a5568',
                      marginBottom: '40px',
                      textAlign: 'center',
                    },
                    children: `has successfully completed the program in`,
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '32px',
                      fontWeight: '600',
                      color: '#667eea',
                      marginBottom: '50px',
                      textAlign: 'center',
                    },
                    children: studentData.major,
                  },
                },
                // Issue date
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '20px',
                      color: '#718096',
                      marginTop: '40px',
                      textAlign: 'center',
                    },
                    children: `Issued on ${formatDate(studentData.issueDate)}`,
                  },
                },
                // Certificate ID
                studentData.certificateId ? {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '16px',
                      color: '#a0aec0',
                      marginTop: '20px',
                      textAlign: 'center',
                      fontFamily: 'monospace',
                    },
                    children: `ID: ${studentData.certificateId}`,
                  },
                } : null,
              ],
            },
          },
          // Footer
          {
            type: 'div',
            props: {
              style: {
                fontSize: '18px',
                color: '#ffffff',
                marginTop: '40px',
                textAlign: 'center',
                opacity: 0.8,
              },
              children: 'This certificate is issued on-chain and verifiable via blockchain',
            },
          },
        ],
      },
    },
    {
      width: CERTIFICATE_WIDTH,
      height: CERTIFICATE_HEIGHT,
      fonts: fontData ? [fontData] : [],
    }
  );

  // Convert SVG to PNG using sharp
  const { default: sharp } = await import('sharp');
  const pngBuffer = await sharp(Buffer.from(svg))
    .png()
    .toBuffer();

  return pngBuffer;
}


/**
 * Format date string
 */
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

