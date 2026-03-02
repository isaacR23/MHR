"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Briefcase, Zap, User } from "lucide-react";
import type { FreelancerProfile, Gig } from "@/lib/freelancer-types";

type GigWithFreelancer = Gig & {
  freelancerAddress: string;
  freelancerName: string;
};

function flattenGigs(freelancers: FreelancerProfile[]): GigWithFreelancer[] {
  const result: GigWithFreelancer[] = [];
  for (const f of freelancers) {
    const name = [f.firstName, f.lastName].filter(Boolean).join(" ") || "Anonymous";
    for (const gig of f.gigs || []) {
      if (gig?.title) {
        result.push({
          ...gig,
          freelancerAddress: f.address,
          freelancerName: name,
        });
      }
    }
  }
  return result;
}

export function GigsBrowse() {
  const [gigs, setGigs] = useState<GigWithFreelancer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/freelancers")
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data.freelancers) ? data.freelancers : [];
        setGigs(flattenGigs(list));
      })
      .catch(() => setGigs([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <p className="text-muted-foreground text-sm">Loading gigs...</p>
      </div>
    );
  }

  if (gigs.length === 0) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <div className="border border-border bg-card p-12 text-center space-y-4">
          <Briefcase className="size-12 mx-auto text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">No gigs yet</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Freelancers can register and add gigs from the Talent Pool. Check back soon.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 text-sm font-medium uppercase tracking-wide hover:opacity-90"
          >
            <User className="size-4" />
            Join as Freelancer
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Browse Gigs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {gigs.length} service{gigs.length !== 1 ? "s" : ""} available
          </p>
        </div>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {gigs.map((gig, i) => (
          <motion.div
            key={`${gig.freelancerAddress}-${gig.id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              href={`/hire/${gig.freelancerAddress}`}
              className="block border border-border bg-card p-5 hover:border-primary/40 transition-colors group"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary">
                  {gig.title || "Untitled"}
                </h3>
                <Zap className="size-3.5 text-primary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {gig.description ? (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                  {gig.description}
                </p>
              ) : null}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-foreground">
                  {gig.price ? `$${gig.price}` : "—"}
                </span>
                <span className="text-[10px] text-muted-foreground">·</span>
                <span className="text-[10px] text-muted-foreground">
                  {gig.deliveryTime || "—"}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 truncate">
                {gig.freelancerName}
              </p>
              {gig.tags?.length ? (
                <div className="flex flex-wrap gap-1 mt-2">
                  {gig.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
