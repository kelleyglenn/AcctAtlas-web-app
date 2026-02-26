import type { Metadata } from "next";
import PublicProfileClient from "./PublicProfileClient";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

interface UserPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: UserPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return { title: "User Profile" };
    const user = await res.json();
    return { title: user.displayName || "User Profile" };
  } catch {
    return { title: "User Profile" };
  }
}

export default function UserPage() {
  return <PublicProfileClient />;
}
