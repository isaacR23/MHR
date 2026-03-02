"use client";

import { useState } from "react";
import { Wallet, Shield, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/components/providers/WalletProvider";
import { useSafeDeployment } from "@/hooks/useSafeDeployment";

/**
 * Minimal "ensure Safe" flow for testing: shows EOA, Safe address, deployed status,
 * and a Deploy Safe button when not deployed.
 */
export function WalletSafeCard() {
  const { eoaAddress, isLoading: walletLoading, error: walletError } = useWallet();
  const {
    safeAddress,
    isDeployed,
    isLoading: safeLoading,
    error: safeError,
    ensureDeployed,
  } = useSafeDeployment();
  const [isDeploying, setIsDeploying] = useState(false);

  const handleDeploy = async () => {
    setIsDeploying(true);
    try {
      await ensureDeployed();
    } finally {
      setIsDeploying(false);
    }
  };

  if (walletLoading) {
    return (
      <Card>
        <CardContent className="flex items-center gap-2 py-6">
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Loading wallet…</span>
        </CardContent>
      </Card>
    );
  }

  if (!eoaAddress) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Wallet className="size-4" />
            Wallet & Safe
          </CardTitle>
          <CardDescription>Sign in to see your EOA and Safe wallet.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const error = walletError ?? safeError;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Wallet className="size-4" />
          Wallet & Safe
        </CardTitle>
        <CardDescription>
          EOA (Magic) and Safe address. Deploy Safe once to enable gas‑sponsored execution.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">EOA</p>
          <p className="font-mono text-xs text-foreground break-all">{eoaAddress}</p>
        </div>
        {safeAddress && (
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <Shield className="size-3" />
              Safe
            </p>
            <p className="font-mono text-xs text-foreground break-all">{safeAddress}</p>
            <p className="text-xs text-muted-foreground">
              {safeLoading ? "Checking…" : isDeployed ? "Deployed" : "Not deployed"}
            </p>
          </div>
        )}
        {error && (
          <p className="text-xs text-destructive" role="alert">
            {error}
          </p>
        )}
        {safeAddress && !isDeployed && (
          <Button
            size="sm"
            variant="default"
            onClick={handleDeploy}
            disabled={safeLoading || isDeploying}
          >
            {isDeploying ? (
              <>
                <Loader2 className="size-3.5 animate-spin mr-1.5" />
                Deploying…
              </>
            ) : (
              "Deploy Safe"
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
