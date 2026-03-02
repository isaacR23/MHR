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

const safeExecAbi = [
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "value", type: "uint256" },
      { internalType: "bytes", name: "data", type: "bytes" },
      { internalType: "enum Enum.Operation", name: "operation", type: "uint8" },
      { internalType: "uint256", name: "safeTxGas", type: "uint256" },
      { internalType: "uint256", name: "baseGas", type: "uint256" },
      { internalType: "uint256", name: "gasPrice", type: "uint256" },
      { internalType: "address", name: "gasToken", type: "address" },
      {
        internalType: "address payable",
        name: "refundReceiver",
        type: "address",
      },
      { internalType: "bytes", name: "signatures", type: "bytes" },
    ],
    name: "execTransaction",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "payable",
    type: "function",
  },
] as const;

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as const;

type SafeTxPayload = {
  to: string;
  value?: string;
  data: string;
  operation?: number;
  safeTxGas?: string;
  baseGas?: string;
  gasPrice?: string;
  gasToken?: string;
  refundReceiver?: string;
};

type Body = {
  safeAddress: string;
  safeTx: SafeTxPayload;
  signatures: string;
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
    const body = (await request.json()) as Body;
    const { safeAddress, safeTx, signatures } = body;
    if (
      !safeAddress ||
      typeof safeTx !== "object" ||
      !safeTx.to ||
      typeof safeTx.data !== "string" ||
      typeof signatures !== "string"
    ) {
      return NextResponse.json(
        { error: "safeAddress, safeTx (to, data), and signatures required" },
        { status: 400 }
      );
    }

    const privateKey = (
      rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`
    ) as Hex;
    const account = privateKeyToAccount(privateKey);

    const rpcUrl = process.env.NEXT_PUBLIC_POLYGON_RPC_URL ?? polygon.rpcUrls.default.http[0];
    const chain: Chain = polygon;
    const transport = http(rpcUrl);

    const publicClient = createPublicClient({ chain, transport });
    const walletClient = createWalletClient({
      account,
      chain,
      transport,
    });

    const safeAddressHex = safeAddress as Hex;
    const args = [
      safeTx.to as Hex,
      BigInt(safeTx.value ?? "0"),
      safeTx.data as Hex,
      Number(safeTx.operation ?? 0),
      BigInt(safeTx.safeTxGas ?? "0"),
      BigInt(safeTx.baseGas ?? "0"),
      BigInt(safeTx.gasPrice ?? "0"),
      (safeTx.gasToken ?? ZERO_ADDRESS) as Hex,
      (safeTx.refundReceiver ?? ZERO_ADDRESS) as Hex,
      signatures as Hex,
    ] as const;

    const { request: execRequest } = await publicClient.simulateContract({
      account,
      address: safeAddressHex,
      abi: safeExecAbi,
      functionName: "execTransaction",
      args,
    });

    const txHash = await walletClient.writeContract(execRequest);
    return NextResponse.json({ transactionHash: txHash });
  } catch (e) {
    console.error("[api/execute-safe-tx] Error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Execution failed" },
      { status: 500 }
    );
  }
}
