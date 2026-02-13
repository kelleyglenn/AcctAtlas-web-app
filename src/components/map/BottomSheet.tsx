"use client";

import { useRef, type ReactNode } from "react";
import { useSpring, animated, config } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";

// Snap points as percentage of screen height
const SNAP_POINTS = {
  collapsed: 15, // Just the header visible
  half: 50, // Half screen
  expanded: 85, // Almost full screen
};

interface BottomSheetProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export function BottomSheet({ children, title, subtitle }: BottomSheetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Spring for animating the sheet position
  const [{ y }, api] = useSpring(() => ({
    y: 100 - SNAP_POINTS.collapsed,
    config: config.stiff,
  }));

  // Find the nearest snap point
  const findNearestSnap = (currentY: number) => {
    const snapValues = Object.values(SNAP_POINTS);
    const distances = snapValues.map((snap) => ({
      snap,
      distance: Math.abs(100 - snap - currentY),
    }));
    distances.sort((a, b) => a.distance - b.distance);
    return 100 - distances[0].snap;
  };

  // Handle drag gestures
  const bind = useDrag(
    ({ movement: [, my], velocity: [, vy], direction: [, dy], active }) => {
      const container = containerRef.current;
      if (!container) return;

      const containerHeight = window.innerHeight;
      const currentY =
        (my / containerHeight) * 100 + (100 - SNAP_POINTS.collapsed);

      if (active) {
        // Clamp to valid range
        const clampedY = Math.max(
          100 - SNAP_POINTS.expanded,
          Math.min(100 - SNAP_POINTS.collapsed, currentY)
        );
        api.start({ y: clampedY, immediate: true });
      } else {
        // On release, snap to nearest point
        // Consider velocity for momentum-based snapping
        let targetY = currentY;
        if (Math.abs(vy) > 0.5) {
          // Fast swipe - go to next snap point in direction
          const snapValues = Object.values(SNAP_POINTS)
            .map((s) => 100 - s)
            .sort((a, b) => a - b);
          if (dy > 0) {
            // Swiping down
            targetY =
              snapValues.find((s) => s > currentY) ??
              snapValues[snapValues.length - 1];
          } else {
            // Swiping up
            targetY =
              [...snapValues].reverse().find((s) => s < currentY) ??
              snapValues[0];
          }
        } else {
          targetY = findNearestSnap(currentY);
        }

        api.start({ y: targetY });
      }
    },
    {
      from: () => [0, y.get() * (window.innerHeight / 100)],
      filterTaps: true,
      rubberband: true,
    }
  );

  return (
    <animated.div
      ref={containerRef}
      className="fixed inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-2xl z-40 touch-none"
      style={{
        height: "100vh",
        y: y.to((val) => `${val}%`),
      }}
    >
      {/* Drag handle */}
      <div {...bind()} className="cursor-grab active:cursor-grabbing">
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-4 pb-3 border-b border-gray-200">
          {title && (
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          )}
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>

      {/* Content - scrollable */}
      <div
        className="overflow-y-auto"
        style={{ maxHeight: "calc(100% - 80px)" }}
      >
        {children}
      </div>
    </animated.div>
  );
}
