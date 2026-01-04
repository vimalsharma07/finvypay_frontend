/**
 * Utility functions for constructing S3 bucket URLs dynamically
 * Uses environment variables to avoid hardcoded bucket URLs
 */

/**
 * Get the base URL for S3 bucket files
 * Checks multiple environment variables in order of preference:
 * 1. NEXT_PUBLIC_S3_BASE_URL (for client-side usage)
 * 2. NEXT_PUBLIC_AWS_BASE_URL (alternative client-side)
 * 3. Constructs from STORAGE_ENDPOINT (server-side)
 * 4. Falls back to default if none are set
 */
export function getS3BaseUrl(): string {
  // Client-side: Use NEXT_PUBLIC_ prefixed variables
  if (typeof window !== 'undefined') {
    const clientBaseUrl = 
      process.env.NEXT_PUBLIC_S3_BASE_URL || 
      process.env.NEXT_PUBLIC_AWS_BASE_URL ||
      process.env.NEXT_PUBLIC_STORAGE_BASE_URL;
    
    if (clientBaseUrl) {
      return clientBaseUrl.replace(/\/$/, ''); // Remove trailing slash
    }
  }
  
  // Server-side: Use STORAGE_ENDPOINT or construct from bucket
  const serverEndpoint = process.env.STORAGE_ENDPOINT?.replace(/\/$/, '');
  if (serverEndpoint) {
    return serverEndpoint;
  }
  
  // Fallback: Try to construct from bucket name (for AWS S3)
  const bucket = process.env.STORAGE_BUCKET || process.env.NEXT_PUBLIC_STORAGE_BUCKET;
  const region = process.env.STORAGE_REGION || process.env.NEXT_PUBLIC_STORAGE_REGION || 'us-east-1';
  
  if (bucket) {
    // AWS S3 format: https://{bucket}.s3.{region}.amazonaws.com
    // Or: https://{bucket}.s3.amazonaws.com (for us-east-1)
    if (region === 'us-east-1') {
      return `https://${bucket}.s3.amazonaws.com`;
    }
    return `https://${bucket}.s3.${region}.amazonaws.com`;
  }
  
  // Last resort: return empty string (caller should handle)
  if (typeof window !== 'undefined') {
    console.warn('⚠️ No S3 base URL configured. Set NEXT_PUBLIC_S3_BASE_URL or NEXT_PUBLIC_STORAGE_BUCKET in your .env.local file.');
    console.warn('Available env vars:', {
      NEXT_PUBLIC_S3_BASE_URL: process.env.NEXT_PUBLIC_S3_BASE_URL,
      NEXT_PUBLIC_AWS_BASE_URL: process.env.NEXT_PUBLIC_AWS_BASE_URL,
      NEXT_PUBLIC_STORAGE_BASE_URL: process.env.NEXT_PUBLIC_STORAGE_BASE_URL,
      NEXT_PUBLIC_STORAGE_BUCKET: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
      STORAGE_ENDPOINT: process.env.STORAGE_ENDPOINT,
      STORAGE_BUCKET: process.env.STORAGE_BUCKET,
    });
  }
  return '';
}

/**
 * Construct a full S3 URL from a publicId or relative path
 * @param publicId - The publicId or relative path (e.g., "uploads/file.png")
 * @returns Full URL to the file
 */
export function getS3FileUrl(publicId: string): string {
  if (!publicId) return '';
  
  // If it's already a full URL, return it
  if (publicId.startsWith('http://') || publicId.startsWith('https://')) {
    return publicId;
  }
  
  const baseUrl = getS3BaseUrl();
  if (!baseUrl) {
    console.warn('Cannot construct S3 URL: base URL not configured');
    return publicId; // Return as-is if we can't construct
  }
  
  // Ensure publicId doesn't start with /
  const cleanPublicId = publicId.startsWith('/') ? publicId.slice(1) : publicId;
  
  return `${baseUrl}/${cleanPublicId}`;
}

/**
 * Get icon URL helper - same as getS3FileUrl but with null handling
 * @param iconUrl - The icon URL or publicId
 * @returns Full URL or null if not provided
 */
export function getIconUrl(iconUrl?: string | null): string | null {
  if (!iconUrl) return null;
  return getS3FileUrl(iconUrl);
}

