import React, { useState, useEffect } from 'react';
import { PulseQuestion, StudentResponseRecord, QuestionFeedback, Results } from '../types';
import { UsersIcon, SparklesIcon, CheckCircleIcon, LightbulbIcon } from './icons/Icons';

// Add Chevron icons
const ChevronDownIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-4 w-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);

const ChevronUpIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-4 w-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
);
import { evaluateStudentAnswers, generateRecommendation } from '../lib/geminiService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ResultsDashboardProps {
  roomCode: string;
  quiz: PulseQuestion[];
  lectureText: string;
  studentResponses: StudentResponseRecord[];
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ roomCode, quiz, lectureText, studentResponses }) => {
  const [results, setResults] = useState<Results | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

  const toggleQuestionExpanded = (questionId: number) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    const generateResults = async () => {
      if (studentResponses.length === 0) {
        setResults({
          total_responses: 0,
          per_question_feedback: {},
          ai_recommendation: null
        });
        return;
      }

      setLoading(true);
      try {
        const total_responses = studentResponses.length;
        const per_question_feedback: { [key: number]: QuestionFeedback } = {};

        // Process each question
        for (const question of quiz) {
          const student_responses = studentResponses
            .map(r => ({
                student_id: r.student_id,
                answer: r.answers.find(a => a.q_id === question.id)?.answer || ""
            }))
            .filter(r => r.answer);

          if (student_responses.length === 0) {
            per_question_feedback[question.id] = {
              positive_summary: "No responses yet for this question.",
              improvement_summary: "",
              teacher_feedback: "",
              student_responses: []
            };
            continue;
          }

          const analysis = await evaluateStudentAnswers(lectureText, question.question, student_responses);
          per_question_feedback[question.id] = { ...analysis, student_responses };
        }

        // Generate recommendation if needed
        let ai_recommendation: string | null = null;
        const hasConfusingQuestion = Object.values(per_question_feedback).some(f =>
          f.improvement_summary.toLowerCase().includes("misconception") ||
          f.improvement_summary.toLowerCase().includes("confus")
        );

        if (hasConfusingQuestion) {
          const worst_question = quiz[0]; // Simplified selection
          ai_recommendation = await generateRecommendation(lectureText, worst_question.question);
        }

        setResults({ total_responses, per_question_feedback, ai_recommendation });
      } catch (error) {
        console.error("Error generating results:", error);
      } finally {
        setLoading(false);
      }
    };

    generateResults();
  }, [quiz, lectureText, studentResponses]);

  if (!results || studentResponses.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">
            Room Code: <span className="text-primary tracking-widest font-mono">{roomCode}</span>
          </h2>
          <p className="text-muted-foreground mb-6">Waiting for student responses...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">Live Results</CardTitle>
              <CardDescription>
                Room Code: <span className="font-mono text-white bg-primary px-2 py-1 rounded tracking-widest">{roomCode}</span>
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 text-lg">
              <UsersIcon className="w-5 h-5" />
              <span>{results.total_responses} Responses</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* General Session Summary */}
      <SessionOverview
        quiz={quiz}
        results={results}
        loading={loading}
        aiRecommendation={results?.ai_recommendation}
        aiRecommendationLoading={loading && !results?.ai_recommendation}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>AI-Powered Feedback</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (expandedQuestions.size === quiz.length) {
                  setExpandedQuestions(new Set());
                } else {
                  setExpandedQuestions(new Set(quiz.map(q => q.id)));
                }
              }}
              className="text-slate-400 hover:text-white border-slate-600"
            >
              {expandedQuestions.size === quiz.length ? 'Collapse All' : 'Expand All'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {quiz.map(question => (
              <QuestionFeedbackCard
                  key={question.id}
                  question={question}
                  feedback={results.per_question_feedback[question.id]}
                  isLoading={loading && !results.per_question_feedback[question.id]}
                  isExpanded={expandedQuestions.has(question.id)}
                  onToggleExpanded={() => toggleQuestionExpanded(question.id)}
              />
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

const SessionOverview: React.FC<{
    quiz: any[],
    results: Results | null,
    loading: boolean,
    aiRecommendation?: string | null,
    aiRecommendationLoading?: boolean
}> = ({ quiz, results, loading, aiRecommendation, aiRecommendationLoading }) => {
    if (!results || loading) {
        return (
            <Card className="border-slate-600 bg-slate-800/50">
                <CardHeader>
                    <CardTitle className="text-xl text-white">Session Overview</CardTitle>
                    <CardDescription className="text-slate-300">Analyzing overall session performance...</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                </CardContent>
            </Card>
        );
    }

    // Analyze overall session performance
    const totalQuestions = quiz.length;
    const questionsWithResponses = Object.keys(results.per_question_feedback).length;

    // Count questions with understanding vs improvement needed
    let questionsWellUnderstood = 0;
    let questionsNeedingImprovement = 0;
    let majorMisconceptions = 0;

    const allPositiveFeedback: string[] = [];
    const allImprovementFeedback: string[] = [];

    Object.values(results.per_question_feedback).forEach(feedback => {
        // Analyze the quality of positive and improvement feedback
        const hasGoodPositiveFeedback = feedback.positive_summary &&
            feedback.positive_summary !== "No responses yet for this question." &&
            !feedback.positive_summary.toLowerCase().includes("no discernible") &&
            !feedback.positive_summary.toLowerCase().includes("i dont know") &&
            !feedback.positive_summary.toLowerCase().includes("no correct understanding");

        const hasSignificantImprovementNeeds = feedback.improvement_summary &&
            feedback.improvement_summary.trim() !== "" &&
            (feedback.improvement_summary.toLowerCase().includes("misconception") ||
             feedback.improvement_summary.toLowerCase().includes("completely lacks") ||
             feedback.improvement_summary.toLowerCase().includes("fundamental") ||
             feedback.improvement_summary.toLowerCase().includes("confusion") ||
             feedback.improvement_summary.toLowerCase().includes("incorrect") ||
             feedback.improvement_summary.toLowerCase().includes("does not understand"));

        // Collect all feedback for summary
        if (feedback.positive_summary && feedback.positive_summary !== "No responses yet for this question.") {
            allPositiveFeedback.push(feedback.positive_summary);
        }

        if (feedback.improvement_summary && feedback.improvement_summary.trim() !== "") {
            allImprovementFeedback.push(feedback.improvement_summary);
        }

        // Categorize question: prioritize improvement needs over positive feedback
        if (hasSignificantImprovementNeeds) {
            questionsNeedingImprovement++;

            // Check for major misconceptions
            if (feedback.improvement_summary.toLowerCase().includes("misconception") ||
                feedback.improvement_summary.toLowerCase().includes("completely lacks") ||
                feedback.improvement_summary.toLowerCase().includes("fundamental")) {
                majorMisconceptions++;
            }
        } else if (hasGoodPositiveFeedback) {
            questionsWellUnderstood++;
        }
        // If neither significant improvement needs nor good positive feedback, it's neutral (not counted in either category)
    });

    // Calculate session quality score
    const responseRate = Math.round((results.total_responses / Math.max(results.total_responses, 10)) * 100);
    const understandingRate = Math.round((questionsWellUnderstood / totalQuestions) * 100);

    // Generate overall assessment
    let overallAssessment = "";
    let assessmentColor = "";
    let assessmentIcon = null;

    if (understandingRate >= 70) {
        overallAssessment = "Strong Understanding";
        assessmentColor = "text-green-400 border-green-500/30 bg-green-500/10";
        assessmentIcon = <CheckCircleIcon className="h-6 w-6 text-green-400" />;
    } else if (understandingRate >= 40) {
        overallAssessment = "Mixed Understanding";
        assessmentColor = "text-yellow-400 border-yellow-500/30 bg-yellow-500/10";
        assessmentIcon = <LightbulbIcon className="h-6 w-6 text-yellow-400" />;
    } else {
        overallAssessment = "Needs Attention";
        assessmentColor = "text-red-400 border-red-500/30 bg-red-500/10";
        assessmentIcon = <SparklesIcon className="h-6 w-6 text-red-400" />;
    }

    return (
        <Card className={`border-2 ${assessmentColor}`}>
            <CardHeader>
                <div className="flex items-center gap-3">
                    {assessmentIcon}
                    <div>
                        <CardTitle className="text-xl text-white">Session Overview</CardTitle>
                        <CardDescription className="text-slate-300">
                            Overall performance across {totalQuestions} questions
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* AI Re-Teach Suggestion at the top */}
                {aiRecommendationLoading && (
                    <div className="border border-primary/20 bg-primary/5 rounded-lg p-4">
                        <div className="flex items-center gap-4">
                            <SparklesIcon className="text-primary h-8 w-8 flex-shrink-0" />
                            <div>
                                <h3 className="text-lg font-bold text-white">AI Assistant is thinking...</h3>
                                <p className="text-slate-400">Analyzing overall understanding to provide a re-teach suggestion.</p>
                            </div>
                        </div>
                    </div>
                )}

                {aiRecommendation && (
                    <div className="border border-primary/20 bg-primary/5 rounded-lg p-4">
                        <div className="flex items-center gap-4 mb-4">
                            <SparklesIcon className="text-primary h-8 w-8 flex-shrink-0" />
                            <h3 className="text-xl font-bold text-white">AI Re-Teach Suggestion</h3>
                        </div>
                        <p className="text-lg font-mono italic text-slate-200">&ldquo;{aiRecommendation}&rdquo;</p>
                    </div>
                )}

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
                        <div className="flex items-center gap-2 mb-2">
                            <UsersIcon className="h-5 w-5 text-blue-400" />
                            <p className="font-semibold text-blue-400">Participation</p>
                        </div>
                        <p className="text-2xl font-bold text-white">{results.total_responses}</p>
                        <p className="text-sm text-slate-400">student responses</p>
                    </div>

                    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircleIcon className="h-5 w-5 text-green-400" />
                            <p className="font-semibold text-green-400">Well Understood</p>
                        </div>
                        <p className="text-2xl font-bold text-white">{questionsWellUnderstood}/{totalQuestions}</p>
                        <p className="text-sm text-slate-400">questions ({understandingRate}%)</p>
                    </div>

                    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
                        <div className="flex items-center gap-2 mb-2">
                            <LightbulbIcon className="h-5 w-5 text-amber-400" />
                            <p className="font-semibold text-amber-400">Need Review</p>
                        </div>
                        <p className="text-2xl font-bold text-white">{questionsNeedingImprovement}</p>
                        <p className="text-sm text-slate-400">questions</p>
                    </div>
                </div>

                {/* Overall Assessment */}
                <div className="border-t border-slate-600 pt-4">
                    <h4 className="text-lg font-bold text-white mb-3">📊 Session Assessment: {overallAssessment}</h4>

                    {questionsWellUnderstood > 0 && (
                        <div className="mb-4">
                            <h5 className="font-semibold text-green-400 mb-2">✅ What's Working Well:</h5>
                            <p className="text-sm text-slate-300 bg-green-500/10 p-3 rounded border border-green-500/30">
                                Students demonstrated good understanding in {questionsWellUnderstood} out of {totalQuestions} questions.
                                {allPositiveFeedback.length > 0 && " Key strengths include clear grasp of fundamental concepts and ability to apply knowledge appropriately."}
                            </p>
                        </div>
                    )}

                    {questionsNeedingImprovement > 0 && (
                        <div className="mb-4">
                            <h5 className="font-semibold text-amber-400 mb-2">⚠️ Areas Needing Attention:</h5>
                            <p className="text-sm text-slate-300 bg-amber-500/10 p-3 rounded border border-amber-500/30">
                                {questionsNeedingImprovement} questions showed areas for improvement.
                                {majorMisconceptions > 0 ?
                                    `${majorMisconceptions} questions revealed significant misconceptions that should be addressed before moving forward.` :
                                    "Most gaps appear to be knowledge-based rather than fundamental misconceptions."
                                }
                            </p>
                        </div>
                    )}

                    {results.total_responses > 0 && (
                        <div>
                            <h5 className="font-semibold text-blue-400 mb-2">🎯 Teaching Recommendation:</h5>
                            <p className="text-sm text-slate-300 bg-blue-500/10 p-3 rounded border border-blue-500/30">
                                {understandingRate >= 70 ?
                                    "Strong overall understanding. Consider moving to more advanced topics or application-based activities." :
                                    understandingRate >= 40 ?
                                    "Mixed understanding suggests reviewing key concepts before advancing. Focus on the areas highlighted in individual question feedback." :
                                    "Significant gaps in understanding. Recommend revisiting fundamental concepts with different teaching approaches before proceeding."
                                }
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

const QuestionFeedbackCard: React.FC<{
    question: any,
    feedback: any,
    isLoading: boolean,
    isExpanded: boolean,
    onToggleExpanded: () => void
}> = ({ question, feedback, isLoading, isExpanded, onToggleExpanded }) => {
    const [isOpen, setIsOpen] = useState(false);

    if (isLoading) {
        return (
          <div className="border-t border-slate-600 pt-4">
            <p className="text-slate-400">Analyzing answers for &ldquo;Q{question.id}: {question.question}&rdquo;...</p>
          </div>
        );
    }

    if (!feedback) return null;

    return (
        <div className="border-t border-slate-600 pt-6 first:border-t-0 first:pt-0">
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-white">Q{question.id}: {question.question}</h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleExpanded}
                    className="text-slate-400 hover:text-white flex items-center gap-2"
                >
                    {isExpanded ? 'Hide Details' : 'Show Details'}
                    {isExpanded ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
                </Button>
            </div>

            {isExpanded && (
                <div className="space-y-4">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Card className="border-green-500/40 bg-green-500/20">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircleIcon className="h-6 w-6 text-green-400" />
                            <p className="font-semibold text-green-300">What Students Understood</p>
                        </div>
                        <p className="text-sm text-slate-200">{feedback.positive_summary}</p>
                    </CardContent>
                </Card>

                <Card className="border-amber-500/40 bg-amber-500/20">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <LightbulbIcon className="h-6 w-6 text-amber-400" />
                            <p className="font-semibold text-amber-300">Areas for Improvement</p>
                        </div>
                        <p className="text-sm text-slate-200">{feedback.improvement_summary}</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-blue-500/40 bg-blue-500/20 mb-4">
                <CardContent className="p-4">
                    <p className="font-semibold text-blue-300 mb-2">Suggested Teacher Feedback:</p>
                    <p className="text-sm text-slate-200">{feedback.teacher_feedback}</p>
                </CardContent>
            </Card>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(!isOpen)}
                      className="text-xs"
                    >
                        {isOpen ? 'Hide' : 'Show'} {feedback.student_responses.length} Student Answers
                    </Button>

                    {isOpen && (
                        <Card className="mt-3 max-h-48 overflow-y-auto">
                            <CardContent className="p-4 space-y-3">
                                {feedback.student_responses.map((res: { student_id: string, answer: string }, i: number) => (
                                     <div key={i} className="border-b border-slate-600 pb-2 last:border-b-0 last:pb-0">
                                        <p className="text-xs font-mono text-slate-400">Student ID: {res.student_id.substring(5, 11)}</p>
                                        <p className="text-sm pl-2 text-slate-200">&ldquo;{res.answer}&rdquo;</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    )
}


export default ResultsDashboard;