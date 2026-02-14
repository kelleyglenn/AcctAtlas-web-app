import { render, screen, fireEvent, act } from "@testing-library/react";
import { useEffect } from "react";
import { FilterBar } from "@/components/map/FilterBar";
import { MapProvider, useMap } from "@/providers/MapProvider";
import type { MapFilters } from "@/types/map";

// Mock sub-components
jest.mock("@/components/map/AmendmentFilter", () => ({
  AmendmentFilter: () => (
    <div data-testid="amendment-filter">AmendmentFilter</div>
  ),
}));

jest.mock("@/components/map/ParticipantFilter", () => ({
  ParticipantFilter: () => (
    <div data-testid="participant-filter">ParticipantFilter</div>
  ),
}));

// Mock react-map-gl/mapbox (needed by MapProvider transitively)
jest.mock("react-map-gl/mapbox", () => ({
  Marker: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

// Helper to pre-set filters via MapProvider
function FilterSetter({ filters }: { filters: Partial<MapFilters> }) {
  const { updateFilters } = useMap();
  useEffect(() => {
    updateFilters(filters);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

// Helper to read map state
let mapState: ReturnType<typeof useMap>;
function MapStateReader() {
  mapState = useMap();
  return null;
}

const renderWithProvider = (
  component: React.ReactNode,
  presetFilters?: Partial<MapFilters>
) => {
  return render(
    <MapProvider>
      <MapStateReader />
      {presetFilters && <FilterSetter filters={presetFilters} />}
      {component}
    </MapProvider>
  );
};

describe("FilterBar", () => {
  describe("collapsed state", () => {
    it("should be collapsed by default", () => {
      renderWithProvider(<FilterBar />);

      expect(screen.queryByTestId("amendment-filter")).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("participant-filter")
      ).not.toBeInTheDocument();
    });

    it("should show Filters toggle button", () => {
      renderWithProvider(<FilterBar />);

      expect(screen.getByText("Filters")).toBeInTheDocument();
    });
  });

  describe("expanded state", () => {
    it("should show AmendmentFilter and ParticipantFilter when expanded", () => {
      renderWithProvider(<FilterBar />);

      fireEvent.click(screen.getByText("Filters"));

      expect(screen.getByTestId("amendment-filter")).toBeInTheDocument();
      expect(screen.getByTestId("participant-filter")).toBeInTheDocument();
    });

    it("should show date inputs when expanded", () => {
      renderWithProvider(<FilterBar />);

      fireEvent.click(screen.getByText("Filters"));

      const dateInputs = screen.getAllByDisplayValue("");
      const dateFields = dateInputs.filter(
        (input) => (input as HTMLInputElement).type === "date"
      );
      expect(dateFields).toHaveLength(2);
    });

    it("should collapse when toggle is clicked again", () => {
      renderWithProvider(<FilterBar />);

      // Expand
      fireEvent.click(screen.getByText("Filters"));
      expect(screen.getByTestId("amendment-filter")).toBeInTheDocument();

      // Collapse
      fireEvent.click(screen.getByText("Filters"));
      expect(screen.queryByTestId("amendment-filter")).not.toBeInTheDocument();
    });
  });

  describe("filter count badge", () => {
    it("should not show count badge when no active filters", () => {
      renderWithProvider(<FilterBar />);

      // The badge uses a specific class; with no filters there should be no badge
      const badge = screen.queryByText(/^\d+$/);
      expect(badge).not.toBeInTheDocument();
    });

    it("should show count badge when amendments filter is active", () => {
      renderWithProvider(<FilterBar />, { amendments: ["FIRST", "FOURTH"] });

      // Badge should show count of 2
      expect(screen.getByText("2")).toBeInTheDocument();
    });

    it("should show count badge when date filters are active", () => {
      renderWithProvider(<FilterBar />, {
        dateFrom: "2024-01-01",
        dateTo: "2024-12-31",
      });

      // Two date filters active
      expect(screen.getByText("2")).toBeInTheDocument();
    });

    it("should show correct total count for mixed filters", () => {
      renderWithProvider(<FilterBar />, {
        amendments: ["FIRST"],
        participants: ["POLICE"],
        dateFrom: "2024-01-01",
      });

      // 1 amendment + 1 participant + 1 dateFrom = 3
      expect(screen.getByText("3")).toBeInTheDocument();
    });
  });

  describe("clear filters", () => {
    it("should not show clear button when no active filters", () => {
      renderWithProvider(<FilterBar />);

      fireEvent.click(screen.getByText("Filters"));

      expect(screen.queryByText("Clear all filters")).not.toBeInTheDocument();
    });

    it("should show clear button when filters are active", () => {
      renderWithProvider(<FilterBar />, { amendments: ["FIRST"] });

      fireEvent.click(screen.getByText("Filters"));

      expect(screen.getByText("Clear all filters")).toBeInTheDocument();
    });

    it("should clear all filters when clear button is clicked", () => {
      renderWithProvider(<FilterBar />, {
        amendments: ["FIRST"],
        dateFrom: "2024-01-01",
      });

      fireEvent.click(screen.getByText("Filters"));

      act(() => {
        fireEvent.click(screen.getByText("Clear all filters"));
      });

      expect(mapState.filters.amendments).toHaveLength(0);
      expect(mapState.filters.participants).toHaveLength(0);
      expect(mapState.filters.dateFrom).toBeUndefined();
      expect(mapState.filters.dateTo).toBeUndefined();
    });
  });

  describe("date inputs", () => {
    it("should update dateFrom filter on change", () => {
      renderWithProvider(<FilterBar />);

      fireEvent.click(screen.getByText("Filters"));

      const dateInputs = screen
        .getAllByDisplayValue("")
        .filter(
          (input) => (input as HTMLInputElement).type === "date"
        ) as HTMLInputElement[];

      act(() => {
        fireEvent.change(dateInputs[0], { target: { value: "2024-06-15" } });
      });

      expect(mapState.filters.dateFrom).toBe("2024-06-15");
    });

    it("should update dateTo filter on change", () => {
      renderWithProvider(<FilterBar />);

      fireEvent.click(screen.getByText("Filters"));

      const dateInputs = screen
        .getAllByDisplayValue("")
        .filter(
          (input) => (input as HTMLInputElement).type === "date"
        ) as HTMLInputElement[];

      act(() => {
        fireEvent.change(dateInputs[1], { target: { value: "2024-12-31" } });
      });

      expect(mapState.filters.dateTo).toBe("2024-12-31");
    });

    it("should clear dateFrom when input is emptied", () => {
      renderWithProvider(<FilterBar />, { dateFrom: "2024-01-01" });

      fireEvent.click(screen.getByText("Filters"));

      const dateInputs = screen
        .getAllByDisplayValue("")
        .filter((input) => (input as HTMLInputElement).type === "date");

      // The first date input with a value
      const fromInput = screen.getByDisplayValue("2024-01-01");

      act(() => {
        fireEvent.change(fromInput, { target: { value: "" } });
      });

      expect(mapState.filters.dateFrom).toBeUndefined();
    });
  });
});
