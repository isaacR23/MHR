"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { encodeFunctionData } from "viem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  ExternalLink,
  Wallet,
  FileText,
  ChevronRight,
  CheckCircle2,
  Package,
  Send,
} from "lucide-react";
import { useWallet } from "@/components/providers/WalletProvider";
import { useExecuteSafeTx } from "@/hooks/useExecuteSafeTx";
import type { Contract } from "@/types/contract";

const ESCROW_APPROVE_ABI = [
  { type: "function" as const, name: "approveCustomer", inputs: [] },
  { type: "function" as const, name: "approveFreelancer", inputs: [] },
] as const;

function normalizeAddress(addr: string): string {
  const s = (addr ?? "").trim().toLowerCase();
  return s.startsWith("0x") ? s : `0x${s}`;
}

type ContractActivationProps = {
  contractId: string;
};

export default function ContractActivation({ contractId }: ContractActivationProps) {
  const { eoaAddress } = useWallet();
  const { executeSafeTx, isReady: safeReady } = useExecuteSafeTx();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activating, setActivating] = useState(false);
  const [depositReporting, setDepositReporting] = useState(false);
  const [deliverySubmitting, setDeliverySubmitting] = useState(false);
  const [acceptSubmitting, setAcceptSubmitting] = useState(false);
  const [releaseConfirming, setReleaseConfirming] = useState(false);
  const [deliveryDescription, setDeliveryDescription] = useState("");
  const [deliveryName, setDeliveryName] = useState("");

  const loadContract = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/contracts?id=${encodeURIComponent(contractId)}`
      );
      if (!res.ok) {
        if (res.status === 404) setError("Contract not found");
        else setError("Failed to load contract");
        return;
      }
      const data = (await res.json()) as { contract: Contract };
      setContract(data.contract);
      setError(null);
    } catch (e) {
      console.error("[ContractActivation] load:", e);
      setError("Failed to load contract");
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  useEffect(() => {
    loadContract();
  }, [loadContract]);

  const isPayer =
    contract &&
    eoaAddress &&
    normalizeAddress(contract.payer) === normalizeAddress(eoaAddress);
  const isPayee =
    contract &&
    eoaAddress &&
    normalizeAddress(contract.payee) === normalizeAddress(eoaAddress);
  const hasEscrow =
    contract?.contractSpecs?.length &&
    contract.contractSpecs[0]?.escrowAddress;
  const awaitingDeposit =
    contract?.status === "awaiting_deposit" && hasEscrow;

  const handleActivate = async () => {
    if (!contractId || activating) return;
    setActivating(true);
    try {
      const res = await fetch(`/api/contracts/${contractId}/activate`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Activation failed");
      }
      const data = (await res.json()) as { contract: Contract };
      setContract(data.contract);
    } catch (e) {
      console.error("[ContractActivation] activate:", e);
      setError(e instanceof Error ? e.message : "Activation failed");
    } finally {
      setActivating(false);
    }
  };

  const handleMarkDeposited = async () => {
    if (!contractId || depositReporting) return;
    setDepositReporting(true);
    try {
      const res = await fetch(`/api/contracts/${contractId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "in_progress" }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      const data = (await res.json()) as { contract: Contract };
      setContract(data.contract);
    } catch (e) {
      console.error("[ContractActivation] mark deposited:", e);
    } finally {
      setDepositReporting(false);
    }
  };

  const handleSubmitDelivery = async () => {
    if (!contractId || !eoaAddress || deliverySubmitting) return;
    const desc = deliveryDescription.trim();
    if (!desc) return;
    setDeliverySubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/contracts/${contractId}/delivery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: desc,
          name: deliveryName.trim() || undefined,
          walletAddress: eoaAddress,
        }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Delivery submission failed");
      }
      const data = (await res.json()) as { contract: Contract };
      setContract(data.contract);
      setDeliveryDescription("");
      setDeliveryName("");
    } catch (e) {
      console.error("[ContractActivation] delivery:", e);
      setError(e instanceof Error ? e.message : "Delivery submission failed");
    } finally {
      setDeliverySubmitting(false);
    }
  };

  const handleAccept = async (role: "payer" | "payee") => {
    if (!contractId || !eoaAddress || acceptSubmitting) return;
    setAcceptSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/contracts/${contractId}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, walletAddress: eoaAddress }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Accept failed");
      }
      const data = (await res.json()) as { contract: Contract };
      setContract(data.contract);
    } catch (e) {
      console.error("[ContractActivation] accept:", e);
      setError(e instanceof Error ? e.message : "Accept failed");
    } finally {
      setAcceptSubmitting(false);
    }
  };

  const handleReleaseOnChain = async () => {
    if (!contractId || !eoaAddress || releaseConfirming || !contract?.contractSpecs?.[0]?.escrowAddress) return;
    setReleaseConfirming(true);
    setError(null);
    try {
      const res = await fetch(`/api/contracts/${contractId}/release`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: eoaAddress }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Release check failed");
      }
      const data = (await res.json()) as {
        contract?: Contract;
        escrowAddress?: string;
        action?: "approveCustomer" | "approveFreelancer";
        released?: boolean;
      };
      if (data.released && data.contract) {
        setContract(data.contract);
        return;
      }
      if (!data.escrowAddress || !data.action) throw new Error("Missing release params");
      const calldata = encodeFunctionData({
        abi: ESCROW_APPROVE_ABI,
        functionName: data.action,
      });
      const result = await executeSafeTx({
        to: data.escrowAddress,
        value: "0",
        data: calldata,
        operation: 0,
      });
      if (!result.ok) throw new Error(result.error);
      const markRes = await fetch(`/api/contracts/${contractId}/release`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: eoaAddress, markCompleted: true }),
      });
      if (markRes.ok) {
        const markData = (await markRes.json()) as { contract?: Contract };
        if (markData.contract) setContract(markData.contract);
      }
      await loadContract();
    } catch (e) {
      console.error("[ContractActivation] release:", e);
      setError(e instanceof Error ? e.message : "Release failed");
    } finally {
      setReleaseConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error && !contract) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" asChild>
          <Link href="/contract">Back to contracts</Link>
        </Button>
      </div>
    );
  }

  if (!contract) return null;

  const escrowAddress = contract.contractSpecs?.[0]?.escrowAddress;
  const network = contract.contractSpecs?.[0]?.network ?? "polygon";

  return (
    <div className="space-y-6 p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/contract" className="hover:text-foreground">
          Contracts
        </Link>
        <ChevronRight className="size-4" />
        <span className="text-foreground">Contract details</span>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="size-5" />
            Contract
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Gig · Proposal accepted · {contract.status.replace("_", " ")}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {contract.description && (
            <p className="text-sm text-foreground">{contract.description}</p>
          )}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Amount</p>
              <p className="font-semibold">
                ${Number(contract.amount).toLocaleString()} USDC
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <p className="font-medium capitalize">
                {contract.status.replace("_", " ")}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Payer (customer)</p>
              <p className="font-mono text-xs truncate max-w-[180px]" title={contract.payer}>
                {contract.payer.slice(0, 6)}…{contract.payer.slice(-4)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Payee (freelancer)</p>
              <p className="font-mono text-xs truncate max-w-[180px]" title={contract.payee}>
                {contract.payee.slice(0, 6)}…{contract.payee.slice(-4)}
              </p>
            </div>
          </div>

          {hasEscrow && (
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-1">
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                Escrow
              </p>
              <p className="font-mono text-sm break-all">{escrowAddress}</p>
              <p className="text-xs text-muted-foreground">{network}</p>
            </div>
          )}

          {!hasEscrow && (
            <div className="pt-2">
              <p className="text-sm text-muted-foreground mb-2">
                Deploy an escrow contract so the customer can deposit funds.
              </p>
              <Button
                onClick={handleActivate}
                disabled={activating}
              >
                {activating ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Activating…
                  </>
                ) : (
                  "Activate contract (deploy escrow)"
                )}
              </Button>
            </div>
          )}

          {awaitingDeposit && isPayer && (
            <div className="pt-2 space-y-2">
              <p className="text-sm text-muted-foreground">
                Deposit USDC into the escrow to fund this contract. Use your Safe
                to call <code className="text-xs bg-muted px-1 rounded">depositUsdc(amount)</code> on
                the escrow contract (amount in USDC 6 decimals).
              </p>
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <Link href="/funding">
                    <Wallet className="mr-2 size-4" />
                    Go to funding
                  </Link>
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleMarkDeposited}
                  disabled={depositReporting}
                >
                  {depositReporting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "I’ve deposited — mark as funded"
                  )}
                </Button>
              </div>
            </div>
          )}

          {awaitingDeposit && !isPayer && (
            <p className="text-sm text-muted-foreground">
              Waiting for customer to deposit into escrow.
            </p>
          )}

          {contract.status === "in_progress" && (
            <div className="space-y-4 pt-2 border-t border-border">
              <p className="text-sm text-success font-medium">
                Escrow funded · Work in progress
              </p>

              {contract.contractDeliverables && contract.contractDeliverables.length > 0 && (
                <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-2">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium flex items-center gap-2">
                    <Package className="size-4" />
                    Deliverables
                  </p>
                  <ul className="space-y-2">
                    {contract.contractDeliverables.map((d, i) => (
                      <li key={i} className="text-sm">
                        <span className="font-medium">{d.name}</span>
                        <span className="text-muted-foreground"> — {d.description}</span>
                        {d.uploadId && (
                          <span className="text-xs text-muted-foreground"> (upload: {d.uploadId})</span>
                        )}
                        <span className="ml-2 capitalize text-muted-foreground">({d.status})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {isPayee && (
                <div className="rounded-lg border border-border p-4 space-y-2">
                  <p className="text-sm font-medium">Submit delivery</p>
                  <Input
                    placeholder="Title (optional)"
                    value={deliveryName}
                    onChange={(e) => setDeliveryName(e.target.value)}
                    className="max-w-xs"
                  />
                  <Textarea
                    placeholder="Describe what you delivered..."
                    value={deliveryDescription}
                    onChange={(e) => setDeliveryDescription(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                  <Button
                    size="sm"
                    onClick={handleSubmitDelivery}
                    disabled={deliverySubmitting || !deliveryDescription.trim()}
                  >
                    {deliverySubmitting ? (
                      <Loader2 className="size-4 animate-spin mr-2" />
                    ) : (
                      <Send className="size-4 mr-2" />
                    )}
                    Submit delivery
                  </Button>
                </div>
              )}

              <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-2">
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                  Confirm delivery
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="flex items-center gap-1.5">
                    {contract.payer_acceptance ? (
                      <CheckCircle2 className="size-4 text-success" />
                    ) : (
                      <span className="size-4 rounded-full border border-muted-foreground" />
                    )}
                    Customer {contract.payer_acceptance ? "confirmed" : "not confirmed"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    {contract.payee_acceptance ? (
                      <CheckCircle2 className="size-4 text-success" />
                    ) : (
                      <span className="size-4 rounded-full border border-muted-foreground" />
                    )}
                    Freelancer {contract.payee_acceptance ? "confirmed" : "not confirmed"}
                  </span>
                </div>
                {!contract.payer_acceptance && isPayer && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAccept("payer")}
                    disabled={acceptSubmitting}
                  >
                    {acceptSubmitting ? <Loader2 className="size-4 animate-spin" /> : "Confirm delivery (customer)"}
                  </Button>
                )}
                {!contract.payee_acceptance && isPayee && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAccept("payee")}
                    disabled={acceptSubmitting}
                  >
                    {acceptSubmitting ? <Loader2 className="size-4 animate-spin" /> : "Confirm delivery (freelancer)"}
                  </Button>
                )}
              </div>

              {contract.payer_acceptance && contract.payee_acceptance && (
                <div className="rounded-lg border border-border p-4 space-y-2">
                  <p className="text-sm font-medium">Release funds</p>
                  <p className="text-xs text-muted-foreground">
                    Both parties have accepted. Confirm on-chain to release escrow to the freelancer.
                  </p>
                  <Button
                    onClick={handleReleaseOnChain}
                    disabled={releaseConfirming || !safeReady}
                  >
                    {releaseConfirming ? (
                      <Loader2 className="size-4 animate-spin mr-2" />
                    ) : null}
                    {safeReady ? "Confirm on chain & release" : "Safe not ready — deploy Safe first"}
                  </Button>
                </div>
              )}
            </div>
          )}

          {contract.status === "completed" && (
            <p className="text-sm text-success font-medium flex items-center gap-2 pt-2 border-t border-border">
              <CheckCircle2 className="size-5" />
              Contract completed · Funds released
            </p>
          )}
        </CardContent>
      </Card>

      <Button variant="ghost" asChild>
        <Link href="/contract">
          <ExternalLink className="mr-2 size-4" />
          Back to contracts
        </Link>
      </Button>
    </div>
  );
}
