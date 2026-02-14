import type { Metadata } from "next";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { NavBar } from "@/components/NavBar";
import "./globals.css";

export const metadata: Metadata = {
  title: "AccountabilityAtlas",
  description: "Geo-located video curation for constitutional rights audits",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100 flex flex-col">
        <QueryProvider>
          <AuthProvider>
            <NavBar />
            <main className="flex-1">{children}</main>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
