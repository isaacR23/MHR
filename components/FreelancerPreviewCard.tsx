"use client";

import { Briefcase } from "lucide-react";
import type { Gig } from "@/lib/freelancer-types";

type FreelancerPreviewCardProps = {
  firstName: string;
  lastName: string;
  bio: string;
  skills: string[];
  gigs: Gig[];
  hourlyRate: string;
  settlementFrequency: string;
};

export function FreelancerPreviewCard({
  firstName,
  lastName,
  bio,
  skills,
  gigs,
  hourlyRate,
  settlementFrequency,
}: FreelancerPreviewCardProps) {
  const displayName =
    [firstName, lastName].filter(Boolean).join(" ") || "Your Name";
  const initials = [firstName, lastName]
    .filter(Boolean)
    .map((n) => n.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  return (
    <div className="w-full lg:w-80 border border-border bg-card p-6 space-y-5 shrink-0">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
        Preview
      </p>
      <div className="flex items-start gap-4">
        <div className="size-14 bg-secondary border border-border flex items-center justify-center shrink-0">
          <span className="text-lg font-bold text-primary">{initials}</span>
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="text-sm font-bold text-foreground truncate">
            {displayName}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2">{bio}</p>
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
          Rate
        </p>
        <p className="text-xl font-bold text-foreground">
          {hourlyRate ? `$${hourlyRate}/hr` : "—"}
        </p>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
          {settlementFrequency}
        </p>
      </div>
      {skills.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
            Skills
          </p>
          <div className="flex flex-wrap gap-1.5">
            {skills.slice(0, 6).map((skill) => (
              <span
                key={skill}
                className="inline-flex border border-primary/30 bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide"
              >
                {skill}
              </span>
            ))}
            {skills.length > 6 && (
              <span className="text-[10px] text-muted-foreground">
                +{skills.length - 6}
              </span>
            )}
          </div>
        </div>
      )}
      {gigs.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium flex items-center gap-1.5">
            <Briefcase className="size-3" />
            Gigs
          </p>
          <div className="space-y-2">
            {gigs.slice(0, 3).map((gig) => (
              <div
                key={gig.id}
                className="border border-border p-3 space-y-1"
              >
                <p className="text-xs font-semibold text-foreground truncate">
                  {gig.title || "Untitled"}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {gig.price ? `$${gig.price}` : "—"} · {gig.deliveryTime || "—"}
                </p>
              </div>
            ))}
            {gigs.length > 3 && (
              <p className="text-[10px] text-muted-foreground">
                +{gigs.length - 3} more
              </p>
            )}
          </div>
        </div>
      )}
      {gigs.length === 0 && skills.length === 0 && !bio && (
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground italic">
          Complete the form to see preview
        </p>
      )}
    </div>
  );
}
