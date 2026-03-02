import { NextRequest, NextResponse } from "next/server";
import { loadContracts, saveContracts } from "@/app/api/contracts/route";
import type { Contract } from "@/types/contract";

export async function GET(
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
    const contract = contracts.find((c) => c.id === id.trim());
    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }
    return NextResponse.json({ contract });
  } catch (error) {
    console.error("[api/contracts/[id]] GET error:", error);
    return NextResponse.json(
      { error: "Failed to load contract" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
    const body = (await request.json()) as { status?: Contract["status"] };
    const contracts = await loadContracts();
    const index = contracts.findIndex((c) => c.id === id.trim());
    if (index === -1) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }
    const contract = contracts[index];
    const allowed: Contract["status"][] = [
      "discovery",
      "awaiting_deposit",
      "in_progress",
      "completed",
      "cancelled",
      "disputed",
    ];
    if (body.status && allowed.includes(body.status)) {
      const now = new Date().toISOString();
      contracts[index] = { ...contract, status: body.status, updatedAt: now };
      await saveContracts(contracts);
      return NextResponse.json({ contract: contracts[index] });
    }
    return NextResponse.json(
      { error: "Invalid or missing status" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[api/contracts/[id]] PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update contract" },
      { status: 500 }
    );
  }
}
