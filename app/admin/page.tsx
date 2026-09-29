"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Podcast } from "@/types/podcast";
import { THEMES } from "@/types/podcast";

type FormState = {
  title: string;
  description: string;
  url: string;
  theme: string;
};

const emptyForm: FormState = { title: "", description: "", url: "", theme: "" };

export default function AdminPage() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterTheme, setFilterTheme] = useState<string>("");

  const flash = useCallback((msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  }, []);

  const fetchPodcasts = useCallback(async () => {
    try {
      const res = await fetch("/api/podcasts", { cache: "no-store" });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? "Failed to load.");
      setPodcasts(body.podcasts ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPodcasts();
  }, [fetchPodcasts]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    setError(null);

    try {
      const method = editingId ? "PUT" : "POST";
      const payload: Record<string, string> = {
        title: form.title,
        description: form.description,
        url: form.url,
        theme: form.theme,
      };
      if (editingId) payload.id = editingId;

      const res = await fetch("/api/podcasts", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? "Save failed.");

      setForm(emptyForm);
      setEditingId(null);
      flash(editingId ? "Podcast updated." : "Podcast added.");
      await fetchPodcasts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (p: Podcast) => {
    setEditingId(p.id);
    setForm({
      title: p.title,
      description: p.description ?? "",
      url: p.url ?? "",
      theme: p.theme ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this podcast?")) return;
    try {
      const res = await fetch(`/api/podcasts?id=${id}`, { method: "DELETE" });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? "Delete failed.");
      flash("Podcast deleted.");
      if (editingId === id) cancelEdit();
      await fetchPodcasts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    }
  };

  const usedThemes = [...new Set(podcasts.map((p) => p.theme).filter(Boolean))] as string[];
  const filtered = filterTheme
    ? podcasts.filter((p) => p.theme === filterTheme)
    : podcasts;

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div>
        <h1
          className="text-2xl font-bold sm:text-3xl"
          style={{ letterSpacing: "-0.02em" }}
        >
          {editingId ? "Edit podcast" : "Add a podcast"}
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          {editingId
            ? "Update the details below."
            : "Fill in the details and pick a theme."}
        </p>
      </div>

      {success && (
        <div
          className="animate-fade-up rounded-lg px-4 py-2.5 text-sm"
          style={{
            background: "rgba(163, 190, 140, 0.12)",
            border: "1px solid rgba(163, 190, 140, 0.2)",
            color: "#a3be8c",
          }}
        >
          {success}
        </div>
      )}
      {error && (
        <div
          className="rounded-lg px-4 py-2.5 text-sm"
          style={{
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.15)",
            color: "#f87171",
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label htmlFor="title" className="label">
            Title
          </label>
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="The Daily"
            required
            className="input"
          />
        </div>

        <div>
          <label htmlFor="theme" className="label">
            Theme
          </label>
          <select
            id="theme"
            name="theme"
            value={form.theme}
            onChange={handleChange}
            className="input"
          >
            <option value="">Pick a theme…</option>
            {THEMES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="description" className="label">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="What's this podcast about?"
            rows={3}
            className="input resize-none"
          />
        </div>

        <div>
          <label htmlFor="url" className="label">
            Link
          </label>
          <input
            id="url"
            name="url"
            value={form.url}
            onChange={handleChange}
            placeholder="https://..."
            className="input"
          />
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving
              ? "Saving…"
              : editingId
                ? "Save changes"
                : "Add podcast"}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} className="btn-ghost">
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Podcast list */}
      <div>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-base font-bold">
            All podcasts
            <span
              className="ml-2 text-sm font-normal"
              style={{ color: "var(--text-muted)" }}
            >
              {filtered.length}
            </span>
          </h2>

          {usedThemes.length > 0 && (
            <select
              value={filterTheme}
              onChange={(e) => setFilterTheme(e.target.value)}
              className="input text-xs"
              style={{ width: "auto", minWidth: 130 }}
            >
              <option value="">All themes</option>
              {usedThemes.sort().map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          )}
        </div>

        {loading && (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Loading…
          </p>
        )}

        {!loading && filtered.length === 0 && (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {filterTheme ? "No podcasts with this theme." : "No podcasts yet."}
          </p>
        )}

        <ul
          className="divide-y"
          style={{ borderColor: "var(--surface-border)" }}
        >
          {filtered.map((p) => (
            <li
              key={p.id}
              className="flex items-start justify-between gap-4 py-4"
              style={{ borderColor: "var(--surface-border)" }}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{p.title}</p>
                {p.theme && (
                  <span
                    className="mt-1 inline-block rounded-full px-2 py-0.5 text-xs"
                    style={{
                      background: "rgba(196, 161, 255, 0.1)",
                      color: "var(--accent)",
                    }}
                  >
                    {p.theme}
                  </span>
                )}
                {p.description && (
                  <p
                    className="mt-1 text-xs line-clamp-2"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {p.description}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button
                  onClick={() => startEdit(p)}
                  className="btn-ghost text-xs"
                  style={{ padding: "4px 10px" }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="btn-danger text-xs"
                  style={{ padding: "4px 10px" }}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="text-center">
        <Link
          href="/"
          className="text-sm font-medium"
          style={{ color: "var(--accent)" }}
        >
          Back to the wheel
        </Link>
      </div>
    </div>
  );
}
