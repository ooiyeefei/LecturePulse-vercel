import { GoogleGenAI, Type } from "@google/genai";
import { PulseQuestion, QuestionFeedback } from "../types";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is required");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const quizSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.INTEGER },
        question: { type: Type.STRING },
      },
      required: ["id", "question"],
    },
};

export const generateQuiz = async (lecture_text: string): Promise<PulseQuestion[]> => {
    try {
        const prompt = `
        You are an expert educator. Based on this lecture transcript, generate exactly 2-3 open-ended questions that test core understanding.
        - The questions should encourage critical thinking, not simple recall.
        - Output ONLY a valid JSON array in the specified format: [{"id": 1, "question": "..."}, {"id": 2, "question": "..."}]

        Transcript:
        """
        ${lecture_text}
        """`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: quizSchema,
            },
        });

        const jsonText = response.text?.trim() || '';
        const quizData = JSON.parse(jsonText);

        if (Array.isArray(quizData) && quizData.every(q => q.id && q.question)) {
            return quizData as PulseQuestion[];
        } else {
            throw new Error("Invalid JSON structure from Gemini API.");
        }
    } catch (error) {
        console.error("Error generating quiz with Gemini:", error);
        throw new Error("Failed to generate quiz from lecture content");
    }
};

const evaluationSchema = {
    type: Type.OBJECT,
    properties: {
        positive_summary: { type: Type.STRING, description: "A one-sentence summary of what students seem to understand correctly." },
        improvement_summary: { type: Type.STRING, description: "A one-sentence summary of the common themes, misconceptions, or areas for improvement." },
        teacher_feedback: { type: Type.STRING, description: "A two-sentence piece of actionable feedback for the teacher on how to address the improvement areas." },
    },
    required: ["positive_summary", "improvement_summary", "teacher_feedback"],
};

export const evaluateStudentAnswers = async (
    lecture_text: string,
    question: string,
    student_responses: {student_id: string, answer: string}[]
): Promise<Omit<QuestionFeedback, 'student_responses'>> => {
    try {
         const answersText = student_responses.map(r => `- ${r.answer}`).join('\n');
         const prompt = `
            You are an expert teaching assistant. A teacher gave a lecture and asked a question. Your task is to analyze the provided student answers to find patterns of understanding and misunderstanding.

            Original Lecture Context: "${lecture_text}"

            Question Asked: "${question}"

            Student Answers:
            ${answersText}

            Your Task:
            Provide a concise analysis in JSON format, strictly following the schema.
            1.  **positive_summary**: What did the students generally understand correctly? Identify the common thread of correct knowledge.
            2.  **improvement_summary**: What is the most common misconception or point of confusion? Be specific.
            3.  **teacher_feedback**: Based on the improvement area, provide a short, actionable piece of advice for the teacher to clarify this point to the class.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: evaluationSchema,
            }
        });

        const jsonText = response.text?.trim() || '';
        return JSON.parse(jsonText);

    } catch(error) {
        console.error("Error evaluating answers:", error);
        throw new Error("Failed to evaluate student responses");
    }
}

export const generateRecommendation = async (lecture_text: string, worst_question: string): Promise<string> => {
    try {
        const prompt = `A teacher gave this lecture: "${lecture_text}". Students seemed confused by this question: "${worst_question}".
        Write a 2-3 sentence alternative explanation (max 50 words) the teacher can say *aloud* to re-teach this specific concept. Start with "Class, let's pause for a moment..."`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text || '';
    } catch (error) {
        console.error("Error generating recommendation with Gemini:", error);
        throw new Error("Failed to generate recommendation");
    }
};