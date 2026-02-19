"use client";
import { useState } from "react";
import { updateProfile } from "@/lib/api/users";
import type { PrivacySettings, User } from "@/types/api";

interface PrivacySettingsFormProps {
  readonly privacySettings: PrivacySettings;
  readonly onUpdate: (user: User) => void;
  readonly onSuccess: () => void;
  readonly onError: (msg: string) => void;
}

export function PrivacySettingsForm({
  privacySettings,
  onUpdate,
  onSuccess,
  onError,
}: PrivacySettingsFormProps) {
  const [settings, setSettings] = useState<PrivacySettings>({
    ...privacySettings,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = async (newSettings: PrivacySettings) => {
    setSettings(newSettings);
    setIsSaving(true);
    try {
      const updated = await updateProfile({ privacySettings: newSettings });
      onUpdate(updated);
      onSuccess();
    } catch {
      onError("Failed to update privacy settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={settings.socialLinksVisibility === "PUBLIC"}
          onChange={(e) =>
            handleToggle({
              ...settings,
              socialLinksVisibility: e.target.checked ? "PUBLIC" : "REGISTERED",
            })
          }
          disabled={isSaving}
          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-700">
          Social links visible to everyone
        </span>
      </label>
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={settings.submissionsVisibility === "PUBLIC"}
          onChange={(e) =>
            handleToggle({
              ...settings,
              submissionsVisibility: e.target.checked ? "PUBLIC" : "REGISTERED",
            })
          }
          disabled={isSaving}
          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-700">
          Submissions visible to everyone
        </span>
      </label>
    </div>
  );
}
