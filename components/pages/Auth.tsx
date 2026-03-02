"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Briefcase, Mail, ArrowRight } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useWallet } from "@/components/providers/WalletProvider";
import { getMagic } from "@/lib/magic";

const Auth = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { syncWalletState, isLoggedIn, isLoading: authLoading } = useAuth();
  const { refreshWallet } = useWallet();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const m = searchParams.get("mode");
    if (m === "signup" || m === "signin") setMode(m);
  }, [searchParams]);

  /** Safe redirect: same-origin path only (no // or protocol). */
  const getSafeRedirect = (raw: string | null): string | null => {
    if (raw == null || typeof raw !== "string") return null;
    const path = raw.trim();
    if (path.startsWith("/") && !path.startsWith("//")) return path;
    return null;
  };

  useEffect(() => {
    if (!authLoading && isLoggedIn) {
      const redirect = getSafeRedirect(searchParams.get("redirect"));
      const action = searchParams.get("action");
      const target = redirect ?? "/";
      const query = action ? `?action=${encodeURIComponent(action)}` : "";
      router.replace(target + query);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- redirect/action read from searchParams inside effect
  }, [authLoading, isLoggedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }
    setIsSubmitting(true);
    try {
      const magic = getMagic();
      await magic.auth.loginWithEmailOTP({ email: trimmed });
      await syncWalletState();
      await refreshWallet();
      const redirect = getSafeRedirect(searchParams.get("redirect"));
      const action = searchParams.get("action");
      const target = redirect ?? "/";
      const query = action ? `?action=${encodeURIComponent(action)}` : "";
      router.push(target + query);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoggedIn) {
    return (
      <div className="dark min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center text-muted-foreground text-sm uppercase tracking-widest">
          Loading…
        </div>
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-8"
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="size-12 bg-primary flex items-center justify-center">
            <Briefcase className="size-6 text-primary-foreground" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground uppercase tracking-tight">
              Aigent Flow
            </h1>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
              {mode === "signin" ? "Welcome back" : "Join the network"}
            </p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex border border-border">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wide transition-colors ${
              mode === "signin"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wide transition-colors ${
              mode === "signup"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Email form (same for both modes) */}
        <motion.form
          key={mode}
          initial={{ opacity: 0, x: mode === "signin" ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
              Email
            </label>
            <div className="flex items-center border border-border bg-card">
              <Mail className="size-4 text-muted-foreground ml-4 shrink-0" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="flex-1 bg-transparent px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-destructive" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-primary-foreground py-3.5 text-sm font-bold uppercase tracking-wide flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {mode === "signin" ? "Sign In" : "Create Account"}
            <ArrowRight className="size-4" />
          </button>
        </motion.form>

        {/* Footer */}
        <p className="text-center text-[10px] text-muted-foreground uppercase tracking-widest">
          Secured by on-chain identity protocols
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
