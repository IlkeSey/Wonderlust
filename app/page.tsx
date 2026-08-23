"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import SpinningWheel from "./components/SpinningWheel";
import type { Podcast } from "@/types/podcast";

export default function HomePage() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [winner, setWinner] = useState<Podcast | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/podcasts", { cache: "no-store" });
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error ?? "Failed to load podcasts.");
        if (!cancelled) setPodcasts(body.podcasts ?? []);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load podcasts.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSpinStart = useCallback(() => setWinner(null), []);
  const handleResult = useCallback((podcast: Podcast) => setWinner(podcast), []);

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
          What are we listening to?
        </h1>
        <p className="mt-3 text-sm text-white/70 sm:text-base">
          Give the wheel a spin and let it decide this week&apos;s episode.
        </p>
      </div>

      {loading && <p className="text-white/70">Loading podcasts…</p>}

      {error && (
        <div className="card w-full max-w-md text-center">
          <p className="font-semibold text-red-200">Could not load podcasts</p>
          <p className="mt-2 text-sm text-white/70">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          <SpinningWheel
            podcasts={podcasts}
            onResult={handleResult}
            onSpinStart={handleSpinStart}
          />

          {winner && (
            <div className="card w-full max-w-md animate-fade-up text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">Tonight&apos;s pick</p>
              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{winner.title}</h2>
              {winner.description && (
                <p className="mt-3 text-sm text-white/80">{winner.description}</p>
              )}
              {winner.url && (
                <a
                  href={winner.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary mt-5"
                >
                  Listen now →
                </a>
              )}
            </div>
          )}

          {podcasts.length === 0 && (
            <p className="text-sm text-white/70">
              The wheel is empty.{" "}
              <Link href="/admin" className="font-semibold underline underline-offset-4">
                Add some podcasts
              </Link>{" "}
              to get started.
            </p>
          )}
        </>
      )}
    </div>
  );
}
