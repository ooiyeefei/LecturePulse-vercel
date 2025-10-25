'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TeacherIcon, StudentIcon } from '@/components/icons/Icons';

export default function Home() {
  const router = useRouter();

  const handleLogin = (role: 'teacher' | 'student') => {
    if (role === 'teacher') {
      router.push('/teacher');
    } else {
      router.push('/student');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg"></div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              LecturePulse
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stop guessing if your students are lost. Get real-time feedback on what they understand.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Card className="border-border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => handleLogin('teacher')}>
            <CardContent className="p-8 text-center">
              <div className="mb-4 flex justify-center">
                <TeacherIcon className="w-12 h-12 text-blue-500" />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-card-foreground">Login as a Teacher</h2>
              <p className="text-muted-foreground text-sm">Create pulse checks and view student responses</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => handleLogin('student')}>
            <CardContent className="p-8 text-center">
              <div className="mb-4 flex justify-center">
                <StudentIcon className="w-12 h-12 text-green-500" />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-card-foreground">Login as a Student</h2>
              <p className="text-muted-foreground text-sm">Join a lecture and answer questions</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}