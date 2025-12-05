/**
 * Font Loader for Satori
 * 
 * Provides TTF fonts for certificate generation
 * Priority:
 * 1. Local font file (public/fonts/)
 * 2. CDN (jsDelivr)
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Try to load font from various sources
 */
export async function loadFontForSatori(): Promise<{
  name: string;
  data: ArrayBuffer;
  weight?: number;
  style?: string;
}> {
  // Priority 1: Try to load from local file
  const localFonts = [
    join(process.cwd(), 'public', 'fonts', 'Inter-Regular.ttf'),
    join(process.cwd(), 'public', 'fonts', 'Roboto-Regular.ttf'),
    join(process.cwd(), 'public', 'fonts', 'OpenSans-Regular.ttf'),
  ];

  for (const fontPath of localFonts) {
    if (existsSync(fontPath)) {
      try {
        console.log(`📁 Loading local font: ${fontPath}`);
        const fontData = readFileSync(fontPath);
        
        // Verify it's a TTF file
        const magicBytes = new Uint8Array(fontData.slice(0, 4));
        const isTTF = magicBytes[0] === 0x00 && magicBytes[1] === 0x01 && magicBytes[2] === 0x00 && magicBytes[3] === 0x00;
        const isOTF = magicBytes[0] === 0x4F && magicBytes[1] === 0x54 && magicBytes[2] === 0x54 && magicBytes[3] === 0x4F;
        
        if (!isTTF && !isOTF) {
          console.warn(`⚠️  ${fontPath} is not a valid TTF/OTF file`);
          continue;
        }
        
        const fontName = fontPath.includes('Inter') ? 'Inter' : 
                        fontPath.includes('Roboto') ? 'Roboto' : 'Open Sans';
        
        console.log(`✅ Local font loaded: ${fontName}, size: ${fontData.length} bytes`);
        
        return {
          name: fontName,
          data: fontData.buffer,
          weight: 400,
          style: 'normal',
        };
      } catch (error: any) {
        console.warn(`⚠️  Failed to load local font ${fontPath}:`, error.message);
        continue;
      }
    }
  }

  // Priority 2: Try to load from CDN
  console.log('🌐 No local fonts found, trying CDN...');
  // Try CDN sources that serve TTF fonts directly
  const fontSources = [
    {
      name: 'Inter',
      // Use jsDelivr CDN for GitHub fonts (more reliable)
      url: 'https://cdn.jsdelivr.net/gh/rsms/inter@latest/docs/font-files/Inter-Regular.ttf',
    },
    {
      name: 'Roboto',
      // Use jsDelivr CDN
      url: 'https://cdn.jsdelivr.net/gh/google/fonts@main/apache/roboto/Roboto-Regular.ttf',
    },
    {
      name: 'Open Sans',
      url: 'https://cdn.jsdelivr.net/gh/google/fonts@main/apache/opensans/OpenSans-Regular.ttf',
    },
    {
      name: 'Noto Sans',
      // Fallback to a very common font
      url: 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/notosans/NotoSans-Regular.ttf',
    },
  ];

  for (const fontSource of fontSources) {
    try {
      console.log(`Attempting to load ${fontSource.name} from CDN...`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(fontSource.url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/octet-stream, font/ttf, */*',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.warn(`Failed to fetch ${fontSource.name}: ${response.status} ${response.statusText}`);
        continue;
      }
      
      const fontData = await response.arrayBuffer();
      
      if (fontData.byteLength === 0 || fontData.byteLength < 1000) {
        console.warn(`${fontSource.name} font data seems invalid (size: ${fontData.byteLength} bytes)`);
        continue;
      }
      
      // Verify it's a TTF file (check magic bytes)
      const magicBytes = new Uint8Array(fontData.slice(0, 4));
      const isTTF = magicBytes[0] === 0x00 && magicBytes[1] === 0x01 && magicBytes[2] === 0x00 && magicBytes[3] === 0x00; // TTF
      const isOTF = magicBytes[0] === 0x4F && magicBytes[1] === 0x54 && magicBytes[2] === 0x54 && magicBytes[3] === 0x4F; // OTF
      
      if (!isTTF && !isOTF) {
        console.warn(`${fontSource.name} is not a valid TTF/OTF file`);
        continue;
      }
      
      console.log(`✅ ${fontSource.name} font loaded successfully, size: ${fontData.byteLength} bytes`);
      
      return {
        name: fontSource.name,
        data: fontData,
        weight: 400,
        style: 'normal',
      };
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.warn(`Timeout loading ${fontSource.name}`);
      } else {
        console.warn(`Failed to load ${fontSource.name}:`, error.message);
      }
      continue;
    }
  }
  
  // If all CDN sources fail, provide helpful error message with download instructions
  const errorMessage = 
    'Failed to load fonts for certificate generation.\n\n' +
    'QUICK FIX:\n' +
    '1. Run: npm run download-font\n' +
    '   (This will download font to public/fonts/)\n\n' +
    '2. Or download manually:\n' +
    '   - Visit: https://fonts.google.com/specimen/Inter\n' +
    '   - Click "Download family" → Extract Inter-Regular.ttf\n' +
    '   - Create folder: public/fonts/\n' +
    '   - Copy font to: public/fonts/Inter-Regular.ttf\n' +
    '   - Restart server\n\n' +
    '3. Check internet connection (for CDN)\n\n' +
    'See FONT_SETUP.md for detailed instructions.';
  
  console.error('❌', errorMessage);
  throw new Error(errorMessage);
}

