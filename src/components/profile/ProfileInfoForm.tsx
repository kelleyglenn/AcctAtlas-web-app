"use client";
import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { updateProfile } from "@/lib/api/users";
import type { User } from "@/types/api";

interface ProfileInfoFormProps {
  user: User;
  onUpdate: (user: User) => void;
  onSuccess: () => void;
  onError: (msg: string) => void;
}

export function ProfileInfoForm({
  user,
  onUpdate,
  onSuccess,
  onError,
}: ProfileInfoFormProps) {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!displayName.trim() || displayName.length < 2) return;
    setIsSaving(true);
    try {
      const updated = await updateProfile({ displayName });
      onUpdate(updated);
      onSuccess();
    } catch {
      onError("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input
        name="displayName"
        label="Display Name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        minLength={2}
        maxLength={50}
      />
      <div className="flex justify-end">
        <Button onClick={handleSave} isLoading={isSaving}>
          Save
        </Button>
      </div>
    </div>
  );
}
