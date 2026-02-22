"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { YouTubePreview } from "@/components/video/YouTubePreview";
import { LocationPicker } from "@/components/video/LocationPicker";
import {
  previewVideo,
  createVideo,
  extractVideoMetadata,
} from "@/lib/api/videos";
import { createLocation } from "@/lib/api/locations";
import { useToasts, ToastContainer } from "@/components/ui/Toast";
import { MAPBOX_ACCESS_TOKEN } from "@/config/mapbox";
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

  // AI extraction
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionDone, setExtractionDone] = useState(false);
  const AI_VERBS = [
    "Thinking",
    "Analyzing",
    "Processing",
    "Synthesizing",
    "Deliberating",
    "Generating",
  ];
  const [aiVerb, setAiVerb] = useState(AI_VERBS[0]);
  const aiVerbRef = useRef(aiVerb);
  aiVerbRef.current = aiVerb;

  useEffect(() => {
    if (!isExtracting) return;
    const id = setInterval(() => {
      const remaining = AI_VERBS.filter((v) => v !== aiVerbRef.current);
      setAiVerb(remaining[Math.floor(Math.random() * remaining.length)]);
    }, 5000);
    return () => clearInterval(id);
  }, [isExtracting]);

  const [suggestedLocation, setSuggestedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

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

  const handleExtract = async () => {
    if (!youtubeUrl.trim()) return;
    setIsExtracting(true);
    try {
      const result = await extractVideoMetadata(youtubeUrl);
      if (result.amendments?.length) {
        setAmendments(result.amendments);
        setAmendmentError("");
      }
      if (result.participants?.length) {
        setParticipants(result.participants);
        setParticipantError("");
      }
      if (result.videoDate) {
        setVideoDate(result.videoDate);
      }
      if (result.location) {
        if (
          result.location.latitude != null &&
          result.location.longitude != null
        ) {
          setSuggestedLocation({
            latitude: result.location.latitude,
            longitude: result.location.longitude,
          });
          setLocationError("");
        } else {
          const parts = [
            result.location.name,
            result.location.city,
            result.location.state,
          ]
            .filter(Boolean)
            .join(", ");
          if (parts) {
            try {
              const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(parts)}.json?access_token=${MAPBOX_ACCESS_TOKEN}&types=poi,address,place&country=us&limit=1`;
              const res = await fetch(url);
              if (res.ok) {
                const data = await res.json();
                if (data.features?.length > 0) {
                  const [lng, lat] = data.features[0].center;
                  setSuggestedLocation({ latitude: lat, longitude: lng });
                  setLocationError("");
                }
              }
            } catch {
              // Geocoding failed, user can pick manually
            }
          }
        }
      }
      setExtractionDone(true);
      success("AI suggestions applied. Review and adjust as needed.");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 503) {
        showError("AI extraction unavailable. Please fill in manually.");
      } else {
        showError("AI extraction failed. Please fill in manually.");
      }
    } finally {
      setIsExtracting(false);
    }
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
        displayName: location!.geocode.formattedAddress,
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
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handlePreview();
                }
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

          {/* Auto-fill with AI */}
          <div className="mb-4 flex items-center justify-end gap-3">
            {isExtracting && (
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <span className="flex gap-0.5">
                  <span className="inline-block w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="inline-block w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="inline-block w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:300ms]" />
                </span>
                <span>{aiVerb} with AI</span>
              </div>
            )}

            {extractionDone && !isExtracting && (
              <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-1.5">
                AI suggestions applied — please review all fields before
                submitting.
              </div>
            )}

            <Button
              type="button"
              variant="secondary"
              onClick={handleExtract}
              isLoading={isExtracting}
              disabled={!preview}
            >
              Auto-fill with AI
            </Button>
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
                initialLocation={suggestedLocation ?? undefined}
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
