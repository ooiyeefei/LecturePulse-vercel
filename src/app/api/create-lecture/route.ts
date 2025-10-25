import { NextRequest, NextResponse } from 'next/server';
import { basin } from '@/lib/s2';
import { generateQuiz } from '@/lib/geminiService';
import { QuizDataRecord } from '@/types';

export async function POST(request: NextRequest) {
  try {
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

    // Get the S2 stream
    const stream = basin.stream('room-' + roomCode);

    // Append the first record to the stream
    const quizData: QuizDataRecord = {
      type: 'quiz_data',
      lecture_text,
      quiz: quiz_json
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