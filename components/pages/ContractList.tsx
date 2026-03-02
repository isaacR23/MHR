"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { FileText, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWallet } from "@/components/providers/WalletProvider";
import type { Contract } from "@/types/contract";

function normalizeAddress(addr: string): string {
  const s = (addr ?? "").trim().toLowerCase();
  return s.startsWith("0x") ? s : `0x${s}`;
}

function statusLabel(status: Contract["status"]): string {
  return status.replace("_", " ");
}

function ContractCard({
  contract,
  currentAddress,
}: {
  contract: Contract;
  currentAddress: string;
}) {
  const isPayer =
    normalizeAddress(contract.payer) === normalizeAddress(currentAddress);
  const role = isPayer ? "Customer" : "Freelancer";
  return (
    <Link href={`/contract/${contract.id}`}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer">
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <FileText className="size-5 text-muted-foreground" />
            <span className="font-semibold text-foreground">
              ${Number(contract.amount).toLocaleString()} · {role}
            </span>
          </div>
          <ChevronRight className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground capitalize">
            {statusLabel(contract.status)}
          </p>
          {contract.contractSpecs?.[0]?.escrowAddress && (
            <p className="text-[10px] font-mono text-muted-foreground mt-1 truncate max-w-full">
              Escrow: {contract.contractSpecs[0].escrowAddress.slice(0, 10)}…
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export default function ContractList() {
  const { eoaAddress } = useWallet();

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ["contracts", eoaAddress],
    queryFn: async (): Promise<Contract[]> => {
      if (!eoaAddress) return [];
      const res = await fetch(
        `/api/contracts?address=${encodeURIComponent(eoaAddress)}`
      );
      if (!res.ok) throw new Error("Failed to load contracts");
      const data = (await res.json()) as { contracts: Contract[] };
      return data.contracts ?? [];
    },
    enabled: Boolean(eoaAddress),
  });

  if (!eoaAddress) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Active Contracts</h1>
        <p className="text-muted-foreground">
          Connect your wallet to see your contracts.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Active Contracts</h1>
      <p className="text-muted-foreground text-sm">
        Contracts where you are the customer (payer) or freelancer (payee). Open
        a contract to activate escrow, deposit, or manage delivery.
      </p>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : contracts.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <FileText className="size-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No contracts yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Accept a proposal in a chat to create a contract, then open it from
              the conversation or from here.
            </p>
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/gigs">Browse gigs</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {contracts.map((c) => (
            <ContractCard
              key={c.id}
              contract={c}
              currentAddress={eoaAddress}
            />
          ))}
        </div>
      )}
    </div>
  );
}
