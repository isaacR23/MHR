"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import type { Proposal } from "@/types/proposal";

function normalizeAddress(addr: string): string {
  const s = (addr ?? "").trim().toLowerCase();
  return s.startsWith("0x") ? s : `0x${s}`;
}

type ProposalCardProps = {
  proposal: Proposal;
  freelancerId: string | undefined;
  currentUserAddress: string | undefined;
  onAccept: (proposalId: string) => Promise<void>;
  onReject: (proposalId: string) => Promise<void>;
  loadingId: string | null;
  contractId?: string | null;
  onActivateContract?: (proposalId: string) => Promise<string | null>;
  activatingContractId?: string | null;
};

export default function ProposalCard({
  proposal,
  freelancerId,
  currentUserAddress,
  onAccept,
  onReject,
  loadingId,
  contractId,
  onActivateContract,
  activatingContractId,
}: ProposalCardProps) {
  const isFreelancer =
    Boolean(currentUserAddress && freelancerId) &&
    normalizeAddress(currentUserAddress ?? "") ===
      normalizeAddress(freelancerId ?? "");
  const showActions =
    proposal.status === "pending" && isFreelancer;
  const busy = loadingId === proposal.id;
  const activating = activatingContractId === proposal.id;
  const showActivateButton =
    proposal.status === "accepted" && !contractId && onActivateContract;
  const showOpenContract = proposal.status === "accepted" && contractId;

  const statusClass =
    proposal.status === "accepted"
      ? "text-green-600 dark:text-green-400"
      : proposal.status === "rejected"
        ? "text-destructive"
        : "text-muted-foreground";

  return (
    <div className="rounded-lg border border-border bg-muted/20 p-4">
      <p className="text-sm text-foreground">{proposal.description}</p>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span>${Number(proposal.price).toLocaleString()}</span>
        <span>
          Deadline: {format(new Date(proposal.deadline), "MMM d, yyyy")}
        </span>
        <span className={statusClass}>{proposal.status}</span>
      </div>
      {showActions && (
        <div className="mt-3 flex gap-2">
          <Button
            size="sm"
            onClick={() => onAccept(proposal.id)}
            disabled={busy}
          >
            Accept
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onReject(proposal.id)}
            disabled={busy}
          >
            Reject
          </Button>
        </div>
      )}
      {showActivateButton && (
        <div className="mt-3">
          <Button
            size="sm"
            variant="secondary"
            onClick={async () => {
              const id = await onActivateContract?.(proposal.id);
              if (id) window.location.href = `/contract/${id}`;
            }}
            disabled={activating}
          >
            <FileText className="mr-2 size-4" />
            {activating ? "Creating…" : "Activate contract"}
          </Button>
        </div>
      )}
      {showOpenContract && (
        <div className="mt-3">
          <Button size="sm" variant="outline" asChild>
            <Link href={`/contract/${contractId}`}>
              <FileText className="mr-2 size-4" />
              Open contract
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
