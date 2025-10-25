import { NextRequest, NextResponse } from 'next/server';
import { basin } from '@/lib/s2';
import { StudentResponseRecord } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { room_code, student_id, answers } = await request.json();

    if (!room_code || !student_id || !answers) {
      return NextResponse.json(
        { error: 'room_code, student_id, and answers are required' },
        { status: 400 }
      );
    }

    // Get the existing S2 stream for the room_code
    const stream = basin.stream('room-' + room_code);

    // Append a new record
    const responseData: StudentResponseRecord = {
      type: 'student_response',
      student_id,
      answers
    };

    await stream.append(responseData);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error submitting response:', error);
    return NextResponse.json(
      { error: 'Failed to submit response' },
      { status: 500 }
    );
  }
}