/**
 * Deploys a new Freelance escrow contract when a gig is agreed (client + freelancer).
 * Uses the same relayer as execute-safe-tx; relayer pays gas.
 *
 * Constructor: _usdc, _freelancer, _customer. USDC defaults to app constant
 * (Polygon mainnet); override via request body. Amount is not set at deploy—
 * customer funds later via depositUsdc / depositPol on the deployed contract.
 *
 * Requires: RELAYER_PRIVATE_KEY
 */

import { getPolygonUsdcAddress } from "@/lib/constants";
import { NextRequest, NextResponse } from "next/server";
import {
  createPublicClient,
  createWalletClient,
  http,
  type Chain,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { polygon } from "viem/chains";

import escrowArtifact from "./abi.json";

type DeployEscrowBody = {
  /** Freelancer (payee) address */
  freelancer: string;
  /** Customer (payer) address */
  customer: string;
  /** USDC token address; omit to use app default (Polygon USDC from lib/constants) */
  usdc?: string;
};

export async function POST(request: NextRequest) {
  try {
    const rawKey = process.env.RELAYER_PRIVATE_KEY;
    if (!rawKey) {
      return NextResponse.json(
        { error: "RELAYER_PRIVATE_KEY not configured" },
        { status: 500 }
      );
    }

    const body = (await request.json()) as DeployEscrowBody;
    const { freelancer, customer } = body;
    if (!freelancer || !customer) {
      return NextResponse.json(
        { error: "freelancer and customer are required" },
        { status: 400 }
      );
    }

    const usdc =
      body.usdc && body.usdc.startsWith("0x")
        ? (body.usdc as Hex)
        : getPolygonUsdcAddress();

    const bytecode = (escrowArtifact as { bytecode?: { object?: string } })
      ?.bytecode?.object;
    if (!bytecode || !bytecode.startsWith("0x")) {
      return NextResponse.json(
        { error: "Escrow artifact missing bytecode.object" },
        { status: 503 }
      );
    }

    const privateKey = (
      rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`
    ) as Hex;
    const account = privateKeyToAccount(privateKey);

    const rpcUrl =
      process.env.NEXT_PUBLIC_POLYGON_RPC_URL ?? polygon.rpcUrls.default.http[0];
    const chain: Chain = polygon;
    const transport = http(rpcUrl);

    const publicClient = createPublicClient({ chain, transport });
    const walletClient = createWalletClient({
      account,
      chain,
      transport,
    });

    const txHash = await walletClient.deployContract({
      abi: escrowArtifact.abi as readonly unknown[],
      account,
      bytecode: bytecode as Hex,
      args: [usdc, freelancer as Hex, customer as Hex],
    });

    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
    });

    const contractAddress = receipt.contractAddress;
    if (!contractAddress) {
      return NextResponse.json(
        { error: "Deployment tx did not return a contract address" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      contractAddress,
      transactionHash: txHash,
      network: "polygon",
    });
  } catch (e) {
    console.error("[api/deploy-escrow] Error:", e);
    return NextResponse.json(
      {
        error:
          e instanceof Error ? e.message : "Escrow deployment failed",
      },
      { status: 500 }
    );
  }
}
