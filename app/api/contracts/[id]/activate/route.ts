import { NextRequest, NextResponse } from "next/server";
import { loadContracts, saveContracts } from "@/app/api/contracts/route";
import type { Contract } from "@/types/contract";

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

    const contracts = await loadContracts();
    const index = contracts.findIndex((c) => c.id === id.trim());
    if (index === -1) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    const contract = contracts[index];
    if (contract.contractSpecs?.length && contract.contractSpecs[0]?.escrowAddress) {
      return NextResponse.json({
        contract,
        message: "Contract already has escrow deployed",
      });
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      request.nextUrl.origin ||
      "http://localhost:3000";
    const deployRes = await fetch(`${baseUrl}/api/deploy-escrow`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        freelancer: contract.payee,
        customer: contract.payer,
      }),
    });

    if (!deployRes.ok) {
      const errData = (await deployRes.json()) as { error?: string };
      console.error("[api/contracts/[id]/activate] deploy-escrow failed:", errData);
      return NextResponse.json(
        {
          error: errData.error ?? "Escrow deployment failed",
        },
        { status: 502 }
      );
    }

    const deployData = (await deployRes.json()) as {
      contractAddress: string;
      network: string;
    };
    const now = new Date().toISOString();
    const updated: Contract = {
      ...contract,
      contractSpecs: [
        ...(contract.contractSpecs ?? []),
        {
          network: deployData.network ?? "polygon",
          escrowAddress: deployData.contractAddress,
        },
      ],
      updatedAt: now,
    };
    contracts[index] = updated;
    await saveContracts(contracts);
    return NextResponse.json({ contract: updated });
  } catch (error) {
    console.error("[api/contracts/[id]/activate] error:", error);
    return NextResponse.json(
      { error: "Failed to activate contract" },
      { status: 500 }
    );
  }
}
