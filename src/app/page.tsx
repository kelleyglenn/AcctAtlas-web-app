"use client";

import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { HeroMap } from "@/components/HeroMap";

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      {/* HERO SECTION */}
      <section className="-mt-14 relative min-h-screen w-full overflow-hidden">
        {/* Map Background */}
        <div className="absolute inset-0">
          <HeroMap />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/10" />

        {/* Content Container */}
        <div className="relative z-10 flex items-center min-h-screen pt-24 md:pt-32">
          <div className="max-w-6xl mx-auto px-6 w-full">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
                See Where Constitutional Rights Are Tested
              </h1>

              <p className="mt-6 text-lg md:text-xl text-gray-200">
                AccountabilityAtlas organizes citizen-recorded audit videos by
                location and constitutional amendment — revealing geographic
                patterns that are invisible when videos live only on YouTube.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/map"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-white text-black font-medium shadow hover:scale-[1.03] transition-transform"
                >
                  Explore the Map
                </Link>

                {isAuthenticated ? (
                  <Link
                    href="/videos/new"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-md border border-white/70 text-white font-medium hover:bg-white/10 transition"
                  >
                    Submit a Video
                  </Link>
                ) : (
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-md border border-white/70 text-white font-medium hover:bg-white/10 transition"
                  >
                    Create Free Account
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="bg-slate-900 text-gray-300 py-6 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between gap-4 text-sm uppercase tracking-wide text-center md:text-left">
          <div>8,000+ Videos Mapped</div>
          <div>All 50 States Represented</div>
          <div>1st, 2nd, 4th, 5th, and 14th Amendments Indexed</div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 md:py-24 bg-white text-slate-900">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-semibold mb-12">
            How AccountabilityAtlas Works
          </h2>

          <div className="grid md:grid-cols-3 gap-10">
            <div>
              <h3 className="font-semibold mb-2">Discover</h3>
              <p className="text-gray-600">
                Browse audit videos geographically. Zoom into your city or
                explore national trends.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Understand</h3>
              <p className="text-gray-600">
                Filter by constitutional amendment and participant type to
                surface specific encounter categories.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Contribute</h3>
              <p className="text-gray-600">
                Submit YouTube videos, tag them, and pin them to the map where
                the encounter occurred.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WHY IT MATTERS */}
      <section className="py-16 md:py-24 bg-slate-50 text-slate-900">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-semibold mb-12">
            Why Geographic Context Changes Everything
          </h2>

          <div className="grid md:grid-cols-3 gap-10">
            <div>
              <h3 className="font-semibold mb-2">Pattern Recognition</h3>
              <p className="text-gray-600">
                When encounters are mapped, trends become visible across
                jurisdictions.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Public Record</h3>
              <p className="text-gray-600">
                Each video becomes part of a searchable, geographic archive.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Civic Transparency</h3>
              <p className="text-gray-600">
                Organized information strengthens public accountability and
                research.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 md:py-24 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">
            Start Exploring
          </h2>
          <p className="text-gray-300 mb-8">
            No account required to browse the map.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/map"
              className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-white text-black font-medium shadow hover:scale-[1.03] transition-transform"
            >
              Explore the Map
            </Link>

            {isAuthenticated ? (
              <Link
                href="/videos/new"
                className="inline-flex items-center justify-center px-6 py-3 rounded-md border border-white/70 text-white font-medium hover:bg-white/10 transition"
              >
                Submit a Video
              </Link>
            ) : (
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-6 py-3 rounded-md border border-white/70 text-white font-medium hover:bg-white/10 transition"
              >
                Create Free Account
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
