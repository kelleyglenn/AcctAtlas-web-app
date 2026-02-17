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
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>

        <div className="space-y-3">
          <ProfileField label="Email" value={user.email} />
          <ProfileField label="Trust Tier" value={user.trustTier} />
          <ProfileField
            label="Email Verified"
            value={user.emailVerified ? "Yes" : "No"}
          />
          {user.createdAt && (
            <ProfileField
              label="Member Since"
              value={new Date(user.createdAt).toLocaleDateString()}
            />
          )}
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

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}
