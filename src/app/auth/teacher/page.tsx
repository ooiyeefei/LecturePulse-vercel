'use client';

import React, { useEffect } from 'react';
import { useUser, SignIn } from '@stackframe/stack';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TeacherIcon } from '@/components/icons/Icons';

export default function TeacherAuthPage() {
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      // User is authenticated, set their role to teacher and redirect
      const setRoleAndRedirect = async () => {
        try {
          await user.update({
            clientMetadata: {
              ...user.clientMetadata,
              role: 'teacher',
            },
          });
          router.push('/teacher');
        } catch (error) {
          console.error('Failed to set teacher role:', error);
        }
      };

      setRoleAndRedirect();
    }
  }, [user, router]);

  // Show loading while checking authentication
  if (user === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is authenticated, show loading while setting role
  if (user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="text-center pt-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Setting up your teacher account...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show authentication for unauthenticated users
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <TeacherIcon className="w-12 h-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Teacher Sign In</CardTitle>
          <CardDescription>
            Sign in to create lectures and manage your classes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignIn
            fullPage={false}
            automaticRedirect={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}