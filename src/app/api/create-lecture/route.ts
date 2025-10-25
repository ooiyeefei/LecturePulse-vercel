import { NextRequest, NextResponse } from 'next/server';
import { basin } from '@/lib/s2';
import { generateQuiz } from '@/lib/geminiService';
import { QuizDataRecord } from '@/types';
import { stackServerApp } from '@/stack';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await stackServerApp.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is a teacher
    const role = user.clientMetadata?.role as string;
    if (role !== 'teacher') {
      return NextResponse.json(
        { error: 'Teacher role required' },
        { status: 403 }
      );
    }

    const { lecture_text } = await request.json();

    if (!lecture_text || typeof lecture_text !== 'string') {
      return NextResponse.json(
        { error: 'lecture_text is required and must be a string' },
        { status: 400 }
      );
    }

    // Generate quiz using Gemini API
    const quiz_json = await generateQuiz(lecture_text);

    // Generate a 4-digit room code
    const roomCode = Math.floor(1000 + Math.random() * 9000).toString();

    // Create stream name with user ID for easy filtering
    const streamName = `user-${user.id}-room-${roomCode}`;
    const stream = basin.stream(streamName);

    // Append the first record to the stream with session metadata
    const quizData: QuizDataRecord = {
      type: 'quiz_data',
      lecture_text,
      quiz: quiz_json,
      session_metadata: {
        user_id: user.id,
        user_name: user.displayName || user.primaryEmail || 'Unknown Teacher',
        room_code: roomCode,
        created_at: new Date().toISOString(),
        status: 'active' // active, completed
      }
    };

    await stream.append(quizData);

    return NextResponse.json({ room_code: roomCode });

  } catch (error) {
    console.error('Error creating lecture:', error);
    return NextResponse.json(
      { error: 'Failed to create lecture' },
      { status: 500 }
    );
  }
}