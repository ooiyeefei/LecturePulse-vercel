import { StackHandler } from "@stackframe/stack";
import { stackServerApp } from "@/stack";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, context: any) {
  const handler = StackHandler({ app: stackServerApp, fullPage: true });
  return await handler;
}

export async function POST(request: NextRequest, context: any) {
  const handler = StackHandler({ app: stackServerApp, fullPage: true });
  return await handler;
}