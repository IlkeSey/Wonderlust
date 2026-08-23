"use client";

import { useCallback, useEffect, useState } from "react";
import type { Podcast, PodcastInput } from "@/types/podcast";

// -------------------------------------------------------------------
// API helpers
// -------------------------------------------------------------------

async function fetchPodcasts(): Promise<Podcast[]> {
  const res = await fetch("/api/podcasts", { cache: "no-store" });
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error ?? "Failed to fetch.");
  return body.podcasts ?? [];
}

async function createPodcast(data: PodcastInput): Promise<Podcast> {
  const res = await fetch("/api/podcasts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error ?? "Failed to create.");
  return body.podcast;
}

async function updatePodcast(id: string, data: PodcastInput): Promise<Podcast> {
  const res = await fetch("/api/podcasts", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...data }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error ?? "Failed to update.");
  return body.podcast;
}

async function deletePodcast(id: string): Promise<void> {
  const res = await fetch(`/api/podcasts?id=${id}`, { method: "DELETE" });
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error ?? "Failed to delete.");
}

// -------------------------------------------------------------------
// Component
// -------------------------------------------------------------------

export default function AdminPage() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await fetchPodcasts();
      setPodcasts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load podcasts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function resetForm() {
    setTitle("");
    setDescription("");
    setUrl("");
    setEditing(null);
  }

  function startEdit(p: Podcast) {
    setEditing(p.id);
    setTitle(p.title);
    setDescription(p.description ?? "");
    setUrl(p.url ?? "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    setError(null);
    try {
      if (editing) {
        await updatePodcast(editing, { title, description, url });
      } else {
        await createPodcast({ title, description, url });
      }
      resetForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this podcast?")) return;
    setBusy(true);
    setError(null);
    try {
      await deletePodcast(id);
      if (editing === id) resetForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Admin Panel</h1>

      {/* ---- Form ---- */}
      <form onSubmit={handleSubmit} className="card space-y-4">
        <h2 className="font-semibold">
          {editing ? "Edit podcast" : "Add a podcast"}
        </h2>

        <div>
          <label htmlFor="title" className="label">Title</label>
          <input
            id="title"
            className="input"
            placeholder="My Favorite Podcast"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="label">Description</label>
          <textarea
            id="description"
            className="input resize-none"
            rows={3}
            placeholder="A short description…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="url" className="label">URL</label>
          <input
            id="url"
            className="input"
            type="url"
            placeholder="https://example.com/podcast"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={busy} className="btn-primary">
            {editing ? "Save changes" : "Add podcast"}
          </button>
          {editing && (
            <button type="button" onClick={resetForm} className="btn-ghost">
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* ---- Error ---- */}
      {error && (
        <div className="rounded-lg border border-red-300/30 bg-red-500/15 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      )}

      {/* ---- List ---- */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">
          All podcasts{" "}
          <span className="text-sm font-normal text-white/60">({podcasts.length})</span>
        </h2>

        {loading && <p className="text-sm text-white/60">Loading…</p>}

        {!loading && podcasts.length === 0 && (
          <p className="text-sm text-white/60">No podcasts yet. Add one above.</p>
        )}

        <ul className="space-y-3">
          {podcasts.map((p) => (
            <li key={p.id} className="card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{p.title}</p>
                {p.description && (
                  <p className="mt-0.5 truncate text-sm text-white/70">{p.description}</p>
                )}
                {p.url && (
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-0.5 block truncate text-xs text-blue-300 underline underline-offset-2"
                  >
                    {p.url}
                  </a>
                )}
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(p)}
                  className="btn-ghost text-xs"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(p.id)}
                  disabled={busy}
                  className="btn-danger text-xs"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
