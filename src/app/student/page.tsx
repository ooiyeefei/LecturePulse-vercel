'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@stackframe/stack';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Header from '@/components/header';

const StudentJoin: React.FC = () => {
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    if (role !== 'student') {
      // User is not a student, redirect based on their role or to role selection
      if (role === 'teacher') {
        router.push('/teacher');
      } else {
        router.push('/select-role');
      }
    }
  }, [user, router]);

  // Show loading state while checking authentication
  if (user === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is not authenticated or not a student, show loading while redirecting
  if (!user || user.clientMetadata?.role !== 'student') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleJoin = async () => {
    if (!roomCode.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/get-room-data?room_code=${roomCode}`);

      if (!response.ok) {
        throw new Error('Invalid room code or room not found');
      }

      const data = await response.json();

      if (data.records && data.records.length > 0) {
        router.push(`/student/quiz/${roomCode}`);
      } else {
        throw new Error('Room code is invalid or no active quiz found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Join a Lecture</CardTitle>
            <CardDescription>
              Enter the 4-digit room code provided by your teacher
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-4 bg-destructive/15 border border-destructive/20 rounded-md">
                <p className="text-destructive text-sm text-center">{error}</p>
              </div>
            )}

            <Input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="ROOM CODE"
              className="text-center tracking-[0.5em] font-mono text-xl h-12"
              disabled={loading}
              maxLength={4}
            />

            <Button
              onClick={handleJoin}
              disabled={loading || !roomCode.trim()}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  Joining...
                </>
              ) : (
                'Join Lecture'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentJoin;