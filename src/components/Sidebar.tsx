// src/components/Sidebar.tsx
import React from 'react';

const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 h-full bg-gray-50 dark:bg-gray-900 border-r flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <span className="font-semibold">Conversations</span>
        <button className="text-psychy-green font-bold">+ New Chat</button>
      </div>
      <ul className="flex-1 overflow-y-auto">
        {/* Conversation list items will go here */}
        <li className="p-3 hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer flex items-center justify-between">
          <span>New Chat</span>
          <button className="text-xs text-gray-500">...</button>
        </li>
      </ul>
      <div className="p-4 border-t">
        <button className="w-full text-left text-sm text-gray-500">Archived</button>
      </div>
    </aside>
  );
};

export default Sidebar;
