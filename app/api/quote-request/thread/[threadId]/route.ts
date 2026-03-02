import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

type QuoteRequestRecord = {
  gigId: string;
  customerAddress: string;
  freelancerId: string;
  threadId: string;
  createdAt: string;
};

type GigApi = {
  id: string;
  title: string;
  freelancerId: string;
  freelancer?: { firstName: string; lastName: string };
};

async function loadQuoteRequests(): Promise<QuoteRequestRecord[]> {
  const filePath = path.join(
    process.cwd(),
    "app",
    "api",
    "quote-request",
    "quote-requests.json"
  );
  try {
    const raw = await readFile(filePath, "utf-8");
    const data = JSON.parse(raw) as unknown;
    return Array.isArray(data) ? (data as QuoteRequestRecord[]) : [];
  } catch {
    return [];
  }
}

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

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ threadId: string }> }
) {
  try {
    const { threadId } = await context.params;
    const records = await loadQuoteRequests();
    const record = records.find((r) => r.threadId === threadId);
    if (!record) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }
    const gigs = await loadGigs();
    const gig = gigs.find((g) => g.id === record.gigId);
    const gigTitle = gig?.title ?? "Gig";
    const freelancerName = gig?.freelancer
      ? [gig.freelancer.firstName, gig.freelancer.lastName].filter(Boolean).join(" ")
      : "";
    return NextResponse.json({
      gigId: record.gigId,
      gigTitle,
      freelancerName,
      customerAddress: record.customerAddress,
      freelancerId: record.freelancerId,
    });
  } catch (error) {
    console.error("[api/quote-request/thread/[threadId]] GET error:", error);
    return NextResponse.json(
      { error: "Failed to load thread" },
      { status: 500 }
    );
  }
}
