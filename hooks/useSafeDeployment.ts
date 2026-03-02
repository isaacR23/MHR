"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RelayClient } from "@polymarket/builder-relayer-client";
import { BuilderConfig } from "@polymarket/builder-signing-sdk";
import { getContractConfig } from "@polymarket/builder-relayer-client/dist/config";
import { deriveSafe } from "@polymarket/builder-relayer-client/dist/builder/derive";
import { useWallet } from "@/components/providers/WalletProvider";
import {
  POLYGON_CHAIN_ID,
  getPolymarketRelayerUrl,
  getRemoteSigningUrl,
} from "@/lib/wallet-constants";

type SafeDeploymentState = {
  safeAddress: string | undefined;
  isDeployed: boolean;
  isLoading: boolean;
  error: string | null;
  ensureDeployed: () => Promise<boolean>;
};

export function useSafeDeployment(): SafeDeploymentState {
  const { eoaAddress, walletClient } = useWallet();
  const [safeAddress, setSafeAddress] = useState<string | undefined>();
  const [isDeployed, setIsDeployed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ensureDeployed = useCallback(async (): Promise<boolean> => {
    if (!eoaAddress || !walletClient) return false;
    try {
      let relayerUrl: string;
      try {
        relayerUrl = getPolymarketRelayerUrl();
      } catch {
        setError("Polymarket relayer URL not configured");
        return false;
      }
      const builderConfig = new BuilderConfig({
        remoteBuilderConfig: { url: getRemoteSigningUrl() },
      });
      const config = getContractConfig(POLYGON_CHAIN_ID);
      const expectedSafe = deriveSafe(eoaAddress, config.SafeContracts.SafeFactory);
      setSafeAddress(expectedSafe);
      const client = new RelayClient(
        relayerUrl,
        POLYGON_CHAIN_ID,
        walletClient,
        builderConfig
      );
      const deployed = await client.getDeployed(expectedSafe);
      if (deployed) {
        setIsDeployed(true);
        setError(null);
        return true;
      }
      const response = await client.deploy();
      const result = await response.wait();
      if (result) {
        setIsDeployed(true);
        setError(null);
        return true;
      }
      setError("Safe deployment failed or timed out");
      return false;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Safe deployment failed";
      setError(message);
      console.error("[useSafeDeployment] ensureDeployed:", e);
      return false;
    }
  }, [eoaAddress, walletClient]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!eoaAddress || !walletClient) {
      setSafeAddress(undefined);
      setIsDeployed(false);
      setIsLoading(false);
      setError(null);
      return;
    }
    let cancelled = false;
    setError(null);
    setIsLoading(true);
    (async () => {
      try {
        let relayerUrl: string;
        try {
          relayerUrl = getPolymarketRelayerUrl();
        } catch {
          if (!cancelled) setError("Polymarket relayer URL not configured");
          return;
        }
        const config = getContractConfig(POLYGON_CHAIN_ID);
        const expectedSafe = deriveSafe(eoaAddress, config.SafeContracts.SafeFactory);
        if (cancelled) return;
        setSafeAddress(expectedSafe);
        const builderConfig = new BuilderConfig({
          remoteBuilderConfig: { url: getRemoteSigningUrl() },
        });
        const client = new RelayClient(
          relayerUrl,
          POLYGON_CHAIN_ID,
          walletClient,
          builderConfig
        );
        const deployed = await client.getDeployed(expectedSafe);
        if (cancelled) return;
        setIsDeployed(deployed);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to get Safe status");
          console.error("[useSafeDeployment] init:", e);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [eoaAddress, walletClient]);

  return useMemo(
    () => ({
      safeAddress,
      isDeployed,
      isLoading,
      error,
      ensureDeployed,
    }),
    [safeAddress, isDeployed, isLoading, error, ensureDeployed]
  );
}
