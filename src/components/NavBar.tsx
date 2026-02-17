"use client";

import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/Button";

export function NavBar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="h-14 bg-white border-b border-gray-200 px-4 flex items-center justify-between flex-shrink-0">
      <Link
        href="/"
        className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
      >
        AccountabilityAtlas
      </Link>
      <div className="flex items-center gap-3">
        <Link href="/map">
          <Button variant="outline" className="text-sm">
            Explore Map
          </Button>
        </Link>
        {isAuthenticated ? (
          <>
            <Link href="/videos/new">
              <Button variant="primary" className="text-sm">
                Submit Video
              </Button>
            </Link>
            <Link
              href="/profile"
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              {user?.displayName}
            </Link>
            <button
              onClick={logout}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Sign Out
            </button>
          </>
        ) : (
          <Link href="/login">
            <Button variant="outline" className="text-sm">
              Sign In
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
}
