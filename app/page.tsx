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
    <div className="flex flex-col items-center">
      <div className="mb-10 text-center">
        <h1
          className="text-3xl font-bold sm:text-4xl"
          style={{ letterSpacing: "-0.02em", color: "var(--text)" }}
        >
          What are we listening to?
        </h1>
        <p className="mt-3 text-sm" style={{ color: "var(--text-muted)" }}>
          Give the wheel a spin and let it decide.
        </p>
      </div>

      {loading && (
        <p className="py-20 text-sm" style={{ color: "var(--text-muted)" }}>
          Loading podcasts…
        </p>
      )}

      {error && (
        <div className="card w-full max-w-sm text-center">
          <p className="text-sm font-semibold" style={{ color: "#f87171" }}>
            Could not load podcasts
          </p>
          <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
            {error}
          </p>
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
            <div className="card mt-8 w-full max-w-sm animate-fade-up text-center">
              {winner.theme && (
                <span
                  className="inline-block rounded-full px-3 py-1 text-xs font-medium"
                  style={{
                    background: "rgba(196, 161, 255, 0.12)",
                    color: "var(--accent)",
                  }}
                >
                  {winner.theme}
                </span>
              )}
              <h2
                className="mt-3 text-xl font-bold sm:text-2xl"
                style={{ letterSpacing: "-0.01em" }}
              >
                {winner.title}
              </h2>
              {winner.description && (
                <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
                  {winner.description}
                </p>
              )}
              {winner.url && (
                <a
                  href={winner.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary mt-5 text-xs"
                >
                  Listen now
                </a>
              )}
            </div>
          )}

          {podcasts.length === 0 && (
            <p className="mt-8 text-sm" style={{ color: "var(--text-muted)" }}>
              The wheel is empty.{" "}
              <Link
                href="/admin"
                className="font-semibold underline underline-offset-4"
                style={{ color: "var(--accent)" }}
              >
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
