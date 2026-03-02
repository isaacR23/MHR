/**
 * Release flow: escrow has approveCustomer() and approveFreelancer() (no separate release).
 * When both are called on-chain, funds release to freelancer. This API returns which
 * method the caller must invoke; optionally marks contract completed when escrow.resolved().
 */

import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, type Hex } from "viem";
import { polygon } from "viem/chains";
import { loadContracts, saveContracts } from "@/app/api/contracts/route";
import type { Contract } from "@/types/contract";
import escrowAbi from "@/app/api/deploy-escrow/abi.json";

function normalizeAddress(addr: string): string {
  const s = (addr ?? "").trim().toLowerCase();
  return s.startsWith("0x") ? s : `0x${s}`;
}

type ReleaseBody = { markCompleted?: boolean };

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

    const body = (await request.json()).catch(() => ({})) as ReleaseBody & {
      walletAddress?: string;
    };
    const callerAddress =
      request.headers.get("x-wallet-address")?.trim() ?? body.walletAddress?.trim();
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
    if (!contract.payer_acceptance || !contract.payee_acceptance) {
      return NextResponse.json(
        { error: "Both payer and payee must accept delivery before release" },
        { status: 400 }
      );
    }

    const spec = contract.contractSpecs?.[0];
    if (!spec?.escrowAddress) {
      return NextResponse.json(
        { error: "Contract has no escrow address" },
        { status: 400 }
      );
    }

    const callerNorm = normalizeAddress(callerAddress);
    const payerNorm = normalizeAddress(contract.payer);
    const payeeNorm = normalizeAddress(contract.payee);
    const isPayer = callerNorm === payerNorm;
    const isPayee = callerNorm === payeeNorm;

    const action = isPayer ? "approveCustomer" : isPayee ? "approveFreelancer" : null;
    if (!action) {
      return NextResponse.json(
        { error: "Caller must be contract payer or payee" },
        { status: 403 }
      );
    }

    const network = spec.network ?? "polygon";
    const rpcUrl =
      process.env.NEXT_PUBLIC_POLYGON_RPC_URL ?? polygon.rpcUrls.default.http[0];
    const publicClient = createPublicClient({
      chain: polygon,
      transport: http(rpcUrl),
    });

    if (body.markCompleted === true) {
      const resolved = await publicClient.readContract({
        address: spec.escrowAddress as Hex,
        abi: escrowAbi.abi as readonly unknown[],
        functionName: "resolved",
      });
      if (resolved) {
        const now = new Date().toISOString();
        const updated: Contract = {
          ...contract,
          status: "completed",
          updatedAt: now,
        };
        contracts[index] = updated;
        await saveContracts(contracts);
        return NextResponse.json({
          contract: updated,
          released: true,
          message: "Contract marked completed; funds have been released on-chain.",
        });
      }
    }

    return NextResponse.json({
      escrowAddress: spec.escrowAddress,
      network,
      action,
      message:
        action === "approveCustomer"
          ? "Customer must call approveCustomer() on the escrow contract."
          : "Freelancer must call approveFreelancer() on the escrow contract. When both have approved on-chain, funds release automatically.",
    });
  } catch (error) {
    console.error("[api/contracts/[id]/release] POST error:", error);
    return NextResponse.json(
      { error: "Failed to process release" },
      { status: 500 }
    );
  }
}
