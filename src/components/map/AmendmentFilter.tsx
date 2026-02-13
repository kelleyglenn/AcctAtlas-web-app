"use client";

import { useMap } from "@/providers/MapProvider";
import { Chip } from "@/components/ui/Chip";
import { AMENDMENT_OPTIONS } from "@/types/map";

export function AmendmentFilter() {
  const { filters, updateFilters } = useMap();

  const toggleAmendment = (amendment: string) => {
    const current = filters.amendments;
    const updated = current.includes(amendment)
      ? current.filter((a) => a !== amendment)
      : [...current, amendment];
    updateFilters({ amendments: updated });
  };

  return (
    <div>
      <p className="text-xs font-medium text-gray-500 mb-1.5">Amendments</p>
      <div className="flex flex-wrap gap-1.5">
        {AMENDMENT_OPTIONS.map((option) => (
          <Chip
            key={option.id}
            selected={filters.amendments.includes(option.amendment)}
            onClick={() => toggleAmendment(option.amendment)}
            size="sm"
          >
            {option.label}
          </Chip>
        ))}
      </div>
    </div>
  );
}
