import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import type { Contract } from "@/types/contract";
import { CreateContractBodySchema } from "@/types/contract";
import { loadProposals } from "@/app/api/proposals/route";

export const CONTRACTS_PATH = path.join(
  process.cwd(),
  "app",
  "api",
  "contracts",
  "contracts.json"
);

export async function loadContracts(): Promise<Contract[]> {
  try {
    const raw = await readFile(CONTRACTS_PATH, "utf-8");
    const data = JSON.parse(raw) as unknown;
    return Array.isArray(data) ? (data as Contract[]) : [];
  } catch {
    return [];
  }
}

export async function saveContracts(contracts: Contract[]): Promise<void> {
  await writeFile(
    CONTRACTS_PATH,
    JSON.stringify(contracts, null, 2),
    "utf-8"
  );
}

function normalizeAddress(addr: string): string {
  const s = (addr ?? "").trim().toLowerCase();
  return s.startsWith("0x") ? s : `0x${s}`;
}

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");
    const threadId = request.nextUrl.searchParams.get("threadId");
    const address = request.nextUrl.searchParams.get("address");

    const contracts = await loadContracts();

    if (id?.trim()) {
      const contract = contracts.find((c) => c.id === id.trim());
      if (!contract) {
        return NextResponse.json({ error: "Contract not found" }, { status: 404 });
      }
      return NextResponse.json({ contract });
    }

    if (threadId?.trim()) {
      const forThread = contracts
        .filter((c) => c.threadId === threadId.trim())
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      return NextResponse.json({ contracts: forThread });
    }

    if (address?.trim()) {
      const norm = normalizeAddress(address);
      const forUser = contracts.filter(
        (c) =>
          normalizeAddress(c.payer) === norm || normalizeAddress(c.payee) === norm
      );
      const sorted = forUser.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      return NextResponse.json({ contracts: sorted });
    }

    return NextResponse.json(
      { error: "Provide one of: id, threadId, or address" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[api/contracts] GET error:", error);
    return NextResponse.json(
      { error: "Failed to load contracts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = CreateContractBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid body", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { proposalId } = parsed.data;

    const proposals = await loadProposals();
    const proposal = proposals.find((p) => p.id === proposalId);
    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }
    if (proposal.status !== "accepted") {
      return NextResponse.json(
        { error: "Proposal must be accepted to create a contract" },
        { status: 400 }
      );
    }

    const existing = await loadContracts();
    const alreadyHasContract = existing.some((c) => c.proposalId === proposalId);
    if (alreadyHasContract) {
      const contract = existing.find((c) => c.proposalId === proposalId)!;
      return NextResponse.json({ contract });
    }

    const now = new Date().toISOString();
    const contract: Contract = {
      id: randomUUID(),
      gigId: proposal.gigId,
      proposalId: proposal.id,
      threadId: proposal.threadId,
      payer: proposal.customerId,
      payee: proposal.freelancerId,
      amount: proposal.price,
      status: "awaiting_deposit",
      payer_acceptance: false,
      payee_acceptance: false,
      title: undefined,
      description: proposal.description,
      deadline: proposal.deadline,
      notes: [],
      contractSpecs: [],
      contractDeliverables: [],
      createdAt: now,
      updatedAt: now,
    };
    existing.push(contract);
    await saveContracts(existing);
    return NextResponse.json({ contract });
  } catch (error) {
    console.error("[api/contracts] POST error:", error);
    return NextResponse.json(
      { error: "Failed to create contract" },
      { status: 500 }
    );
  }
}
