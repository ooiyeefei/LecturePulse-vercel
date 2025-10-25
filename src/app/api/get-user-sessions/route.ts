import { NextRequest, NextResponse } from 'next/server';
import { s2, basin } from '@/lib/s2';
import { stackServerApp } from '@/stack';
import { QuizDataRecord, SessionMetadata } from '@/types';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'active', 'completed', or null for all

    // Get all streams from S2
    const streamList = await s2.listStreams();
    console.log('📋 All streams from S2:', streamList);

    // Filter streams that belong to this user
    const userStreamPattern = `user-${user.id}-room-`;
    const userStreams = streamList.streams?.filter((stream: any) =>
      stream.name?.startsWith(userStreamPattern)
    ) || [];

    console.log(`🔍 Found ${userStreams.length} streams for user ${user.id}`);

    // Fetch session data from each stream
    const sessions = await Promise.all(
      userStreams.map(async (streamInfo: any) => {
        try {
          const stream = basin.stream(streamInfo.name);
          const records = await stream.read({ limit: 1 }); // Just get the first record (quiz data)

          if (records.length > 0) {
            const quizRecord = records[0] as QuizDataRecord;

            // If status filter is specified, apply it
            if (status && quizRecord.session_metadata?.status !== status) {
              return null; // Filter out sessions that don't match status
            }

            return {
              stream_name: streamInfo.name,
              room_code: quizRecord.session_metadata?.room_code || streamInfo.name.split('-').pop(),
              lecture_text: quizRecord.lecture_text,
              quiz_count: quizRecord.quiz?.length || 0,
              created_at: quizRecord.session_metadata?.created_at || 'Unknown',
              status: quizRecord.session_metadata?.status || 'active',
              user_name: quizRecord.session_metadata?.user_name || 'Unknown Teacher'
            };
          }
          return null;
        } catch (error) {
          console.error(`❌ Failed to read stream ${streamInfo.name}:`, error);
          return null;
        }
      })
    );

    // Filter out null sessions and sort by creation time
    const validSessions = sessions
      .filter(session => session !== null)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    console.log(`✅ Returning ${validSessions.length} sessions for user ${user.id}`);

    return NextResponse.json({
      sessions: validSessions,
      user_id: user.id,
      total_count: validSessions.length
    });

  } catch (error) {
    console.error('❌ Error fetching user sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}