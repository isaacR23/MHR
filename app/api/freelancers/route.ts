import { NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";
import type { FreelancerProfile } from "@/lib/freelancer-types";

const FREELANCER_KEY_PREFIX = "freelancer:";

/** List all freelancer profiles. Used for Browse Gigs. */
export async function GET() {
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json(
      { error: "Redis not configured" },
      { status: 503 }
    );
  }

  try {
    const keys = await redis.keys(`${FREELANCER_KEY_PREFIX}*`);
    if (keys.length === 0) {
      return NextResponse.json({ freelancers: [] });
    }

    const rawList = await redis.mget<string>(...keys);
    const freelancers: FreelancerProfile[] = rawList
      .filter((raw): raw is string => raw != null && typeof raw === "string")
      .map((raw) => {
        try {
          return JSON.parse(raw) as FreelancerProfile;
        } catch {
          return null;
        }
      })
      .filter((p): p is FreelancerProfile => p != null && typeof p?.address === "string");

    return NextResponse.json({ freelancers });
  } catch (err) {
    console.error("[api/freelancers] GET error:", err);
    return NextResponse.json(
      { error: "Failed to list freelancers" },
      { status: 500 }
    );
  }
}
