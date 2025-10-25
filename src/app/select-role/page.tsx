'use client';

import React, { useState } from 'react';
import { useUser } from '@stackframe/stack';
import { useRouter } from 'next/navigation';
import { TeacherIcon, StudentIcon } from '@/components/icons/Icons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SelectRolePage() {
  const user = useUser({ or: 'redirect' });
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelection = async (role: 'teacher' | 'student') => {
    setIsLoading(true);

    try {
      // Update user metadata with selected role
      await user.update({
        clientMetadata: {
          ...user.clientMetadata,
          role: role,
        },
      });

      // Redirect to appropriate dashboard
      if (role === 'teacher') {
        router.push('/teacher');
      } else {
        router.push('/student');
      }
    } catch (error) {
      console.error('Failed to update user role:', error);
      alert('Failed to save your role selection. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Welcome to LecturePulse!</CardTitle>
          <CardDescription className="text-lg">
            Please select your role to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Button
              onClick={() => handleRoleSelection('teacher')}
              disabled={isLoading}
              className="h-32 flex flex-col items-center justify-center gap-4 text-lg font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              size="lg"
            >
              <TeacherIcon className="w-8 h-8" />
              I am a Teacher
              <span className="text-sm font-normal opacity-90">
                Create lectures and view results
              </span>
            </Button>

            <Button
              onClick={() => handleRoleSelection('student')}
              disabled={isLoading}
              className="h-32 flex flex-col items-center justify-center gap-4 text-lg font-semibold bg-green-600 hover:bg-green-700 disabled:opacity-50"
              size="lg"
            >
              <StudentIcon className="w-8 h-8" />
              I am a Student
              <span className="text-sm font-normal opacity-90">
                Join lectures and take quizzes
              </span>
            </Button>
          </div>

          {isLoading && (
            <div className="mt-6 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Saving your selection...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}