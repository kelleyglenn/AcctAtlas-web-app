"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  approveItem,
  rejectItem,
  getModerationQueue,
} from "@/lib/api/moderation";

interface ModerationControlsProps {
  videoId: string;
  onStatusChange: (newStatus: string) => void;
}

export function ModerationControls({
  videoId,
  onStatusChange,
}: ModerationControlsProps) {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [error, setError] = useState("");

  const findModerationItemId = async (): Promise<string | null> => {
    const queue = await getModerationQueue({
      contentType: "VIDEO",
      status: "PENDING",
      size: 100,
    });
    const item = queue.content.find((i) => i.contentId === videoId);
    return item?.id ?? null;
  };

  const handleApprove = async () => {
    setIsApproving(true);
    setError("");
    try {
      const itemId = await findModerationItemId();
      if (!itemId) {
        setError("Moderation item not found.");
        return;
      }
      await approveItem(itemId);
      onStatusChange("APPROVED");
    } catch {
      setError("Failed to approve. Please try again.");
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (rejectReason.length < 10) {
      setError("Rejection reason must be at least 10 characters.");
      return;
    }
    setIsRejecting(true);
    setError("");
    try {
      const itemId = await findModerationItemId();
      if (!itemId) {
        setError("Moderation item not found.");
        return;
      }
      await rejectItem(itemId, rejectReason);
      onStatusChange("REJECTED");
      setShowRejectForm(false);
    } catch {
      setError("Failed to reject. Please try again.");
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">Moderation</h3>
      <div className="flex gap-2">
        <Button
          variant="primary"
          onClick={handleApprove}
          isLoading={isApproving}
        >
          Approve
        </Button>
        <Button variant="outline" onClick={() => setShowRejectForm(true)}>
          Reject
        </Button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}

      {showRejectForm && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rejection reason (min 10 characters)
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-md p-2 text-sm"
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <div className="flex gap-2 mt-2">
            <Button
              variant="outline"
              onClick={handleReject}
              isLoading={isRejecting}
            >
              Confirm Reject
            </Button>
            <button
              onClick={() => setShowRejectForm(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
