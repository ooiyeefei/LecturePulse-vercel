'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@stackframe/stack';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SparklesIcon } from '@/components/icons/Icons';
import Header from '@/components/header';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Add Microphone icon
const MicrophoneIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-4 w-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
  </svg>
);

const TeacherDashboard: React.FC = () => {
  const [lectureText, setLectureText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('create');
  const router = useRouter();
  const user = useUser();

  // Fetch live sessions (active)
  const { data: liveSessions, error: liveError } = useSWR(
    user ? '/api/get-user-sessions?status=active' : null,
    fetcher,
    { refreshInterval: 5000 } // Poll every 5 seconds for live sessions
  );

  // Fetch past sessions (completed)
  const { data: pastSessions, error: pastError } = useSWR(
    user ? '/api/get-user-sessions?status=completed' : null,
    fetcher
  );

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

  const handleGenerate = async () => {
    if (!lectureText.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/create-lecture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lecture_text: lectureText }),
      });

      if (!response.ok) {
        throw new Error('Failed to create lecture');
      }

      const data = await response.json();
      router.push(`/teacher/${data.room_code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create">Create New Pulse</TabsTrigger>
            <TabsTrigger value="live">Live Sessions</TabsTrigger>
            <TabsTrigger value="past">Past Sessions</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New Pulse Check</CardTitle>
                <CardDescription>
                  Paste your transcript to generate open-ended questions for your class.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <div className="p-4 bg-destructive/15 border border-destructive/20 rounded-md">
                    <p className="text-destructive text-sm">{error}</p>
                  </div>
                )}

                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="lecture-textarea" className="text-sm font-medium text-foreground">
                    Lecture Transcript
                  </label>
                  <div className="relative group">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                      className="text-slate-400 border-slate-600 hover:border-slate-500 cursor-not-allowed"
                    >
                      <MicrophoneIcon className="w-4 h-4 mr-2" />
                      Record My Lecture
                    </Button>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                      Coming Soon
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                    </div>
                  </div>
                </div>

                <Textarea
                  id="lecture-textarea"
                  value={lectureText}
                  onChange={(e) => setLectureText(e.target.value)}
                  placeholder="Paste your transcript here..."
                  className="min-h-[200px] resize-none"
                  disabled={loading}
                />

                <Button
                  onClick={handleGenerate}
                  disabled={loading || !lectureText.trim()}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  ) : (
                    <SparklesIcon className="w-4 h-4 mr-2" />
                  )}
                  {loading ? 'Generating...' : 'Generate Pulse Check'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="live" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Live Sessions</CardTitle>
                <CardDescription>
                  Sessions currently running where students can join and respond
                </CardDescription>
              </CardHeader>
              <CardContent>
                {liveError ? (
                  <div className="p-4 bg-destructive/15 border border-destructive/20 rounded-md">
                    <p className="text-destructive text-sm">Failed to load live sessions</p>
                  </div>
                ) : !liveSessions ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : liveSessions.sessions?.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No active sessions</p>
                    <p className="text-sm text-muted-foreground">Create a new pulse check to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {liveSessions.sessions?.map((session: any, index: number) => (
                      <Card key={index} className="cursor-pointer hover:bg-accent/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                  <span className="font-semibold">Room {session.room_code}</span>
                                </div>
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                  LIVE
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">
                                {session.quiz_count} question{session.quiz_count !== 1 ? 's' : ''}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Created: {new Date(session.created_at).toLocaleString()}
                              </p>
                            </div>
                            <Button
                              onClick={() => router.push(`/teacher/${session.room_code}`)}
                              size="sm"
                            >
                              View Results
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="past" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Past Sessions</CardTitle>
                <CardDescription>
                  Previously completed sessions and their results
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pastError ? (
                  <div className="p-4 bg-destructive/15 border border-destructive/20 rounded-md">
                    <p className="text-destructive text-sm">Failed to load past sessions</p>
                  </div>
                ) : !pastSessions ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : pastSessions.sessions?.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No completed sessions</p>
                    <p className="text-sm text-muted-foreground">Your completed sessions will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pastSessions.sessions?.map((session: any, index: number) => (
                      <Card key={index} className="cursor-pointer hover:bg-accent/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                                  <span className="font-semibold">Room {session.room_code}</span>
                                </div>
                                <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                                  COMPLETED
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">
                                {session.quiz_count} question{session.quiz_count !== 1 ? 's' : ''}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Created: {new Date(session.created_at).toLocaleString()}
                              </p>
                            </div>
                            <Button
                              onClick={() => router.push(`/teacher/${session.room_code}`)}
                              variant="outline"
                              size="sm"
                            >
                              View Results
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TeacherDashboard;