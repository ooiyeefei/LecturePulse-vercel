import { StackHandler } from "@stackframe/stack";
import { stackServerApp } from "@/stack";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const handler = await StackHandler({
    app: stackServerApp,
    fullPage: true
  });

  return handler(request);
}

export async function POST(request: NextRequest) {
  const handler = await StackHandler({
    app: stackServerApp,
    fullPage: true
  });

  return handler(request);
}