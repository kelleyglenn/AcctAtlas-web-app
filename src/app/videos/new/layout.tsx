import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submit Video",
};

export default function SubmitVideoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
