"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/Button";

export function NavBar() {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <nav
      className={`h-14 px-4 flex items-center justify-between flex-shrink-0 relative z-50 ${
        isHome ? "bg-transparent" : "bg-white border-b border-gray-200"
      }`}
    >
      <Link
        href="/"
        className={`text-lg font-semibold transition-colors ${
          isHome
            ? "text-white hover:text-gray-200"
            : "text-gray-900 hover:text-blue-600"
        }`}
      >
        AccountabilityAtlas
      </Link>
      <div className="flex items-center gap-3">
        <Link href="/map">
          <Button
            variant="outline"
            className="text-sm"
            style={
              isHome ? { borderColor: "white", color: "white" } : undefined
            }
          >
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
            <Link href="/profile">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={`${user.displayName}'s avatar`}
                  className={`w-7 h-7 rounded-full object-cover ${
                    isHome ? "ring-2 ring-white/50" : ""
                  }`}
                />
              ) : (
                <span
                  className={`text-sm transition-colors ${
                    isHome
                      ? "text-white hover:text-gray-200"
                      : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  {user?.displayName}
                </span>
              )}
            </Link>
            <button
              onClick={logout}
              className={`text-sm ${
                isHome
                  ? "text-gray-300 hover:text-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Sign Out
            </button>
          </>
        ) : (
          <Link
            href={
              isHome
                ? "/login"
                : `/login?redirect=${encodeURIComponent(pathname)}`
            }
          >
            <Button
              variant="outline"
              className="text-sm"
              style={
                isHome ? { borderColor: "white", color: "white" } : undefined
              }
            >
              Sign In
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
}
