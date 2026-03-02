"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Send, MessageCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchChatHistoryByThreadId,
  sendChatMessageToThread,
  type ChatMessage,
} from "@/lib/chat";
import { format } from "date-fns";
import { useWallet } from "@/components/providers/WalletProvider";
import ProposalForm from "@/components/ProposalForm";
import ProposalCard from "@/components/ProposalCard";
import type { Proposal } from "@/types/proposal";
import type { Contract } from "@/types/contract";

type ThreadMetadata = {
  gigId: string;
  gigTitle: string;
  freelancerName: string;
  customerAddress?: string;
  freelancerId?: string;
};

type ChatThreadProps = {
  threadId: string;
};

function normalizeAddress(addr: string): string {
  const s = (addr ?? "").trim().toLowerCase();
  return s.startsWith("0x") ? s : `0x${s}`;
}

export default function ChatThread({ threadId }: ChatThreadProps) {
  const { eoaAddress } = useWallet();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [metadata, setMetadata] = useState<ThreadMetadata | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [proposalsLoading, setProposalsLoading] = useState(true);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [contractsLoading, setContractsLoading] = useState(true);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposalActionLoadingId, setProposalActionLoadingId] = useState<
    string | null
  >(null);
  const [activatingContractProposalId, setActivatingContractProposalId] =
    useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [metaLoading, setMetaLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const isCustomer =
    Boolean(eoaAddress && metadata?.customerAddress) &&
    normalizeAddress(eoaAddress ?? "") ===
      normalizeAddress(metadata?.customerAddress ?? "");

  const loadMessages = useCallback(async () => {
    try {
      const list = await fetchChatHistoryByThreadId(threadId);
      setMessages(list);
    } catch (e) {
      console.error("[ChatThread] loadMessages:", e);
      setError("Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, [threadId]);

  const loadProposals = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/proposals?threadId=${encodeURIComponent(threadId)}`
      );
      if (res.ok) {
        const data = (await res.json()) as { proposals: Proposal[] };
        setProposals(data.proposals ?? []);
      }
    } catch (e) {
      console.error("[ChatThread] loadProposals:", e);
    } finally {
      setProposalsLoading(false);
    }
  }, [threadId]);

  const loadContracts = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/contracts?threadId=${encodeURIComponent(threadId)}`
      );
      if (res.ok) {
        const data = (await res.json()) as { contracts: Contract[] };
        setContracts(data.contracts ?? []);
      }
    } catch (e) {
      console.error("[ChatThread] loadContracts:", e);
    } finally {
      setContractsLoading(false);
    }
  }, [threadId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    loadProposals();
  }, [loadProposals]);

  useEffect(() => {
    loadContracts();
  }, [loadContracts]);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/quote-request/thread/${encodeURIComponent(threadId)}`)
      .then((res) => {
        if (res.status === 404 || !res.ok) return null;
        return res.json();
      })
      .then((data: ThreadMetadata | null) => {
        if (!cancelled && data) setMetadata(data);
      })
      .catch(() => {
        if (!cancelled) setMetadata(null);
      })
      .finally(() => {
        if (!cancelled) setMetaLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [threadId]);

  const handleProposalAccept = async (proposalId: string) => {
    if (!eoaAddress) return;
    setProposalActionLoadingId(proposalId);
    try {
      const res = await fetch(`/api/proposals/${proposalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "accepted",
          freelancerAddress: eoaAddress,
        }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to accept proposal");
      }
      const data = (await res.json()) as { proposal: Proposal };
      setProposals((prev) =>
        prev.map((p) => (p.id === data.proposal.id ? data.proposal : p))
      );
    } catch (e) {
      console.error("[ChatThread] accept proposal:", e);
    } finally {
      setProposalActionLoadingId(null);
    }
  };

  const handleActivateContract = async (
    proposalId: string
  ): Promise<string | null> => {
    setActivatingContractProposalId(proposalId);
    try {
      const res = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalId }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to create contract");
      }
      const data = (await res.json()) as { contract: Contract };
      setContracts((prev) => {
        const exists = prev.some((c) => c.id === data.contract.id);
        return exists ? prev : [...prev, data.contract];
      });
      return data.contract.id;
    } catch (e) {
      console.error("[ChatThread] activate contract:", e);
      return null;
    } finally {
      setActivatingContractProposalId(null);
    }
  };

  const handleProposalReject = async (proposalId: string) => {
    if (!eoaAddress) return;
    setProposalActionLoadingId(proposalId);
    try {
      const res = await fetch(`/api/proposals/${proposalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "rejected",
          freelancerAddress: eoaAddress,
        }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to reject proposal");
      }
      const data = (await res.json()) as { proposal: Proposal };
      setProposals((prev) =>
        prev.map((p) => (p.id === data.proposal.id ? data.proposal : p))
      );
    } catch (e) {
      console.error("[ChatThread] reject proposal:", e);
    } finally {
      setProposalActionLoadingId(null);
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setInput("");
    try {
      const result = await sendChatMessageToThread(threadId, text);
      setMessages(result.messages);
    } catch (e) {
      console.error("[ChatThread] send:", e);
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <p className="text-destructive">{error}</p>
        <p className="text-sm text-muted-foreground">
          You may need to request a quote from the gig page first.
        </p>
        <Button variant="outline" asChild>
          <Link href="/gigs">Browse gigs</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="size-5 text-primary" />
          {metaLoading ? (
            <Skeleton className="h-5 w-48" />
          ) : (
            <h1 className="text-lg font-bold text-foreground">
              {metadata?.gigTitle ?? "Conversation"}
            </h1>
          )}
          {metadata?.freelancerName && (
            <span className="text-sm text-muted-foreground">
              · {metadata.freelancerName}
            </span>
          )}
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/gigs">Back to gigs</Link>
        </Button>
      </header>

      {isCustomer && metadata && (
        <div className="shrink-0 border-b border-border px-6 py-3">
          {showProposalForm ? (
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <ProposalForm
                threadId={threadId}
                gigId={metadata.gigId}
                customerId={metadata.customerAddress!}
                freelancerId={metadata.freelancerId ?? ""}
                onSuccess={(proposal) => {
                  setProposals((prev) => [...prev, proposal]);
                  setShowProposalForm(false);
                }}
                onCancel={() => setShowProposalForm(false)}
              />
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowProposalForm(true)}
            >
              <FileText className="mr-2 size-4" />
              Send proposal
            </Button>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6">
        {!proposalsLoading && proposals.length > 0 && (
          <div className="mb-6 space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground">
              Proposals
            </h2>
            {proposals.map((p) => (
              <ProposalCard
                key={p.id}
                proposal={p}
                freelancerId={metadata?.freelancerId}
                currentUserAddress={eoaAddress ?? undefined}
                onAccept={handleProposalAccept}
                onReject={handleProposalReject}
                loadingId={proposalActionLoadingId}
                contractId={
                  contracts.find((c) => c.proposalId === p.id)?.id ?? null
                }
                onActivateContract={handleActivateContract}
                activatingContractId={activatingContractProposalId}
              />
            ))}
          </div>
        )}
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-16 w-full max-w-md" />
            <Skeleton className="h-16 w-full max-w-md ml-auto" />
            <Skeleton className="h-16 w-full max-w-md" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            No messages yet. Start the conversation.
          </p>
        ) : (
          <div className="space-y-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "assistant" ? "justify-end" : ""}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-2 text-sm ${
                    m.role === "assistant"
                      ? "bg-primary/15 border border-primary/30"
                      : "bg-muted border border-border"
                  }`}
                >
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                    {m.role === "user" ? "You" : "Freelancer"}
                    {m.timestamp && (
                      <> · {format(new Date(m.timestamp), "HH:mm")}</>
                    )}
                  </p>
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-border p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 rounded-md border border-border bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={sending}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            size="icon"
          >
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
