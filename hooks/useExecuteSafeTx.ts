"use client";

import { useCallback } from "react";
import type { MetaTransactionData } from "@safe-global/types-kit";
import { getMagic } from "@/lib/magic";
import { executeSafeTx as executeSafeTxLib, type ExecuteSafeTxResult } from "@/lib/executeSafeTx";
import { useWallet } from "@/components/providers/WalletProvider";
import { useSafeDeployment } from "@/hooks/useSafeDeployment";

export function useExecuteSafeTx(): {
  executeSafeTx: (
    metaTx: MetaTransactionData | MetaTransactionData[]
  ) => Promise<ExecuteSafeTxResult>;
  isReady: boolean;
  safeAddress: string | undefined;
  error: string | null;
} {
  const { eoaAddress } = useWallet();
  const { safeAddress, isDeployed, error: safeError } = useSafeDeployment();

  const executeSafeTx = useCallback(
    async (metaTx: MetaTransactionData | MetaTransactionData[]) => {
      if (!eoaAddress || !safeAddress || !isDeployed) {
        return {
          ok: false,
          error: "Wallet or Safe not ready",
        } as ExecuteSafeTxResult;
      }
      const magic = getMagic();
      const provider = magic.rpcProvider as import("@/lib/executeSafeTx").SafeProvider;
      return executeSafeTxLib({
        safeAddress,
        metaTx,
        provider,
        signerAddress: eoaAddress,
      });
    },
    [eoaAddress, safeAddress, isDeployed]
  );

  const isReady = Boolean(eoaAddress && safeAddress && isDeployed);
  const error = safeError;

  return {
    executeSafeTx,
    isReady,
    safeAddress,
    error,
  };
}
