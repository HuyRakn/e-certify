/**
 * LinkedIn Share Utility
 * 
 * Builds LinkedIn certification URL with proper format
 * Reference: LinkedIn Profile Add Certification URL format
 */

export interface LinkedInShareParams {
  certificateName: string;
  institution: string;
  issueDate: string; // ISO date string (YYYY-MM-DD) or Date object
  verifyUrl: string; // Absolute URL to verification page
  assetId?: string; // Optional asset ID
}

/**
 * Extract year and month from date string
 */
function extractYearMonth(dateStr: string): { year: string; month: string } {
  try {
    const date = new Date(dateStr);
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return { year, month };
  } catch (e) {
    // Fallback to current date
    const now = new Date();
    return {
      year: now.getFullYear().toString(),
      month: (now.getMonth() + 1).toString().padStart(2, '0'),
    };
  }
}

/**
 * Build LinkedIn certification URL
 * 
 * Format: https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name={name}&organizationName={org}&issueYear={year}&issueMonth={month}&certUrl={url}&certId={id}
 * 
 * @param params LinkedIn share parameters
 * @returns LinkedIn URL
 */
export function buildLinkedInUrl(params: LinkedInShareParams): string {
  const { certificateName, institution, issueDate, verifyUrl, assetId } = params;
  
  // Extract year and month
  const { year, month } = extractYearMonth(issueDate);
  
  // Build base URL
  const baseUrl = 'https://www.linkedin.com/profile/add';
  
  // Build query parameters
  const queryParams = new URLSearchParams({
    startTask: 'CERTIFICATION_NAME',
    name: certificateName,
    organizationName: institution,
    issueYear: year,
    issueMonth: month,
    certUrl: verifyUrl, // Must be absolute URL
  });
  
  // Add certId if provided
  if (assetId) {
    queryParams.append('certId', assetId);
  }
  
  return `${baseUrl}?${queryParams.toString()}`;
}

/**
 * Extract certificate metadata from asset for LinkedIn share
 */
export function extractMetadataForLinkedIn(asset: any): {
  certificateName: string;
  institution: string;
  issueDate: string;
} {
  const metadata = asset?.content?.metadata || {};
  const attributes = metadata.attributes || [];
  
  // Extract certificate name
  const certificateName = metadata.name || 'Certificate';
  
  // Extract institution
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
  const issueDate = issueDateAttr?.value || new Date().toISOString().split('T')[0];
  
  return {
    certificateName,
    institution,
    issueDate,
  };
}

