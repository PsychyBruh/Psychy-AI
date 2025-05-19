// src/components/Navbar.tsx
import React from 'react';

const Navbar: React.FC = () => {
  return (
    <nav className="w-full flex items-center justify-between px-4 py-2 border-b bg-background text-foreground">
      <div className="flex items-center gap-2">
        <img src="/next.svg" alt="Psychy AI Logo" className="h-8 w-8" />
        <span className="font-bold text-lg">Psychy AI</span>
      </div>
      <div className="flex items-center gap-4">
        {/* Profile dropdown and menu will go here */}
        <button className="rounded-full bg-gray-200 dark:bg-gray-700 w-10 h-10 flex items-center justify-center">
          <span className="sr-only">Open profile menu</span>
          <img src="/file.svg" alt="Profile" className="h-8 w-8 rounded-full" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
