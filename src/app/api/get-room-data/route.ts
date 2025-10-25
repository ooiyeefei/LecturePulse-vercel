import { NextRequest, NextResponse } from 'next/server';
import { s2, basin } from '@/lib/s2';

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

    // Find the stream that matches this room code
    // New format: user-{userId}-room-{roomCode}
    // Old format: room-{roomCode} (for backward compatibility)

    let streamName = '';
    let records = [];

    try {
      // First, try to find the stream by searching all streams
      console.log(`🔍 Searching for room code: ${room_code}`);
      const streamList = await s2.listStreams();

      // Look for streams ending with this room code
      const matchingStream = streamList.streams?.find((stream: any) =>
        stream.name?.endsWith(`-room-${room_code}`) || stream.name === `room-${room_code}`
      );

      if (matchingStream) {
        streamName = matchingStream.name;
        console.log(`✅ Found stream: ${streamName}`);
      } else {
        // Fallback to old format for backward compatibility
        streamName = `room-${room_code}`;
        console.log(`🔄 Trying fallback stream name: ${streamName}`);
      }

      // Get the S2 stream and read records
      const stream = basin.stream(streamName);
      records = await stream.read({ limit: 500 });

      console.log(`📖 Retrieved ${records.length} records from ${streamName}`);

    } catch (searchError) {
      console.error(`❌ Error searching for stream with room code ${room_code}:`, searchError);

      // Last resort: try the old format directly
      try {
        console.log(`🔄 Last resort: trying old format room-${room_code}`);
        const fallbackStream = basin.stream(`room-${room_code}`);
        records = await fallbackStream.read({ limit: 500 });
        streamName = `room-${room_code}`;
      } catch (fallbackError) {
        console.error(`❌ Fallback also failed:`, fallbackError);
        throw new Error(`Room ${room_code} not found`);
      }
    }

    return NextResponse.json({
      records,
      stream_name: streamName,
      room_code
    });

  } catch (error) {
    console.error('Error getting room data:', error);
    return NextResponse.json(
      { error: 'Failed to get room data' },
      { status: 500 }
    );
  }
}