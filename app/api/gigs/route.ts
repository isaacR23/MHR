import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

type GigApi = {
  id: string;
  title: string;
  description: string;
  price: number;
  deadline: string;
  deliveryTime?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  freelancerId: string;
  tags?: string[];
  freelancer?: {
    firstName: string;
    lastName: string;
    bio: string;
    skills: string[];
  };
};

async function loadGigs(): Promise<GigApi[]> {
  const filePath = path.join(process.cwd(), "app", "api", "gigs", "gigs.json");
  try {
    const raw = await readFile(filePath, "utf-8");
    const data = JSON.parse(raw) as unknown;
    return Array.isArray(data) ? (data as GigApi[]) : [];
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    let gigs = await loadGigs();
    const freelancerId = request.nextUrl.searchParams.get("freelancerId");
    if (freelancerId?.trim()) {
      gigs = gigs.filter((g) => g.freelancerId === freelancerId.trim());
    }
    return NextResponse.json({ gigs });
  } catch (error) {
    console.error("[api/gigs] GET error:", error);
    return NextResponse.json(
      { error: "Failed to load gigs" },
      { status: 500 }
    );
  }
}
