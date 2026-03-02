"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen).trim() + "…";
}

export default function GigList() {
  const [gigs, setGigs] = useState<GigApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/gigs")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load gigs");
        return res.json();
      })
      .then((data: { gigs?: GigApi[] }) => {
        if (!cancelled && Array.isArray(data.gigs)) setGigs(data.gigs);
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
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-foreground">Browse Gigs</h1>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (gigs.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-foreground">Browse Gigs</h1>
        <p className="text-muted-foreground">No gigs yet.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-foreground">Browse Gigs</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {gigs.map((gig) => {
          const name = gig.freelancer
            ? [gig.freelancer.firstName, gig.freelancer.lastName].filter(Boolean).join(" ")
            : "—";
          return (
            <Link key={gig.id} href={`/gigs/${gig.id}`} className="block">
              <Card className="h-full transition-colors hover:border-primary/50 hover:bg-card">
                <CardHeader>
                  <CardTitle className="line-clamp-2 text-lg">{gig.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {truncate(gig.description, 120)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">
                    {formatPrice(gig.price)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {gig.deliveryTime ?? gig.deadline} · {name}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
