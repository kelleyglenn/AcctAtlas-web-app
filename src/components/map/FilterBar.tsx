"use client";

import { useState } from "react";
import { useMap } from "@/providers/MapProvider";
import { AmendmentFilter } from "./AmendmentFilter";
import { ParticipantFilter } from "./ParticipantFilter";

export function FilterBar() {
  const { filters, updateFilters, clearFilters } = useMap();
  const [isExpanded, setIsExpanded] = useState(false);

  const hasActiveFilters =
    filters.amendments.length > 0 ||
    filters.participants.length > 0 ||
    filters.dateFrom ||
    filters.dateTo;

  const activeFilterCount =
    filters.amendments.length +
    filters.participants.length +
    (filters.dateFrom ? 1 : 0) +
    (filters.dateTo ? 1 : 0);

  return (
    <div className="border-b border-gray-200">
      {/* Filter toggle button */}
      <button
        className="w-full px-4 py-2 flex items-center justify-between text-sm hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <span className="font-medium text-gray-700">Filters</span>
          {hasActiveFilters && (
            <span className="bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Filter content */}
      {isExpanded && (
        <div className="px-4 py-3 space-y-4 bg-gray-50">
          <AmendmentFilter />
          <ParticipantFilter />

          {/* Date range */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1.5">
              Date Range
            </p>
            <div className="flex gap-2">
              <input
                type="date"
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="From"
                value={filters.dateFrom || ""}
                onChange={(e) =>
                  updateFilters({ dateFrom: e.target.value || undefined })
                }
              />
              <input
                type="date"
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="To"
                value={filters.dateTo || ""}
                onChange={(e) =>
                  updateFilters({ dateTo: e.target.value || undefined })
                }
              />
            </div>
          </div>

          {/* Clear filters button */}
          {hasActiveFilters && (
            <button
              className="w-full py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
              onClick={clearFilters}
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
