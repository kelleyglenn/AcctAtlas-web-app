"use client";
import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { updateProfile } from "@/lib/api/users";
import type { SocialLinks, User } from "@/types/api";

interface SocialLinksFormProps {
  socialLinks: SocialLinks;
  onUpdate: (user: User) => void;
  onSuccess: () => void;
  onError: (msg: string) => void;
}

export function SocialLinksForm({
  socialLinks,
  onUpdate,
  onSuccess,
  onError,
}: SocialLinksFormProps) {
  const [links, setLinks] = useState<SocialLinks>({ ...socialLinks });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field: keyof SocialLinks, value: string) => {
    setLinks((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await updateProfile({ socialLinks: links });
      onUpdate(updated);
      onSuccess();
    } catch {
      onError("Failed to update social links.");
    } finally {
      setIsSaving(false);
    }
  };

  const fields: {
    key: keyof SocialLinks;
    label: string;
    placeholder: string;
  }[] = [
    {
      key: "youtube",
      label: "YouTube",
      placeholder: "Channel ID (e.g., UCxyz...)",
    },
    {
      key: "facebook",
      label: "Facebook",
      placeholder: "Profile URL or username",
    },
    { key: "instagram", label: "Instagram", placeholder: "Username (no @)" },
    { key: "tiktok", label: "TikTok", placeholder: "Username (no @)" },
    {
      key: "xTwitter",
      label: "X (Twitter)",
      placeholder: "Username (no @)",
    },
    {
      key: "bluesky",
      label: "Bluesky",
      placeholder: "Handle (e.g., user.bsky.social)",
    },
  ];

  return (
    <div className="space-y-4">
      {fields.map(({ key, label, placeholder }) => (
        <Input
          key={key}
          name={key}
          label={label}
          value={links[key] || ""}
          onChange={(e) => handleChange(key, e.target.value)}
          placeholder={placeholder}
        />
      ))}
      <div className="flex justify-end">
        <Button onClick={handleSave} isLoading={isSaving}>
          Save
        </Button>
      </div>
    </div>
  );
}
