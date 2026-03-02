"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MessageCircle, MessageSquare } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useWallet } from "@/components/providers/WalletProvider";
import { toast } from "sonner";

type GigApi = {
  id: string;
  title: string;
  description: string;
  price: number;
  deadline: string;
  deliveryTime?: string;
  status: string;
  freelancerId: string;
  tags?: string[];
  freelancer?: {
    firstName: string;
    lastName: string;
    bio: string;
    skills: string[];
  };
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDeadline(deadline: string): string {
  try {
    const d = new Date(deadline);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return deadline;
  }
}

type GigDetailProps = {
  gigId: string;
};

export default function GigDetail({ gigId }: GigDetailProps) {
  const router = useRouter();
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const { eoaAddress, isLoading: walletLoading } = useWallet();
  const [gig, setGig] = useState<GigApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasRequested, setHasRequested] = useState<boolean | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [requestQuotePending, setRequestQuotePending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/gigs/${encodeURIComponent(gigId)}`)
      .then((res) => {
        if (res.status === 404) {
          setGig(null);
          return null;
        }
        if (!res.ok) throw new Error("Failed to load gig");
        return res.json();
      })
      .then((data: { gig?: GigApi } | null) => {
        if (cancelled) return;
        if (data?.gig) setGig(data.gig);
        else if (data === null) setGig(null);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Something went wrong");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [gigId]);

  useEffect(() => {
    if (!isLoggedIn || !gig || !eoaAddress) {
      setHasRequested(null);
      setThreadId(null);
      return;
    }
    let cancelled = false;
    const addr = eoaAddress.toLowerCase();
    fetch(
      `/api/quote-request?gigId=${encodeURIComponent(gig.id)}&customerAddress=${encodeURIComponent(addr)}`
    )
      .then((res) => res.json())
      .then((data: { hasRequested?: boolean; threadId?: string }) => {
        if (!cancelled) {
          setHasRequested(!!data.hasRequested);
          setThreadId(data.threadId ?? null);
        }
      })
      .catch(() => {
        if (!cancelled) setHasRequested(null);
      });
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, gig?.id, eoaAddress, gig]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Skeleton className="mb-4 h-6 w-32" />
        <Skeleton className="mb-6 h-10 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" size="sm" className="mt-4" asChild>
          <Link href="/gigs">Back to gigs</Link>
        </Button>
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-muted-foreground">Gig not found.</p>
        <Button variant="outline" size="sm" className="mt-4" asChild>
          <Link href="/gigs">Back to gigs</Link>
        </Button>
      </div>
    );
  }

  const freelancerName = gig.freelancer
    ? [gig.freelancer.firstName, gig.freelancer.lastName].filter(Boolean).join(" ")
    : "—";
  const requestQuoteHref = `/auth?redirect=${encodeURIComponent(`/gigs/${gig.id}`)}&action=request_quote`;

  const handleRequestQuote = async () => {
    if (!isLoggedIn || !gig) return;
    const address = eoaAddress;
    if (!address) {
      toast.error("Wallet not ready. Please try again in a moment.");
      return;
    }
    setRequestQuotePending(true);
    try {
      const res = await fetch("/api/quote-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gigId: gig.id,
          customerAddress: address.toLowerCase(),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? "Failed to request quote");
      }
      const data = (await res.json()) as { threadId: string };
      router.push(`/chat/${data.threadId}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to request quote");
    } finally {
      setRequestQuotePending(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Button variant="ghost" size="sm" className="mb-6 -ml-1" asChild>
        <Link href="/gigs" className="flex items-center gap-1">
          <ArrowLeft className="size-4" />
          Back to gigs
        </Link>
      </Button>

      <Card className="mb-6">
        <CardHeader className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{gig.status}</Badge>
            {gig.tags?.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
          <CardTitle className="text-2xl">{gig.title}</CardTitle>
          <p className="text-lg font-semibold text-foreground">
            {formatPrice(gig.price)}
          </p>
          <p className="text-sm text-muted-foreground">
            Delivery: {gig.deliveryTime ?? formatDeadline(gig.deadline)}
            {gig.deadline && gig.deliveryTime && ` · Deadline ${formatDeadline(gig.deadline)}`}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {gig.description}
          </p>
        </CardContent>
      </Card>

      {gig.freelancer && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Freelancer</CardTitle>
            <p className="font-medium text-foreground">{freelancerName}</p>
            <p className="text-sm text-muted-foreground">{gig.freelancer.bio}</p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {gig.freelancer.skills?.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-3">
        {authLoading || walletLoading ? (
          <Button disabled className="flex items-center gap-2">
            <MessageCircle className="size-4" />
            Request quote
          </Button>
        ) : isLoggedIn && hasRequested && threadId ? (
          <Button asChild className="flex items-center gap-2">
            <Link href={`/chat/${threadId}`}>
              <MessageSquare className="size-4" />
              Open conversation
            </Link>
          </Button>
        ) : isLoggedIn ? (
          <Button
            onClick={handleRequestQuote}
            disabled={requestQuotePending}
            className="flex items-center gap-2"
          >
            <MessageCircle className="size-4" />
            {requestQuotePending ? "Requesting…" : "Request quote"}
          </Button>
        ) : (
          <Button asChild>
            <Link href={requestQuoteHref} className="flex items-center gap-2">
              <MessageCircle className="size-4" />
              Request quote
            </Link>
          </Button>
        )}
        <Button variant="outline" asChild>
          <Link href="/gigs">Browse more gigs</Link>
        </Button>
      </div>
    </div>
  );
}
