'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Header from '@/components/header';

const StudentJoin: React.FC = () => {
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
      <Header showLogout />

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