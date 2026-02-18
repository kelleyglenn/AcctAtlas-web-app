"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ProfileInfoForm } from "@/components/profile/ProfileInfoForm";
import { SocialLinksForm } from "@/components/profile/SocialLinksForm";
import { PrivacySettingsForm } from "@/components/profile/PrivacySettingsForm";
import { AvatarPicker } from "@/components/profile/AvatarPicker";
import { MySubmissions } from "@/components/profile/MySubmissions";
import { ToastContainer, useToasts } from "@/components/ui/Toast";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout, refreshUser } = useAuth();
  const { toasts, dismissToast, success, error } = useToasts();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshUser();
    }
  }, [isAuthenticated, refreshUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleUpdate = () => {
    refreshUser();
  };

  const handleSuccess = () => {
    success("Profile saved successfully.");
  };

  const handleError = (msg: string) => {
    error(msg);
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start gap-6">
            <AvatarPicker
              user={user}
              avatarSources={user.avatarSources}
              onUpdate={handleUpdate}
              onSuccess={handleSuccess}
              onError={handleError}
            />
            <div className="flex-1 space-y-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {user.displayName}
              </h1>
              <span
                className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                data-testid="trust-tier-badge"
              >
                {user.trustTier}
              </span>
              {user.createdAt && (
                <p className="text-sm text-gray-500">
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </p>
              )}
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Info</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileInfoForm
              user={user}
              onUpdate={handleUpdate}
              onSuccess={handleSuccess}
              onError={handleError}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Social Links</CardTitle>
          </CardHeader>
          <CardContent>
            <SocialLinksForm
              socialLinks={user.socialLinks || {}}
              onUpdate={handleUpdate}
              onSuccess={handleSuccess}
              onError={handleError}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Privacy Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <PrivacySettingsForm
              privacySettings={
                user.privacySettings || {
                  socialLinksVisibility: "REGISTERED",
                  submissionsVisibility: "REGISTERED",
                }
              }
              onUpdate={handleUpdate}
              onSuccess={handleSuccess}
              onError={handleError}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <MySubmissions />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-2">
          <Link href="/">
            <Button variant="outline" className="w-full">
              Back to Home
            </Button>
          </Link>
          <Button variant="secondary" className="w-full" onClick={handleLogout}>
            Sign Out
          </Button>
        </div>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </main>
  );
}
