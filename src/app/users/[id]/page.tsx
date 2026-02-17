"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { getPublicProfile } from "@/lib/api/users";

interface PublicProfilePageProps {
  params: Promise<{ id: string }>;
}

export default function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { id } = use(params);

  const {
    data: profile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["public-profile", id],
    queryFn: () => getPublicProfile(id),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">User not found.</p>
        <Link href="/map" className="text-blue-600 hover:underline">
          Back to Map
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <div className="flex items-center gap-4">
            {profile.avatarUrl && (
              <img
                src={profile.avatarUrl}
                alt={`${profile.displayName}'s avatar`}
                className="w-16 h-16 rounded-full object-cover"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {profile.displayName}
              </h1>
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <p>
              Member since{" "}
              {new Date(profile.memberSince).toLocaleDateString()}
            </p>
            <p>
              {profile.approvedVideoCount} approved video
              {profile.approvedVideoCount !== 1 ? "s" : ""}
            </p>
          </div>

          {profile.socialLinks &&
            Object.values(profile.socialLinks).some(Boolean) && (
              <div className="space-y-2">
                <h2 className="text-sm font-semibold text-gray-700">
                  Social Links
                </h2>
                <div className="flex flex-wrap gap-3">
                  {profile.socialLinks.youtube && (
                    <SocialLink
                      label="YouTube"
                      href={`https://youtube.com/channel/${profile.socialLinks.youtube}`}
                    />
                  )}
                  {profile.socialLinks.facebook && (
                    <SocialLink
                      label="Facebook"
                      href={`https://facebook.com/${profile.socialLinks.facebook}`}
                    />
                  )}
                  {profile.socialLinks.instagram && (
                    <SocialLink
                      label="Instagram"
                      href={`https://instagram.com/${profile.socialLinks.instagram}`}
                    />
                  )}
                  {profile.socialLinks.tiktok && (
                    <SocialLink
                      label="TikTok"
                      href={`https://tiktok.com/@${profile.socialLinks.tiktok}`}
                    />
                  )}
                  {profile.socialLinks.xTwitter && (
                    <SocialLink
                      label="X"
                      href={`https://x.com/${profile.socialLinks.xTwitter}`}
                    />
                  )}
                  {profile.socialLinks.bluesky && (
                    <SocialLink
                      label="Bluesky"
                      href={`https://bsky.app/profile/${profile.socialLinks.bluesky}`}
                    />
                  )}
                </div>
              </div>
            )}

          <div className="pt-4">
            <Link
              href="/map"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              &larr; Back to Map
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function SocialLink({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm text-blue-600 hover:underline"
    >
      {label}
    </a>
  );
}
