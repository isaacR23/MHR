import { NextRequest, NextResponse } from "next/server";
import { loadContracts, saveContracts } from "@/app/api/contracts/route";
import type { Contract } from "@/types/contract";

function normalizeAddress(addr: string): string {
  const s = (addr ?? "").trim().toLowerCase();
  return s.startsWith("0x") ? s : `0x${s}`;
}

type AcceptBody = { role: "payer" | "payee" };

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id?.trim()) {
      return NextResponse.json(
        { error: "Contract id is required" },
        { status: 400 }
      );
    }

    const body = (await request.json()) as AcceptBody;
    if (body.role !== "payer" && body.role !== "payee") {
      return NextResponse.json(
        { error: "body.role must be 'payer' or 'payee'" },
        { status: 400 }
      );
    }

    const callerAddress =
      request.headers.get("x-wallet-address")?.trim() ??
      (body as { walletAddress?: string }).walletAddress?.trim();
    if (!callerAddress) {
      return NextResponse.json(
        { error: "Caller wallet address required (x-wallet-address or body.walletAddress)" },
        { status: 401 }
      );
    }

    const contracts = await loadContracts();
    const index = contracts.findIndex((c) => c.id === id.trim());
    if (index === -1) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    const contract = contracts[index];
    const callerNorm = normalizeAddress(callerAddress);
    const payerNorm = normalizeAddress(contract.payer);
    const payeeNorm = normalizeAddress(contract.payee);

    if (body.role === "payer" && callerNorm !== payerNorm) {
      return NextResponse.json(
        { error: "Caller does not match contract payer" },
        { status: 403 }
      );
    }
    if (body.role === "payee" && callerNorm !== payeeNorm) {
      return NextResponse.json(
        { error: "Caller does not match contract payee" },
        { status: 403 }
      );
    }

    if (contract.status !== "in_progress" && contract.status !== "awaiting_deposit") {
      return NextResponse.json(
        { error: "Contract must be in progress to confirm delivery" },
        { status: 400 }
      );
    }

    const updated: Contract = {
      ...contract,
      payer_acceptance: body.role === "payer" ? true : contract.payer_acceptance,
      payee_acceptance: body.role === "payee" ? true : contract.payee_acceptance,
      updatedAt: new Date().toISOString(),
    };

    contracts[index] = updated;
    await saveContracts(contracts);

    return NextResponse.json({ contract: updated });
  } catch (error) {
    console.error("[api/contracts/[id]/accept] POST error:", error);
    return NextResponse.json(
      { error: "Failed to record acceptance" },
      { status: 500 }
    );
  }
}
