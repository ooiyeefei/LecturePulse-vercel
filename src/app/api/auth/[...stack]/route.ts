import { StackHandler } from "@stackframe/stack";
import { stackServerApp } from "@/stack";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, context?: any) {
  try {
    const handler = await StackHandler({
      app: stackServerApp,
      fullPage: true
    });

    // Call the handler as a function
    return await handler(request, context);
  } catch (error) {
    console.error('Stack Auth GET error:', error);
    return NextResponse.json({ error: 'Authentication error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context?: any) {
  try {
    const handler = await StackHandler({
      app: stackServerApp,
      fullPage: true
    });

    // Call the handler as a function
    return await handler(request, context);
  } catch (error) {
    console.error('Stack Auth POST error:', error);
    return NextResponse.json({ error: 'Authentication error' }, { status: 500 });
  }
}