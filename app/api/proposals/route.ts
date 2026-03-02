import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import type { Proposal } from "@/types/proposal";
import { CreateProposalBodySchema } from "@/types/proposal";

export const PROPOSALS_PATH = path.join(
  process.cwd(),
  "app",
  "api",
  "proposals",
  "proposals.json"
);

export async function loadProposals(): Promise<Proposal[]> {
  try {
    const raw = await readFile(PROPOSALS_PATH, "utf-8");
    const data = JSON.parse(raw) as unknown;
    return Array.isArray(data) ? (data as Proposal[]) : [];
  } catch {
    return [];
  }
}

export async function saveProposals(proposals: Proposal[]): Promise<void> {
  await writeFile(
    PROPOSALS_PATH,
    JSON.stringify(proposals, null, 2),
    "utf-8"
  );
}

export async function GET(request: NextRequest) {
  try {
    const threadId = request.nextUrl.searchParams.get("threadId");
    if (!threadId?.trim()) {
      return NextResponse.json(
        { error: "threadId is required" },
        { status: 400 }
      );
    }
    const proposals = await loadProposals();
    const forThread = proposals
      .filter((p) => p.threadId === threadId.trim())
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    return NextResponse.json({ proposals: forThread });
  } catch (error) {
    console.error("[api/proposals] GET error:", error);
    return NextResponse.json(
      { error: "Failed to load proposals" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = CreateProposalBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid body", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { threadId, gigId, customerId, freelancerId, description, price, deadline } =
      parsed.data;
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    const proposal: Proposal = {
      id,
      threadId,
      gigId,
      customerId,
      freelancerId,
      description,
      price,
      deadline,
      status: "pending",
      createdAt,
    };
    const proposals = await loadProposals();
    proposals.push(proposal);
    await saveProposals(proposals);
    return NextResponse.json({ proposal });
  } catch (error) {
    console.error("[api/proposals] POST error:", error);
    return NextResponse.json(
      { error: "Failed to create proposal" },
      { status: 500 }
    );
  }
}
