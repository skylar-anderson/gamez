import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Get allowed origins from environment variable
  const allowedOrigins = process.env.ALLOWED_FRAME_ORIGINS?.split(',') || [];
  
  // If we have allowed origins, set the CSP header
  if (allowedOrigins.length > 0) {
    const frameAncestors = ['\'self\'', ...allowedOrigins].join(' ');
    response.headers.set(
      'Content-Security-Policy',
      `frame-ancestors ${frameAncestors}`
    );
  }
  
  // Remove X-Frame-Options to prevent conflicts with CSP
  response.headers.delete('X-Frame-Options');
  
  return response;
}

export const config = {
  matcher: '/:path*',
};