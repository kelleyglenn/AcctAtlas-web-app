"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { YouTubePreview } from "@/components/video/YouTubePreview";
import { LocationPicker } from "@/components/video/LocationPicker";
import { previewVideo, createVideo } from "@/lib/api/videos";
import { createLocation } from "@/lib/api/locations";
import { useToasts, ToastContainer } from "@/components/ui/Toast";
import { AMENDMENT_OPTIONS, PARTICIPANT_TYPE_OPTIONS } from "@/types/map";
import type {
  VideoPreview,
  ReverseGeocodeResponse,
  ApiErrorDetail,
} from "@/types/api";
import axios from "axios";

export function VideoSubmitForm() {
  const router = useRouter();
  const { toasts, dismissToast, success, error: showError } = useToasts();

  // YouTube URL state
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [preview, setPreview] = useState<VideoPreview | null>(null);
  const [urlError, setUrlError] = useState("");
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  // Form fields
  const [videoDate, setVideoDate] = useState("");
  const [amendments, setAmendments] = useState<string[]>([]);
  const [participants, setParticipants] = useState<string[]>([]);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    geocode: ReverseGeocodeResponse;
  } | null>(null);

  // Validation
  const [amendmentError, setAmendmentError] = useState("");
  const [participantError, setParticipantError] = useState("");
  const [locationError, setLocationError] = useState("");

  // Submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePreview = async () => {
    if (!youtubeUrl.trim()) return;
    setUrlError("");
    setIsLoadingPreview(true);
    setPreview(null);

    try {
      const result = await previewVideo(youtubeUrl);
      if (result.alreadyExists) {
        setUrlError("This video has already been submitted.");
        setPreview(result);
      } else {
        setPreview(result);
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 400) setUrlError("Please enter a valid YouTube URL.");
        else if (status === 422)
          setUrlError("This video is unavailable or private.");
        else setUrlError("Failed to fetch video info. Please try again.");
      } else {
        setUrlError("An unexpected error occurred.");
      }
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const toggleAmendment = (amendment: string) => {
    setAmendmentError("");
    setAmendments((prev) =>
      prev.includes(amendment)
        ? prev.filter((a) => a !== amendment)
        : [...prev, amendment]
    );
  };

  const toggleParticipant = (participant: string) => {
    setParticipantError("");
    setParticipants((prev) =>
      prev.includes(participant)
        ? prev.filter((p) => p !== participant)
        : [...prev, participant]
    );
  };

  const validate = (): boolean => {
    let valid = true;
    if (amendments.length === 0) {
      setAmendmentError("Select at least one amendment.");
      valid = false;
    }
    if (participants.length === 0) {
      setParticipantError("Select at least one participant type.");
      valid = false;
    }
    if (!location) {
      setLocationError("Click the map to place a location.");
      valid = false;
    }
    return valid;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!preview || preview.alreadyExists || !validate()) return;

    setIsSubmitting(true);
    try {
      // Create location first
      const loc = await createLocation({
        coordinates: {
          latitude: location!.latitude,
          longitude: location!.longitude,
        },
        displayName: location!.geocode.displayName,
        address: location!.geocode.address,
        city: location!.geocode.city,
        state: location!.geocode.state,
        country: location!.geocode.country,
      });

      // Create video with location
      const video = await createVideo({
        youtubeUrl,
        amendments,
        participants,
        videoDate: videoDate || undefined,
        locationId: loc.id,
      });

      success("Video submitted successfully!");
      router.push(`/videos/${video.id}`);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        const status = err.response.status;
        if (status === 409) {
          showError("This video has already been submitted.");
        } else if (status === 400 && err.response.data?.details) {
          const details = err.response.data.details as ApiErrorDetail[];
          for (const detail of details) {
            if (detail.field === "amendments")
              setAmendmentError(detail.message);
            else if (detail.field === "participants")
              setParticipantError(detail.message);
            else if (detail.field === "locationId")
              setLocationError(detail.message);
          }
          if (
            !details.some((d) =>
              ["amendments", "participants", "locationId"].includes(d.field)
            )
          ) {
            showError(err.response.data.message || "Validation failed.");
          }
        } else {
          showError("Failed to submit video. Please try again.");
        }
      } else {
        showError("Failed to submit video. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* YouTube URL */}
      <div className="mb-6">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              label="YouTube URL"
              type="url"
              value={youtubeUrl}
              onChange={(e) => {
                setYoutubeUrl(e.target.value);
                setUrlError("");
              }}
              placeholder="https://www.youtube.com/watch?v=..."
              error={urlError}
              required
            />
          </div>
          <div className="pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handlePreview}
              isLoading={isLoadingPreview}
            >
              Preview
            </Button>
          </div>
        </div>
      </div>

      {/* Preview card */}
      {preview && !preview.alreadyExists && (
        <>
          <div className="mb-6">
            <YouTubePreview preview={preview} />
          </div>

          {/* Form fields in two columns on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Left column: metadata */}
            <div className="space-y-6">
              <Input
                label="Incident Date (optional)"
                type="date"
                value={videoDate}
                onChange={(e) => setVideoDate(e.target.value)}
              />

              {/* Amendments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amendments <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {AMENDMENT_OPTIONS.map((opt) => (
                    <Chip
                      key={opt.id}
                      selected={amendments.includes(opt.amendment)}
                      onClick={() => toggleAmendment(opt.amendment)}
                    >
                      {opt.label}
                    </Chip>
                  ))}
                </div>
                {amendmentError && (
                  <p className="text-sm text-red-600 mt-1">{amendmentError}</p>
                )}
              </div>

              {/* Participants */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Participants <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {PARTICIPANT_TYPE_OPTIONS.map((opt) => (
                    <Chip
                      key={opt.id}
                      selected={participants.includes(opt.id)}
                      onClick={() => toggleParticipant(opt.id)}
                    >
                      {opt.label}
                    </Chip>
                  ))}
                </div>
                {participantError && (
                  <p className="text-sm text-red-600 mt-1">
                    {participantError}
                  </p>
                )}
              </div>
            </div>

            {/* Right column: location picker */}
            <div>
              <LocationPicker
                onLocationChange={(loc) => {
                  setLocationError("");
                  setLocation(loc);
                }}
                error={locationError}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Submit Video
            </Button>
          </div>
        </>
      )}

      {/* Already exists message */}
      {preview && preview.alreadyExists && (
        <div className="mb-6">
          <YouTubePreview preview={preview} />
          <p className="mt-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">
            This video has already been submitted.{" "}
            {preview.existingVideoId && (
              <Link
                href={`/videos/${preview.existingVideoId}`}
                className="underline font-medium"
              >
                View it here.
              </Link>
            )}
          </p>
        </div>
      )}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </form>
  );
}
