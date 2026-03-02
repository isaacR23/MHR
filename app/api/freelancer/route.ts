import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";
import type { FreelancerProfile, Gig } from "@/lib/freelancer-types";

const FREELANCER_KEY_PREFIX = "freelancer:";

function parseGigs(raw: unknown): Gig[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (g): g is Gig =>
      g &&
      typeof g === "object" &&
      typeof (g as Gig).id === "string" &&
      typeof (g as Gig).title === "string"
  );
}

function normalizeAddress(addr: string): string {
  return addr.toLowerCase().startsWith("0x")
    ? addr.toLowerCase()
    : `0x${addr.toLowerCase()}`;
}

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address");
  if (!address) {
    return NextResponse.json(
      { error: "address is required" },
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

  try {
    const key = `${FREELANCER_KEY_PREFIX}${normalizeAddress(address)}`;
    const raw = await redis.get<string>(key);
    if (raw == null) {
      return NextResponse.json({ profile: null });
    }
    const profile =
      typeof raw === "string" ? (JSON.parse(raw) as FreelancerProfile) : raw;
    return NextResponse.json({ profile });
  } catch (err) {
    console.error("[api/freelancer] GET error:", err);
    return NextResponse.json(
      { error: "Failed to read freelancer profile" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<FreelancerProfile> & {
      address?: string;
    };
    const address = body?.address;
    if (!address) {
      return NextResponse.json(
        { error: "address is required" },
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

    const profile: FreelancerProfile = {
      address: normalizeAddress(address),
      firstName: body.firstName ?? "",
      lastName: body.lastName ?? "",
      bio: body.bio ?? "",
      skills: Array.isArray(body.skills) ? body.skills : [],
      gigs: parseGigs(body.gigs),
      hourlyRate: body.hourlyRate ?? "",
      settlementFrequency: body.settlementFrequency ?? "",
      registeredAt: body.registeredAt ?? new Date().toISOString(),
    };

    const key = `${FREELANCER_KEY_PREFIX}${profile.address}`;
    await redis.set(key, JSON.stringify(profile));
    return NextResponse.json({ ok: true, profile });
  } catch (err) {
    console.error("[api/freelancer] POST error:", err);
    return NextResponse.json(
      { error: "Failed to save freelancer profile" },
      { status: 500 }
    );
  }
}
