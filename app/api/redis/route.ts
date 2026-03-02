import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");
  if (!key) {
    return NextResponse.json({ error: "key is required" }, { status: 400 });
  }

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json(
      { error: "Redis not configured" },
      { status: 503 }
    );
  }

  try {
    const value = await redis.get<string>(key);
    return NextResponse.json({ value: value ?? null });
  } catch (err) {
    console.error("[api/redis] GET error:", err);
    return NextResponse.json(
      { error: "Failed to read from Redis" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const key = body?.key as string | undefined;
    const value = body?.value as string | undefined;

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: "key and value are required" },
        { status: 400 }
      );
    }

    const redis = getRedis();
    if (!redis) {
      return NextResponse.json(
        { error: "Redis not configured" },
        { status: 503 }
      );
    }

    await redis.set(key, value);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/redis] POST error:", err);
    return NextResponse.json(
      { error: "Failed to write to Redis" },
      { status: 500 }
    );
  }
}
