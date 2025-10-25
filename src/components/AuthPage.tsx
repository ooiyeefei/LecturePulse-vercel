'use client';
import React from 'react';
import { SignIn } from '@stackframe/stack';

const AuthPage: React.FC = () => {
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
      <div className="w-full max-w-md">
        <SignIn
          fullPage={false}
          automaticRedirect={true}
        />
      </div>
    </div>
  );
};

export default AuthPage;