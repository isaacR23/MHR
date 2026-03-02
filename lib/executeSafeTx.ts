/**
 * Client helper: create Safe tx, sign with EOA, POST to /api/execute-safe-tx.
 * Gas is paid by the server relayer; user never needs POL.
 */

import Safe from "@safe-global/protocol-kit";
import type { MetaTransactionData, SafeTransactionData } from "@safe-global/types-kit";

const EXECUTE_SAFE_TX_URL = "/api/execute-safe-tx";

const DEFAULT_OPTIONS = {
  safeTxGas: "200000",
  baseGas: "0",
  gasPrice: "0",
  gasToken: "0x0000000000000000000000000000000000000000",
  refundReceiver: "0x0000000000000000000000000000000000000000",
};

/** EIP-1193 provider shape expected by Safe SDK */
export type SafeProvider = {
  request: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>;
};

export type ExecuteSafeTxParams = {
  safeAddress: string;
  metaTx: MetaTransactionData | MetaTransactionData[];
  provider: SafeProvider;
  signerAddress: string;
};

export type ExecuteSafeTxResult =
  | { ok: true; transactionHash: string }
  | { ok: false; error: string };

/**
 * Creates a Safe transaction, signs it with the EOA (via Magic), and sends
 * the signed payload to the server relayer to execute (relayer pays gas).
 */
export async function executeSafeTx(
  params: ExecuteSafeTxParams
): Promise<ExecuteSafeTxResult> {
  const { safeAddress, metaTx, provider, signerAddress } = params;
  try {
    const safe = await Safe.init({
      safeAddress,
      provider,
      signer: signerAddress,
    });

    const transactions = Array.isArray(metaTx) ? metaTx : [metaTx];
    const options = {
      safeTxGas: DEFAULT_OPTIONS.safeTxGas,
      baseGas: DEFAULT_OPTIONS.baseGas,
      gasPrice: DEFAULT_OPTIONS.gasPrice,
      gasToken: DEFAULT_OPTIONS.gasToken,
      refundReceiver: DEFAULT_OPTIONS.refundReceiver,
    };

    let safeTransaction = await safe.createTransaction({
      transactions,
      options,
    });

    safeTransaction = await safe.signTransaction(
      safeTransaction,
      "eth_signTypedData_v4"
    );

    const data = safeTransaction.data as SafeTransactionData;
    const body = {
      safeAddress,
      safeTx: {
        to: data.to,
        value: data.value,
        data: data.data,
        operation: data.operation,
        safeTxGas: data.safeTxGas,
        baseGas: data.baseGas,
        gasPrice: data.gasPrice,
        gasToken: data.gasToken,
        refundReceiver: data.refundReceiver,
      },
      signatures: safeTransaction.encodedSignatures(),
    };

    const res = await fetch(EXECUTE_SAFE_TX_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const json = await res.json();
    if (!res.ok) {
      return {
        ok: false,
        error: json.error ?? `Request failed: ${res.status}`,
      };
    }
    const transactionHash = json.transactionHash;
    if (!transactionHash) {
      return { ok: false, error: "No transactionHash in response" };
    }
    return { ok: true, transactionHash };
  } catch (e) {
    const message = e instanceof Error ? e.message : "executeSafeTx failed";
    return { ok: false, error: message };
  }
}
