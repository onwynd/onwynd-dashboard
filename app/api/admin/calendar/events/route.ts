import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { parseAuthSessionState } from "@/lib/auth/session";
import { AppConfig } from "@/lib/config";

async function getSessionUserIdOrFallback(): Promise<string> {
  const cookieStore = await cookies();
  const auth = parseAuthSessionState(cookieStore.get("auth_state")?.value);
  return String(auth?.userId ?? "anonymous");
}

export async function GET(req: NextRequest) {
  await getSessionUserIdOrFallback();
  const date = req.nextUrl.searchParams.get("date");
  const endpoint = `/api/v1/calendar/events${date ? `?date=${encodeURIComponent(date)}` : ""}`;
  const upstream = await fetch(AppConfig.getApiUrl(endpoint), {
    method: "GET",
    headers: { Accept: "application/json", Cookie: req.headers.get("cookie") ?? "" },
    cache: "no-store",
  });

  if (upstream.ok) {
    const payload = await upstream.json();
    return NextResponse.json(payload?.data ?? payload);
  }

  return NextResponse.json(
    { message: "Failed to fetch calendar events from upstream service" },
    { status: upstream.status || 502 },
  );
}

export async function POST(req: NextRequest) {
  await getSessionUserIdOrFallback();
  const body = (await req.json()) as {
    title?: string;
    date?: string;
    time?: string;
    description?: string;
    attendees?: string[];
  };

  const payload = {
    title: body.title ?? "Untitled Event",
    date: body.date ?? new Date().toISOString().slice(0, 10),
    time: body.time ?? "10:00",
    description: body.description ?? "",
    attendees: Array.isArray(body.attendees) ? body.attendees : [],
  };

  const upstream = await fetch(AppConfig.getApiUrl("/api/v1/calendar/events"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Cookie: req.headers.get("cookie") ?? "",
    },
    body: JSON.stringify(payload),
  });

  if (upstream.ok) {
    const responseBody = await upstream.json();
    return NextResponse.json(responseBody?.data ?? responseBody);
  }

  return NextResponse.json(
    { message: "Failed to create calendar event in upstream service" },
    { status: upstream.status || 502 },
  );
}
