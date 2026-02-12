"use client";

import { useMap } from "@/providers/MapProvider";
import { Chip } from "@/components/ui/Chip";
import { PARTICIPANT_TYPE_OPTIONS } from "@/types/map";

export function ParticipantFilter() {
  const { filters, updateFilters } = useMap();

  const toggleParticipant = (participant: string) => {
    const current = filters.participants;
    const updated = current.includes(participant)
      ? current.filter((p) => p !== participant)
      : [...current, participant];
    updateFilters({ participants: updated });
  };

  return (
    <div>
      <p className="text-xs font-medium text-gray-500 mb-1.5">Participants</p>
      <div className="flex flex-wrap gap-1.5">
        {PARTICIPANT_TYPE_OPTIONS.map((option) => (
          <Chip
            key={option.id}
            selected={filters.participants.includes(option.id)}
            onClick={() => toggleParticipant(option.id)}
            size="sm"
          >
            {option.label}
          </Chip>
        ))}
      </div>
    </div>
  );
}
