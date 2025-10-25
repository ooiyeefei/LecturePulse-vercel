import { NextRequest, NextResponse } from 'next/server';
import { basin } from '@/lib/s2';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const room_code = searchParams.get('room_code');

    if (!room_code) {
      return NextResponse.json(
        { error: 'room_code parameter is required' },
        { status: 400 }
      );
    }

    // Get the S2 stream
    const stream = basin.stream('room-' + room_code);

    // Read all records from the stream (limit of 500)
    const records = await stream.read({ limit: 500 });

    return NextResponse.json({ records });

  } catch (error) {
    console.error('Error getting room data:', error);
    return NextResponse.json(
      { error: 'Failed to get room data' },
      { status: 500 }
    );
  }
}