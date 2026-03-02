"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Star,
  Globe,
  Shield,
  MessageSquare,
  Zap,
  Award,
  CheckCircle,
  ArrowLeft,
  Briefcase,
} from "lucide-react";
import type { FreelancerProfile, Gig } from "@/lib/freelancer-types";

type Props = { address: string };

export default function HireFreelancer({ address }: Props) {
  const router = useRouter();
  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/freelancer?address=${encodeURIComponent(address)}`)
      .then((r) => r.json())
      .then((data) => setProfile(data.profile ?? null))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [address]);

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <div className="border border-border bg-card p-12 text-center space-y-4">
          <p className="text-muted-foreground">Profile not found</p>
          <button
            onClick={() => router.push("/hire")}
            className="text-primary text-sm font-medium hover:underline"
          >
            ← Back to Browse Gigs
          </button>
        </div>
      </div>
    );
  }

  const displayName =
    [profile.firstName, profile.lastName].filter(Boolean).join(" ") ||
    "Anonymous";
  const initials = [profile.firstName, profile.lastName]
    .filter(Boolean)
    .map((n) => n.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <Link
        href="/hire"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Browse Gigs
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row gap-6"
      >
        <div className="flex-1 space-y-4">
          <div className="flex items-start gap-5">
            <div className="size-20 bg-card border border-border flex items-center justify-center shrink-0">
              <span className="text-2xl font-bold text-primary">{initials}</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">
                  {displayName}
                </h1>
                <span className="inline-flex items-center gap-1 border border-success/30 text-success text-[10px] uppercase tracking-widest font-bold px-2 py-0.5">
                  <Shield className="size-3" />
                  Verified
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-mono">
                {profile.address.slice(0, 6)}...{profile.address.slice(-4)}
              </p>
            </div>
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            {profile.bio || "No bio provided."}
          </p>
        </div>

        <div className="w-full lg:w-80 border border-border bg-card p-6 space-y-5 shrink-0">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
              Hourly Rate
            </p>
            <p className="text-3xl font-bold text-foreground">
              {profile.hourlyRate ? `$${profile.hourlyRate}/hr` : "—"}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {profile.settlementFrequency}
            </p>
          </div>
          <div className="space-y-3">
            <Link
              href="/contract"
              className="w-full bg-primary text-primary-foreground py-3 text-sm font-bold uppercase tracking-wide flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Zap className="size-4" />
              Initiate Contract
            </Link>
            <button className="w-full border border-border text-foreground py-3 text-sm font-bold uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-accent transition-colors">
              <MessageSquare className="size-4" />
              Send Message
            </button>
          </div>
        </div>
      </motion.div>

      {/* Skills */}
      {profile.skills?.length ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
            Skills
          </p>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center border border-primary/30 bg-primary/10 text-primary px-3 py-1.5 text-xs font-medium uppercase tracking-wide"
              >
                {skill}
              </span>
            ))}
          </div>
        </motion.div>
      ) : null}

      {/* Gigs */}
      {profile.gigs?.length ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-3"
        >
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium flex items-center gap-1.5">
            <Briefcase className="size-3" />
            Gigs
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {profile.gigs.map((gig: Gig) => (
              <div
                key={gig.id}
                className="border border-border bg-card p-5 space-y-3"
              >
                <h3 className="text-sm font-bold text-foreground">
                  {gig.title || "Untitled"}
                </h3>
                {gig.description ? (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {gig.description}
                  </p>
                ) : null}
                <p className="text-xs font-medium text-foreground">
                  {gig.price ? `$${gig.price}` : "—"} · {gig.deliveryTime || "—"}
                </p>
                {gig.tags?.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {gig.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </motion.div>
      ) : null}

      {/* Trust footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="border border-border bg-card p-5 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <Award className="size-5 text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              Platform Verified
            </p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Identity confirmed · Escrow-protected · AI-compatible
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-success">
          <CheckCircle className="size-4" />
          <span className="text-xs font-bold uppercase">Trust Score</span>
        </div>
      </motion.div>
    </div>
  );
}
