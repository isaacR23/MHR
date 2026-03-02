import { NextRequest, NextResponse } from "next/server";
import { loadContracts, saveContracts } from "@/app/api/contracts/route";
import type { Contract } from "@/types/contract";
import { ContractDeliverableSchema } from "@/types/contract";

function normalizeAddress(addr: string): string {
  const s = (addr ?? "").trim().toLowerCase();
  return s.startsWith("0x") ? s : `0x${s}`;
}

const DeliveryBodySchema = ContractDeliverableSchema.pick({
  name: true,
  description: true,
  uploadId: true,
}).extend({
  name: ContractDeliverableSchema.shape.name.optional(),
  description: ContractDeliverableSchema.shape.description,
});
type DeliveryBody = { description: string; name?: string; uploadId?: string };

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ contractId: string }> }
) {
  try {
    const { contractId } = await params;
    if (!contractId?.trim()) {
      return NextResponse.json(
        { error: "Contract id is required" },
        { status: 400 }
      );
    }

    const body = (await request.json()) as DeliveryBody;
    const parsed = DeliveryBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid body", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { description, name, uploadId } = parsed.data;

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
    const index = contracts.findIndex((c) => c.id === contractId.trim());
    if (index === -1) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    const contract = contracts[index];
    const callerNorm = normalizeAddress(callerAddress);
    const payeeNorm = normalizeAddress(contract.payee);
    if (callerNorm !== payeeNorm) {
      return NextResponse.json(
        { error: "Only the payee (freelancer) can submit delivery" },
        { status: 403 }
      );
    }

    if (contract.status !== "in_progress") {
      return NextResponse.json(
        { error: "Contract must be in_progress to submit delivery" },
        { status: 400 }
      );
    }

    const deliverable = {
      name: name ?? "Delivery",
      description,
      uploadId,
      status: "pending" as const,
    };

    const existing = contract.contractDeliverables ?? [];
    const updated: Contract = {
      ...contract,
      contractDeliverables: [...existing, deliverable],
      updatedAt: new Date().toISOString(),
    };

    contracts[index] = updated;
    await saveContracts(contracts);

    return NextResponse.json({ contract: updated });
  } catch (error) {
    console.error("[api/contracts/[contractId]/delivery] POST error:", error);
    return NextResponse.json(
      { error: "Failed to submit delivery" },
      { status: 500 }
    );
  }
}
