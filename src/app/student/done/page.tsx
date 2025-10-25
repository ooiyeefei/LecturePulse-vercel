'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircleIcon } from '@/components/icons/Icons';
import Header from '@/components/header';

const StudentDone: React.FC = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <CheckCircleIcon className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Thank You!</CardTitle>
            <CardDescription>
              Your responses have been submitted successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground text-sm">
              Your teacher will review your answers and provide feedback to help improve understanding.
            </p>

            <div className="space-y-3">
              <Button
                onClick={() => router.push('/student')}
                className="w-full"
                size="lg"
              >
                Join Another Quiz
              </Button>

              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDone;