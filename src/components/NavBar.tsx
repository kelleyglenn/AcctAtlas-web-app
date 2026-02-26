"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/Button";

function useNavStyles() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return {
    isHome,
    pathname,
    nav: isHome ? "bg-transparent" : "bg-white border-b border-gray-200",
    brand: isHome
      ? "text-white hover:text-gray-200"
      : "text-gray-900 hover:text-blue-600",
    outlineStyle: isHome
      ? ({ borderColor: "white", color: "white" } as const)
      : undefined,
    displayName: isHome
      ? "text-white hover:text-gray-200"
      : "text-gray-600 hover:text-blue-600",
    avatarRing: isHome ? "ring-2 ring-white/50" : "",
    signOut: isHome
      ? "text-gray-300 hover:text-white"
      : "text-gray-500 hover:text-gray-700",
    loginHref: isHome
      ? "/login"
      : (`/login?redirect=${encodeURIComponent(pathname)}` as string),
  };
}

export function NavBar() {
  const { user, isAuthenticated, logout } = useAuth();
  const styles = useNavStyles();

  return (
    <nav
      className={`h-14 px-4 flex items-center justify-between flex-shrink-0 relative z-50 ${styles.nav}`}
    >
      <Link
        href="/"
        className={`text-lg font-semibold transition-colors ${styles.brand}`}
      >
        AccountabilityAtlas
      </Link>
      <div className="flex items-center gap-3">
        <Link href="/map">
          <Button
            variant="outline"
            className="text-sm"
            style={styles.outlineStyle}
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
                  className={`w-7 h-7 rounded-full object-cover ${styles.avatarRing}`}
                />
              ) : (
                <span
                  className={`text-sm transition-colors ${styles.displayName}`}
                >
                  {user?.displayName}
                </span>
              )}
            </Link>
            <button onClick={logout} className={`text-sm ${styles.signOut}`}>
              Sign Out
            </button>
          </>
        ) : (
          <Link href={styles.loginHref}>
            <Button
              variant="outline"
              className="text-sm"
              style={styles.outlineStyle}
            >
              Sign In
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
}
