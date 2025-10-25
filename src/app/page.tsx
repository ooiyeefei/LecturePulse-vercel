'use client';

import { useEffect } from 'react';
import { useUser } from '@stackframe/stack';
import { useRouter } from 'next/navigation';
import AuthPage from '@/components/AuthPage';

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
    // If user is null (not authenticated), we'll show the AuthPage below
  }, [user, router]);

  // Show loading state while checking authentication
  if (user === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is not authenticated, show the auth page
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <AuthPage />
      </div>
    );
  }

  // If we reach here, the user is authenticated but redirecting, show loading
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}