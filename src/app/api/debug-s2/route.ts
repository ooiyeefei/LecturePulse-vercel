import { NextResponse } from 'next/server';
import { s2 } from '@/lib/s2';

export async function GET() {
  try {
    // List streams from the real S2.dev basin
    const streamsData = await (s2 as any).listStreams();

    return NextResponse.json({
      success: true,
      message: 'S2 Debug Data Retrieved',
      data: {
        basin: 'lecture-pulse',
        streams: streamsData,
        authTokenSet: !!process.env.S2_ACCESS_TOKEN
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Debug S2 error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve S2 debug data',
        details: error instanceof Error ? error.message : 'Unknown error',
        authTokenSet: !!process.env.S2_ACCESS_TOKEN
      },
      { status: 500 }
    );
  }
}