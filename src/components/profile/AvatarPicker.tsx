"use client";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { updateProfile } from "@/lib/api/users";
import type { User, AvatarSources } from "@/types/api";

interface AvatarPickerProps {
  readonly user: User;
  readonly avatarSources?: AvatarSources;
  readonly onUpdate: (user: User) => void;
  readonly onSuccess: () => void;
  readonly onError: (msg: string) => void;
}

export function AvatarPicker({
  user,
  avatarSources,
  onUpdate,
  onSuccess,
  onError,
}: AvatarPickerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isSaving, setIsSaving] = useState(false);

  const openDialog = () => dialogRef.current?.showModal();
  const closeDialog = () => dialogRef.current?.close();

  const initials = user.displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSelect = async (url: string) => {
    setIsSaving(true);
    try {
      const updated = await updateProfile({ avatarUrl: url });
      onUpdate(updated);
      onSuccess();
      closeDialog();
    } catch {
      onError("Failed to update avatar.");
    } finally {
      setIsSaving(false);
    }
  };

  const sources: { label: string; url: string }[] = [];
  if (avatarSources?.gravatar) {
    sources.push({ label: "Gravatar", url: avatarSources.gravatar });
  }
  if (avatarSources?.youtube) {
    sources.push({ label: "YouTube", url: avatarSources.youtube });
  }

  return (
    <div className="flex items-center gap-4">
      {user.avatarUrl ? (
        <img
          src={user.avatarUrl}
          alt={`${user.displayName}'s avatar`}
          className="w-16 h-16 rounded-full object-cover"
          data-testid="profile-avatar"
        />
      ) : (
        <div
          className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-xl font-bold text-gray-600"
          data-testid="profile-avatar-placeholder"
        >
          {initials}
        </div>
      )}
      <div>
        <Button
          variant="outline"
          className="text-sm"
          onClick={openDialog}
          data-testid="change-avatar-button"
        >
          Change Avatar
        </Button>
      </div>
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <dialog
        ref={dialogRef}
        className="rounded-lg shadow-lg p-6 space-y-4 max-w-sm w-full mx-4 backdrop:bg-black/50"
        aria-label="Choose Avatar"
        data-testid="avatar-picker-modal"
        onClick={(e) => {
          if (e.target === dialogRef.current) closeDialog();
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") closeDialog();
        }}
      >
        <h3 className="text-lg font-semibold text-gray-900">Choose Avatar</h3>
        {sources.length === 0 ? (
          <p className="text-sm text-gray-500">No avatar sources available.</p>
        ) : (
          <div className="space-y-3">
            {sources.map((source) => (
              <button
                key={source.label}
                onClick={() => handleSelect(source.url)}
                disabled={isSaving}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-50"
                data-testid={`avatar-source-${source.label.toLowerCase()}`}
              >
                <img
                  src={source.url}
                  alt={source.label}
                  className="w-12 h-12 rounded-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <span className="text-sm font-medium text-gray-700">
                  {source.label}
                </span>
              </button>
            ))}
          </div>
        )}
        <div className="flex justify-end">
          <Button variant="outline" className="text-sm" onClick={closeDialog}>
            Cancel
          </Button>
        </div>
      </dialog>
    </div>
  );
}
