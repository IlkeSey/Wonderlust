import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import type { Podcast } from "@/types/podcast";

export const dynamic = "force-dynamic";

const TABLE = "podcasts";

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function serverError(message: string) {
  return NextResponse.json({ error: message }, { status: 500 });
}

async function readJson(request: Request): Promise<Record<string, unknown>> {
  try {
    const body = await request.json();
    return body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function asTrimmedString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** GET /api/podcasts — fetch all podcasts, newest first. */
export async function GET() {
  const { data, error } = await getSupabase()
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return serverError(error.message);
  return NextResponse.json({ podcasts: (data ?? []) as Podcast[] });
}

/** POST /api/podcasts — create a podcast. Body: { title, description?, url? } */
export async function POST(request: Request) {
  const body = await readJson(request);
  const title = asTrimmedString(body.title);
  if (!title) return badRequest("A title is required.");

  const { data, error } = await getSupabase()
    .from(TABLE)
    .insert({
      title,
      description: asTrimmedString(body.description),
      url: asTrimmedString(body.url),
    })
    .select()
    .single();

  if (error) return serverError(error.message);
  return NextResponse.json({ podcast: data as Podcast }, { status: 201 });
}

/** PUT /api/podcasts — update a podcast. Body: { id, title?, description?, url? } */
export async function PUT(request: Request) {
  const body = await readJson(request);
  const id = asTrimmedString(body.id);
  if (!id) return badRequest("An id is required.");

  const updates: Record<string, string | null> = {};
  if ("title" in body) {
    const title = asTrimmedString(body.title);
    if (!title) return badRequest("Title cannot be empty.");
    updates.title = title;
  }
  if ("description" in body) updates.description = asTrimmedString(body.description);
  if ("url" in body) updates.url = asTrimmedString(body.url);

  if (Object.keys(updates).length === 0) return badRequest("Nothing to update.");

  const { data, error } = await getSupabase()
    .from(TABLE)
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return serverError(error.message);
  if (!data) return NextResponse.json({ error: "Podcast not found." }, { status: 404 });
  return NextResponse.json({ podcast: data as Podcast });
}

/** DELETE /api/podcasts?id=... (or JSON body { id }) — delete a podcast. */
export async function DELETE(request: Request) {
  const fromQuery = new URL(request.url).searchParams.get("id");
  const id = asTrimmedString(fromQuery) ?? asTrimmedString((await readJson(request)).id);
  if (!id) return badRequest("An id is required.");

  const { error } = await getSupabase().from(TABLE).delete().eq("id", id);
  if (error) return serverError(error.message);
  return NextResponse.json({ success: true });
}
