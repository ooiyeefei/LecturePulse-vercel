'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PulseQuestion, StudentAnswer, QuizDataRecord, StreamRecord } from '@/types';
import { SparklesIcon } from '@/components/icons/Icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import Header from '@/components/header';

const StudentQuiz: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const roomCode = params.roomCode as string;

  const [questions, setQuestions] = useState<PulseQuestion[]>([]);
  const [answers, setAnswers] = useState<StudentAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [simplifyingQuestionId, setSimplifyingQuestionId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const response = await fetch(`/api/get-room-data?room_code=${roomCode}`);

        if (!response.ok) {
          throw new Error('Failed to load quiz');
        }

        const data = await response.json();
        const records: StreamRecord[] = data.records || [];

        // Find the quiz data record
        const quizDataRecord = records.find(record => record.type === 'quiz_data') as QuizDataRecord;

        if (!quizDataRecord) {
          throw new Error('No quiz found for this room');
        }

        setQuestions(quizDataRecord.quiz);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [roomCode]);

  const handleAnswerChange = (q_id: number, answer: string) => {
    setAnswers(prev => {
      const otherAnswers = prev.filter(a => a.q_id !== q_id);
      return [...otherAnswers, { q_id, answer }];
    });
  };

  const handleSimplify = async (question: PulseQuestion) => {
    setSimplifyingQuestionId(question.id);
    try {
      const response = await fetch('/api/simplify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: question.question }),
      });

      if (response.ok) {
        const data = await response.json();
        setQuestions(prev => prev.map(q =>
          q.id === question.id ? { ...q, question: data.simplified_text } : q
        ));
      }
    } catch (err) {
      console.error('Failed to simplify question:', err);
    } finally {
      setSimplifyingQuestionId(null);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const studentId = `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const response = await fetch('/api/submit-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          room_code: roomCode,
          student_id: studentId,
          answers,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit answers');
      }

      router.push('/student/done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit answers');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header showLogout />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">Loading quiz...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header showLogout />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
          <Card className="max-w-md w-full">
            <CardContent className="text-center pt-6">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => router.push('/student')}>
                Back to Join
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const answeredQuestions = new Set(answers.map(a => a.q_id));
  const isSubmitDisabled = answeredQuestions.size !== questions.length;

  return (
    <div className="min-h-screen bg-background">
      <Header showLogout />

      <div className="container mx-auto p-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Pulse Check Quiz</h2>
            <p className="text-muted-foreground">
              Room Code: <span className="font-mono text-primary">{roomCode}</span>
            </p>
          </div>

          <div className="space-y-6">
            {questions.map((q, index) => (
              <Card key={q.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg flex-1 pr-4">
                      {index + 1}. {q.question}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSimplify(q)}
                      disabled={simplifyingQuestionId === q.id}
                      className="shrink-0"
                    >
                      {simplifyingQuestionId === q.id ? (
                        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                      ) : (
                        <SparklesIcon className="h-4 w-4" />
                      )}
                      Simplify
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    placeholder="Type your answer here..."
                    className="min-h-[100px] resize-none"
                  />
                </CardContent>
              </Card>
            ))}

            <Button
              onClick={handleSubmit}
              disabled={isSubmitDisabled || submitting}
              className="w-full"
              size="lg"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  Submitting...
                </>
              ) : (
                'Submit Answers'
              )}
            </Button>

            {isSubmitDisabled && (
              <p className="text-center text-sm text-muted-foreground">
                Please answer all questions before submitting.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentQuiz;