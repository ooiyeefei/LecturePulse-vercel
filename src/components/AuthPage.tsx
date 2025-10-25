import React from 'react';
import { TeacherIcon, StudentIcon } from './icons/Icons';

interface AuthPageProps {
  onLogin: (role: 'teacher' | 'student') => void;
  onLogout: () => void;
  user: { role: 'teacher' | 'student' } | null;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onLogout, user }) => {

  return (
    <div className="flex flex-col items-center justify-center h-full animate-fade-in text-center">
      <div className="mb-12">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-600">
          LecturePulse
        </h1>
        <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
          Stop guessing if your students are lost. Get real-time feedback on what they understand.
        </p>
      </div>
      <div className="w-full max-w-2xl flex flex-col md:flex-row gap-6">
        <button
          onClick={() => onLogin('teacher')}
          className="w-full flex items-center justify-center gap-3 py-4 px-6 text-lg font-semibold rounded-lg bg-gray-800 border border-gray-700 hover:bg-blue-600 hover:border-blue-600 transition-all duration-300 transform hover:-translate-y-1 text-white"
        >
          <TeacherIcon />
          Login as a Teacher
        </button>
        <button
          onClick={() => onLogin('student')}
          className="w-full flex items-center justify-center gap-3 py-4 px-6 text-lg font-semibold rounded-lg bg-gray-800 border border-gray-700 hover:bg-green-600 hover:border-green-600 transition-all duration-300 transform hover:-translate-y-1 text-white"
        >
          <StudentIcon />
          Login as a Student
        </button>
      </div>
    </div>
  );
};

export default AuthPage;