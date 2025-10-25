'use client';

import { useUser, UserButton } from '@stackframe/stack';

export default function Header() {
  const user = useUser();

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-sm"></div>
          <h1 className="text-xl font-semibold text-foreground">LecturePulse</h1>
        </div>

        {user && (
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {user.displayName || user.primaryEmail}
            </span>
            <UserButton />
          </div>
        )}
      </div>
    </header>
  );
}