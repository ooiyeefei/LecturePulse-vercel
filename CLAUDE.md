# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LecturePulse is a Next.js full-stack educational application that enables teachers to create interactive quizzes from lecture content and receive AI-powered feedback on student understanding. The app uses Google's Gemini AI to generate questions and analyze student responses, with S2.dev as the real-time data store.

## Technology Stack

- **Framework**: Next.js 15.1.3 with App Router
- **Frontend**: React 19.2.0 with TypeScript 5.8.2
- **Styling**: Tailwind CSS 3.4.0
- **Data Fetching**: SWR 2.2.5 for real-time polling
- **AI Integration**: Google Generative AI (@google/genai 1.27.0)
- **Data Store**: S2.dev (currently using mock implementation)
- **Package Manager**: npm

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

## Environment Setup

Create a `.env.local` file with:
```
GEMINI_API_KEY=your_gemini_api_key_here
S2_ACCESS_TOKEN=your_s2_access_token_here
```

## Architecture Overview

### Next.js App Structure
- **App Router**: `/src/app/` - Next.js 13+ app directory structure
- **API Routes**: `/src/app/api/` - Server-side API endpoints
- **Components**: `/src/components/` - Reusable UI components
- **Types**: `/src/types/` - TypeScript type definitions
- **Services**: `/src/lib/` - External service integrations

### API Routes (Server-Side)
- `POST /api/create-lecture` - Creates new lecture with AI-generated questions
- `POST /api/submit-response` - Submits student answers to S2 stream
- `GET /api/get-room-data` - Retrieves real-time room data from S2
- `POST /api/simplify` - Simplifies question text using Lingo.dev API

### Frontend Routes
- `/` - Authentication page (teacher/student selection)
- `/teacher` - Teacher dashboard for lecture creation
- `/teacher/[roomCode]` - Real-time results view with SWR polling
- `/student` - Student room join interface
- `/student/quiz/[roomCode]` - Interactive quiz interface
- `/student/done` - Post-submission confirmation

### Data Flow with S2.dev

1. **Lecture Creation**:
   - Teacher inputs lecture text
   - AI generates questions via Gemini API
   - Creates S2 stream with room code
   - Appends quiz data as first record

2. **Student Participation**:
   - Students join via room code
   - Fetch quiz data from S2 stream
   - Submit responses as new stream records

3. **Real-time Results**:
   - Teacher dashboard polls S2 stream via SWR
   - AI analyzes responses in real-time
   - Provides feedback and recommendations

### S2 Stream Structure

Each quiz session uses a unique S2 stream:
- **Record #1**: Quiz data (`QuizDataRecord`)
  ```json
  {
    "type": "quiz_data",
    "lecture_text": "...",
    "quiz": [{"id": 1, "question": "..."}]
  }
  ```
- **Record #2+**: Student responses (`StudentResponseRecord`)
  ```json
  {
    "type": "student_response",
    "student_id": "student_123",
    "answers": [{"q_id": 1, "answer": "..."}]
  }
  ```

## Key Features

1. **AI-Powered Quiz Generation**: Gemini creates comprehension questions from lecture transcripts
2. **Real-time Data Sync**: S2.dev enables live updates without WebSockets
3. **Smart Question Simplification**: Lingo.dev API simplifies complex questions
4. **Comprehensive Analytics**: AI evaluates responses and suggests re-teaching strategies
5. **Responsive Design**: Tailwind CSS for mobile-friendly interface

## Services Architecture

### Gemini Service (`/src/lib/geminiService.ts`)
- `generateQuiz()`: Creates questions from lecture text
- `evaluateStudentAnswers()`: Analyzes student responses
- `generateRecommendation()`: Suggests re-teaching strategies

### Lingo Service (`/src/lib/lingoService.ts`)
- `simplifyText()`: Simplifies question text for accessibility

### S2 Service (`/src/lib/s2.ts`)
- Currently uses mock implementation
- `basin.stream()`: Creates/accesses S2 streams
- `stream.append()`: Adds records to stream
- `stream.read()`: Retrieves stream records

## State Management

- **No Global Context**: Removed React Context in favor of server-side state
- **SWR for Data Fetching**: Real-time polling for live updates
- **Server-Side Logic**: All business logic in API routes
- **Type Safety**: Comprehensive TypeScript interfaces

## Security

- **API Key Protection**: All secrets server-side only
- **No Client-Side API Calls**: External APIs called from Next.js API routes
- **Stream Isolation**: Each room has unique S2 stream

## Development Notes

- **S2 Integration**: Currently using mock implementation (replace with actual S2 package)
- **AI API Calls**: Remove fallback data when ready for production
- **Environment Variables**: All secrets in `.env.local`
- **Real-time Updates**: 3-second polling interval via SWR
- **Error Handling**: Comprehensive error states in UI components

## Migration from Vite/React

This application was migrated from a client-side React app to Next.js:
- **Before**: In-memory context state, simulated API calls
- **After**: S2.dev data persistence, real server-side APIs
- **Benefits**: Scalable, secure, real-time data synchronization