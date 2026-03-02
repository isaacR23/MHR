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
import { getMagic } from "@/lib/magic";

type AuthContextType = {
  userEmail: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  syncWalletState: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  userEmail: null,
  isLoggedIn: false,
  isLoading: true,
  syncWalletState: async () => {},
  logout: async () => {},
});

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    if (typeof window === "undefined") return;
    try {
      const magic = getMagic();
      const userInfo = await magic.user.getInfo();
      const info = userInfo as { email?: string | null; wallets?: { ethereum?: { publicAddress?: string } } };
      setUserEmail(info.email ?? null);
    } catch {
      setUserEmail(null);
    }
  }, []);

  const syncWalletState = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  const logout = useCallback(async () => {
    if (typeof window === "undefined") return;
    try {
      const magic = getMagic();
      await magic.user.logout();
    } catch (e) {
      console.error("[AuthProvider] logout:", e);
    } finally {
      setUserEmail(null);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const magic = getMagic();
        const loggedIn = await magic.user.isLoggedIn();
        if (cancelled) return;
        if (loggedIn) {
          await fetchUser();
        } else {
          setUserEmail(null);
        }
      } catch {
        if (!cancelled) setUserEmail(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchUser]);

  const value = useMemo(
    () => ({
      userEmail,
      isLoggedIn: !!userEmail,
      isLoading,
      syncWalletState,
      logout,
    }),
    [userEmail, isLoading, syncWalletState, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
