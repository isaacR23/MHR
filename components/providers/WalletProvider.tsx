"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createWalletClient, custom, type WalletClient } from "viem";
import { polygon } from "viem/chains";
import { getMagic } from "@/lib/magic";

type WalletContextType = {
  eoaAddress: `0x${string}` | undefined;
  walletClient: WalletClient | undefined;
  isLoading: boolean;
  error: string | null;
  refreshWallet: () => Promise<void>;
};

const WalletContext = createContext<WalletContextType>({
  eoaAddress: undefined,
  walletClient: undefined,
  isLoading: true,
  error: null,
  refreshWallet: async () => {},
});

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return context;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [eoaAddress, setEoaAddress] = useState<`0x${string}` | undefined>();
  const [walletClient, setWalletClient] = useState<WalletClient | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshWallet = useCallback(async () => {
    if (typeof window === "undefined") return;
    setError(null);
    try {
      const magic = getMagic();
      const loggedIn = await magic.user.isLoggedIn();
      if (!loggedIn) {
        setEoaAddress(undefined);
        setWalletClient(undefined);
        return;
      }
      const userInfo = await magic.user.getInfo();
      const info = userInfo as {
        wallets?: { ethereum?: { publicAddress?: string } };
      };
      const address = info.wallets?.ethereum?.publicAddress;
      if (!address) {
        setEoaAddress(undefined);
        setWalletClient(undefined);
        return;
      }
      const normalizedAddress = address.startsWith("0x")
        ? (address as `0x${string}`)
        : (`0x${address}` as `0x${string}`);
      setEoaAddress(normalizedAddress);

      const client = createWalletClient({
        chain: polygon,
        transport: custom(magic.rpcProvider as import("viem").EIP1193Provider),
      });
      setWalletClient(client);
    } catch (e) {
      console.error("[WalletProvider] refreshWallet:", e);
      setError(e instanceof Error ? e.message : "Failed to load wallet");
      setEoaAddress(undefined);
      setWalletClient(undefined);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    refreshWallet().then(() => {
      if (!cancelled) setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [refreshWallet]);

  const value = useMemo(
    () => ({
      eoaAddress,
      walletClient,
      isLoading,
      error,
      refreshWallet,
    }),
    [eoaAddress, walletClient, isLoading, error, refreshWallet]
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}
