import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Redirect the sign-up handler to the correct Stack Auth API route
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  // Build the correct sign-up URL
  const correctSignUpUrl = new URL('/api/auth/stack/handler/sign-up', url.origin);

  // Copy all query parameters
  searchParams.forEach((value, key) => {
    correctSignUpUrl.searchParams.set(key, value);
  });

  console.log(`🔄 Redirecting sign-up from ${url.pathname} to ${correctSignUpUrl.pathname}`);

  return NextResponse.redirect(correctSignUpUrl.toString());
}

export async function POST(request: NextRequest) {
  return GET(request); // Handle both GET and POST
}