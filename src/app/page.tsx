'use client';

import { useEffect } from 'react';
import { useUser } from '@stackframe/stack';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TeacherIcon, StudentIcon } from '@/components/icons/Icons';

export default function Home() {
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      // User is authenticated, check if they have a role
      const role = user.clientMetadata?.role as string;

      if (role === 'teacher') {
        router.push('/teacher');
      } else if (role === 'student') {
        router.push('/student');
      } else {
        // User is authenticated but hasn't selected a role yet
        router.push('/select-role');
      }
    }
  }, [user, router]);

  // Show loading state while checking authentication with timeout
  if (user === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated but redirecting, show loading
  if (user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show role selection for unauthenticated users
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Welcome to LecturePulse!</CardTitle>
          <CardDescription className="text-lg">
            Choose your role to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Button
              onClick={() => router.push('/auth/teacher')}
              className="h-32 flex flex-col items-center justify-center gap-4 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              <TeacherIcon className="w-8 h-8" />
              I am a Teacher
              <span className="text-sm font-normal opacity-90">
                Create lectures and view results
              </span>
            </Button>

            <Button
              onClick={() => router.push('/auth/student')}
              className="h-32 flex flex-col items-center justify-center gap-4 text-lg font-semibold bg-green-600 hover:bg-green-700"
              size="lg"
            >
              <StudentIcon className="w-8 h-8" />
              I am a Student
              <span className="text-sm font-normal opacity-90">
                Join lectures and take quizzes
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}