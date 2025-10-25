'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@stackframe/stack';
import { SignIn } from '@stackframe/stack';
import { StudentIcon } from '@/components/icons/Icons';

export default function StudentAuthPage() {
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      // User is signed in, set their role to student and redirect
      const updateUserRole = async () => {
        try {
          await user.update({
            clientMetadata: { role: 'student' }
          });
          router.push('/student');
        } catch (error) {
          console.error('Failed to set student role:', error);
        }
      };
      updateUserRole();
    }
  }, [user, router]);

  if (user) {
    // Show loading while updating role and redirecting
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Setting up your student account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="mb-4 flex justify-center">
            <StudentIcon className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold">Student Sign In</h1>
          <p className="text-muted-foreground">
            Sign in to access the student dashboard
          </p>
        </div>

        <SignIn
          fullPage={false}
          automaticRedirect={false}
        />
      </div>
    </div>
  );
}