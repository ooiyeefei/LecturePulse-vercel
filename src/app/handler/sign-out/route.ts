import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Redirect the sign-out handler to the correct Stack Auth API route
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  // Build the correct sign-out URL
  const correctSignOutUrl = new URL('/api/auth/stack/handler/sign-out', url.origin);

  // Copy all query parameters
  searchParams.forEach((value, key) => {
    correctSignOutUrl.searchParams.set(key, value);
  });

  console.log(`🔄 Redirecting sign-out from ${url.pathname} to ${correctSignOutUrl.pathname}`);

  return NextResponse.redirect(correctSignOutUrl.toString());
}

export async function POST(request: NextRequest) {
  return GET(request); // Handle both GET and POST
}