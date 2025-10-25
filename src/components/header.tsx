'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  showLogout?: boolean;
  onLogout?: () => void;
}

export default function Header({ showLogout = false, onLogout }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      router.push('/');
    }
  };

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-sm"></div>
          <h1 className="text-xl font-semibold text-foreground">LecturePulse</h1>
        </div>

        {showLogout && (
          <Button variant="ghost" onClick={handleLogout}>
            Logout
          </Button>
        )}
      </div>
    </header>
  );
}