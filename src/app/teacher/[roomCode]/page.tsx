'use client';

import React, { useEffect } from 'react';
import useSWR from 'swr';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@stackframe/stack';
import ResultsDashboard from '@/components/ResultsDashboard';
import { StreamRecord, QuizDataRecord, StudentResponseRecord } from '@/types';
import Header from '@/components/header';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const TeacherResultsPage: React.FC = () => {
  const params = useParams();
  const roomCode = params.roomCode as string;
  const router = useRouter();
  const user = useUser();

  useEffect(() => {
    if (user === undefined) {
      // Still loading authentication state
      return;
    }

    if (!user) {
      // User is not authenticated, redirect to home
      router.push('/');
      return;
    }

    const role = user.clientMetadata?.role as string;
    if (role !== 'teacher') {
      // User is not a teacher, redirect based on their role or to role selection
      if (role === 'student') {
        router.push('/student');
      } else {
        router.push('/select-role');
      }
    }
  }, [user, router]);

  const { data, error, isLoading } = useSWR(
    `/api/get-room-data?room_code=${roomCode}`,
    fetcher,
    { refreshInterval: 3000 } // Poll every 3 seconds
  );

  // Show loading state while checking authentication
  if (user === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is not authenticated or not a teacher, show loading while redirecting
  if (!user || user.clientMetadata?.role !== 'teacher') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">Loading results...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <p className="text-lg text-destructive mb-4">Error loading room data</p>
            <p className="text-muted-foreground">Please check if the room code is valid</p>
          </div>
        </div>
      </div>
    );
  }

  const records: StreamRecord[] = data?.records || [];

  // Find the quiz data record (should be the first one)
  const quizDataRecord = records.find(record => record.type === 'quiz_data') as QuizDataRecord;

  // Find all student response records
  const studentResponses = records.filter(record => record.type === 'student_response') as StudentResponseRecord[];

  if (!quizDataRecord) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">No quiz data found for this room</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Live Results - Room {roomCode}</h1>
          <p className="text-lg text-muted-foreground">
            {studentResponses.length} student{studentResponses.length !== 1 ? 's' : ''} responded
          </p>
        </div>

        <ResultsDashboard
          roomCode={roomCode}
          quiz={quizDataRecord.quiz}
          lectureText={quizDataRecord.lecture_text}
          studentResponses={studentResponses}
        />
      </div>
    </div>
  );
};

export default TeacherResultsPage;