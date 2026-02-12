import { type ReactNode } from "react";

interface ChipProps {
  children: ReactNode;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
  size?: "sm" | "md";
}

export function Chip({
  children,
  selected = false,
  onClick,
  className = "",
  size = "md",
}: ChipProps) {
  const baseStyles =
    "inline-flex items-center rounded-full font-medium transition-colors";

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };

  const colorStyles = selected
    ? "bg-blue-600 text-white hover:bg-blue-700"
    : "bg-gray-100 text-gray-700 hover:bg-gray-200";

  const interactiveStyles = onClick ? "cursor-pointer" : "";

  return (
    <span
      className={`${baseStyles} ${sizeStyles[size]} ${colorStyles} ${interactiveStyles} ${className}`}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                onClick();
              }
            }
          : undefined
      }
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
      {selected && onClick && (
        <svg
          className="ml-1 h-3 w-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      )}
    </span>
  );
}
