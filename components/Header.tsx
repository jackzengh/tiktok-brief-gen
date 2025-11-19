"use client";

import { useSession } from "next-auth/react";

interface HeaderProps {
  onSignOut: () => void;
}

export default function Header({ onSignOut }: HeaderProps) {
  const { data: session } = useSession();

  return (
    <header className="absolute top-0 right-0 p-6">
      {session?.user && (
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {session.user.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {session.user.email}
            </p>
          </div>
          {session.user.image && (
            <img
              src={session.user.image}
              alt={session.user.name || "User"}
              className="h-10 w-10 rounded-full"
            />
          )}
          <button
            onClick={onSignOut}
            className="ml-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      )}
    </header>
  );
}
