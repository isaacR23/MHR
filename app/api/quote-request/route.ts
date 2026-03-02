import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

type QuoteRequestRecord = {
  gigId: string;
  customerAddress: string;
  freelancerId: string;
  threadId: string;
  createdAt: string;
};

type GigApi = {
  id: string;
  freelancerId: string;
};

async function loadGigs(): Promise<GigApi[]> {
  const filePath = path.join(process.cwd(), "app", "api", "gigs", "gigs.json");
  try {
    const raw = await readFile(filePath, "utf-8");
    const data = JSON.parse(raw) as unknown;
    const arr = Array.isArray(data) ? data : [];
    return arr as GigApi[];
  } catch {
    return [];
  }
}

function normalizeAddress(addr: string): string {
  const s = (addr ?? "").trim();
  if (!s) return "";
  const lower = s.toLowerCase();
  return lower.startsWith("0x") ? lower : `0x${lower}`;
}

const QUOTE_REQUESTS_PATH = path.join(
  process.cwd(),
  "app",
  "api",
  "quote-request",
  "quote-requests.json"
);

async function loadQuoteRequests(): Promise<QuoteRequestRecord[]> {
  try {
    const raw = await readFile(QUOTE_REQUESTS_PATH, "utf-8");
    const data = JSON.parse(raw) as unknown;
    return Array.isArray(data) ? (data as QuoteRequestRecord[]) : [];
  } catch {
    return [];
  }
}

async function saveQuoteRequests(records: QuoteRequestRecord[]): Promise<void> {
  await writeFile(QUOTE_REQUESTS_PATH, JSON.stringify(records, null, 2), "utf-8");
}

export async function GET(request: NextRequest) {
  try {
    const gigId = request.nextUrl.searchParams.get("gigId");
    const customerAddress = normalizeAddress(
      request.nextUrl.searchParams.get("customerAddress") ?? ""
    );
    if (!gigId?.trim() || !customerAddress) {
      return NextResponse.json(
        { error: "gigId and customerAddress are required" },
        { status: 400 }
      );
    }
    const records = await loadQuoteRequests();
    const existing = records.find(
      (r) => r.gigId === gigId.trim() && r.customerAddress === customerAddress
    );
    return NextResponse.json({
      hasRequested: !!existing,
      threadId: existing?.threadId,
    });
  } catch (error) {
    console.error("[api/quote-request] GET error:", error);
    return NextResponse.json(
      { error: "Failed to check quote request" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { gigId?: string; customerAddress?: string };
    const gigId = (body.gigId ?? "").trim();
    const customerAddress = normalizeAddress(body.customerAddress ?? "");
    if (!gigId || !customerAddress) {
      return NextResponse.json(
        { error: "gigId and customerAddress are required" },
        { status: 400 }
      );
    }

    const records = await loadQuoteRequests();
    const existing = records.find(
      (r) => r.gigId === gigId && r.customerAddress === customerAddress
    );
    if (existing) {
      return NextResponse.json({
        threadId: existing.threadId,
        alreadyRequested: true,
      });
    }

    const gigs = await loadGigs();
    const gig = gigs.find((g) => g.id === gigId);
    const freelancerId = gig?.freelancerId ?? "";

    const threadId = randomUUID();
    const createdAt = new Date().toISOString();
    const newRecord: QuoteRequestRecord = {
      gigId,
      customerAddress,
      freelancerId,
      threadId,
      createdAt,
    };
    records.push(newRecord);
    await saveQuoteRequests(records);

    return NextResponse.json({ threadId });
  } catch (error) {
    console.error("[api/quote-request] POST error:", error);
    return NextResponse.json(
      { error: "Failed to create quote request" },
      { status: 500 }
    );
  }
}
