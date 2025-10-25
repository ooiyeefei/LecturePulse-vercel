export interface User {
  id: string;
  role: 'teacher' | 'student';
}

// Updated to support open-ended questions (removed options and correct_answer)
export interface PulseQuestion {
  id: number;
  question: string;
}

export interface StudentAnswer {
  q_id: number;
  answer: string; // This will now be the student's text input
}

// Updated to remove scoring
export interface StudentResponse {
  id: string;
  student_id: string;
  answers: StudentAnswer[];
}

export interface Lecture {
  id: string;
  room_code: string;
  lecture_text: string;
  quiz_json: PulseQuestion[];
  ai_recommendation: string | null;
  is_live: boolean;
  responses: StudentResponse[];
  created_at: Date;
}

// This represents the AI's evaluation of all answers for a single question
export interface QuestionFeedback {
    positive_summary: string; // What students understood well.
    improvement_summary: string; // Common misconceptions or areas to improve.
    teacher_feedback: string; // Actionable feedback for the teacher.
    student_responses: { student_id: string; answer: string }[]; // List of raw student answers with IDs.
}

// Updated to reflect the shift from quantitative scores to qualitative feedback
export interface Results {
    total_responses: number;
    per_question_feedback: { [key: number]: QuestionFeedback };
    ai_recommendation: string | null; // The overall re-teach recommendation
}

// S2 Stream Record Types
export interface SessionMetadata {
  user_id: string;
  user_name: string;
  room_code: string;
  created_at: string;
  status: 'active' | 'completed';
}

export interface QuizDataRecord {
  type: 'quiz_data';
  lecture_text: string;
  quiz: PulseQuestion[];
  session_metadata?: SessionMetadata;
}

export interface StudentResponseRecord {
  type: 'student_response';
  student_id: string;
  answers: StudentAnswer[];
}

export type StreamRecord = QuizDataRecord | StudentResponseRecord;