/**
 * Deploys a new escrow contract instance when a gig is agreed (client + freelancer).
 * Uses the same relayer as execute-safe-tx; relayer pays gas.
 *
 * Requires:
 * - RELAYER_PRIVATE_KEY
 * - ESCROW_BYTECODE (hex string from compiled Solidity escrow)
 *
 * Constructor args must match your escrow contract. This route uses a common
 * shape: payer (client), payee (freelancer), amountWei, tokenAddress (or zero for native).
 * Adjust the ABI and body schema to match your contract.
 */

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

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as const;

/** Minimal escrow ABI: constructor only. Adjust to match your Solidity contract. */
const escrowDeployAbi = [
  {
    inputs: [
      { internalType: "address", name: "payer", type: "address" },
      { internalType: "address", name: "payee", type: "address" },
      { internalType: "uint256", name: "amountWei", type: "uint256" },
      { internalType: "address", name: "token", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
] as const;

type DeployEscrowBody = {
  /** Client (payer) address */
  payer: string;
  /** Freelancer (payee) address */
  payee: string;
  /** Escrow amount in wei (string to avoid JSON number limits) */
  amountWei: string;
  /** Token address for ERC20, or omit/zero for native (MATIC) */
  token?: string;
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

    const bytecode = process.env.ESCROW_BYTECODE;
    if (!bytecode || !bytecode.startsWith("0x")) {
      return NextResponse.json(
        {
          error:
            "ESCROW_BYTECODE not configured. Compile your escrow contract and set ESCROW_BYTECODE (hex string) in .env",
        },
        { status: 503 }
      );
    }

    const body = (await request.json()) as DeployEscrowBody;
    const { payer, payee, amountWei } = body;
    if (!payer || !payee || !amountWei) {
      return NextResponse.json(
        { error: "payer, payee, and amountWei are required" },
        { status: 400 }
      );
    }

    const token = (body.token ?? ZERO_ADDRESS) as Hex;
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
      abi: escrowDeployAbi,
      account,
      bytecode: bytecode as Hex,
      args: [payer as Hex, payee as Hex, BigInt(amountWei), token],
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
