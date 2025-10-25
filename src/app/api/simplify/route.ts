import { NextRequest, NextResponse } from 'next/server';
import { simplifyText } from '@/lib/lingoService';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'text is required and must be a string' },
        { status: 400 }
      );
    }

    // Call the real Lingo.dev API here
    const simplified_text = await simplifyText(text);

    return NextResponse.json({ simplified_text });

  } catch (error) {
    console.error('Error simplifying text:', error);
    return NextResponse.json(
      { error: 'Failed to simplify text' },
      { status: 500 }
    );
  }
}