import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Redirect the sign-in handler to the correct Stack Auth API route
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  // Build the correct sign-in URL
  const correctSignInUrl = new URL('/api/auth/stack/handler/sign-in', url.origin);

  // Copy all query parameters
  searchParams.forEach((value, key) => {
    correctSignInUrl.searchParams.set(key, value);
  });

  console.log(`🔄 Redirecting sign-in from ${url.pathname} to ${correctSignInUrl.pathname}`);

  return NextResponse.redirect(correctSignInUrl.toString());
}

export async function POST(request: NextRequest) {
  return GET(request); // Handle both GET and POST
}