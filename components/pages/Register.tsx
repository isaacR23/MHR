"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { X, Plus, Shield, Cpu, Briefcase } from "lucide-react";
import { useWallet } from "@/components/providers/WalletProvider";
import { FreelancerPreviewCard } from "@/components/FreelancerPreviewCard";
import {
  type Gig,
  createEmptyGig,
  ensureGigId,
} from "@/lib/freelancer-types";

const steps = ["Identity", "Skills", "Gigs", "Payout"];

const SETTLEMENT_OPTIONS = [
  "Real-time / Per block",
  "Weekly",
  "Monthly",
] as const;

const DELIVERY_OPTIONS = [
  "24 hours",
  "3 days",
  "1 week",
  "2 weeks",
  "1 month",
] as const;

const Register = () => {
  const router = useRouter();
  const { eoaAddress, isLoading: walletLoading } = useWallet();
  const [currentStep, setCurrentStep] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState(["Smart Contracts", "Rust", "Solidity"]);
  const [newSkill, setNewSkill] = useState("");
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [hourlyRate, setHourlyRate] = useState("85.00");
  const [settlementFrequency, setSettlementFrequency] =
    useState<typeof SETTLEMENT_OPTIONS[number]>("Weekly");
  const [profileLoading, setProfileLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const gigTagInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const addGig = () => {
    setGigs([...gigs, createEmptyGig()]);
  };

  const removeGig = (id: string) => {
    gigTagInputRefs.current.delete(id);
    setGigs(gigs.filter((g) => g.id !== id));
  };

  const updateGig = (id: string, updates: Partial<Gig>) => {
    setGigs(
      gigs.map((g) => (g.id === id ? { ...g, ...updates } : g))
    );
  };

  const addGigTag = (gigId: string, tag: string) => {
    const t = tag.trim();
    if (!t) return;
    setGigs(
      gigs.map((g) => {
        if (g.id !== gigId || g.tags.includes(t)) return g;
        return { ...g, tags: [...g.tags, t] };
      })
    );
  };

  const removeGigTag = (gigId: string, tag: string) => {
    setGigs(
      gigs.map((g) =>
        g.id === gigId ? { ...g, tags: g.tags.filter((t) => t !== tag) } : g
      )
    );
  };

  const loadProfile = useCallback(async () => {
    if (!eoaAddress) {
      setProfileLoading(false);
      return;
    }
    setProfileLoading(true);
    try {
      const res = await fetch(
        `/api/freelancer?address=${encodeURIComponent(eoaAddress)}`
      );
      const data = await res.json();
      if (data.profile) {
        setFirstName(data.profile.firstName ?? "");
        setLastName(data.profile.lastName ?? "");
        setBio(data.profile.bio ?? "");
        setSkills(
          Array.isArray(data.profile.skills)
            ? data.profile.skills
            : ["Smart Contracts", "Rust", "Solidity"]
        );
        setGigs(
          Array.isArray(data.profile.gigs)
            ? data.profile.gigs.map((g: Gig) => ensureGigId(g))
            : []
        );
        setHourlyRate(data.profile.hourlyRate ?? "85.00");
        const freq = data.profile.settlementFrequency ?? "Weekly";
        setSettlementFrequency(
          SETTLEMENT_OPTIONS.includes(freq) ? freq : "Weekly"
        );
      }
    } catch {
      setError("Failed to load profile");
    } finally {
      setProfileLoading(false);
    }
  }, [eoaAddress]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSubmit = async () => {
    if (!eoaAddress) {
      setError("Connect your wallet first");
      return;
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => Math.min(steps.length - 1, s + 1));
      return;
    }

    setSubmitLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/freelancer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: eoaAddress,
          firstName,
          lastName,
          bio,
          skills,
          gigs,
          hourlyRate,
          settlementFrequency,
          registeredAt: new Date().toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.detail
          ? `${data.error}: ${data.detail}`
          : (data.error ?? "Failed to save");
        throw new Error(msg);
      }
      router.push("/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSubmitLoading(false);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  if (walletLoading || profileLoading) {
    return (
      <div className="p-8 max-w-3xl mx-auto flex items-center justify-center min-h-[200px]">
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    );
  }

  if (!eoaAddress) {
    return (
      <div className="p-8 max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-foreground">
          Freelancer Registration
        </h1>
        <div className="border border-border p-6 text-center">
          <p className="text-muted-foreground mb-4">
            Connect your wallet to register as a freelancer.
          </p>
          <button
            onClick={() => router.push("/auth")}
            className="bg-primary text-primary-foreground px-6 py-3 text-sm font-medium uppercase tracking-wide hover:opacity-90"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <p className="text-primary text-xs font-bold uppercase tracking-widest mb-1">
            Onboarding Phase 01
          </p>
          <h1 className="text-3xl font-bold text-foreground">
            Freelancer Registration
          </h1>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-foreground">{Math.round(progress)}%</p>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            System Ready
          </p>
        </div>
      </motion.div>

      {error && (
        <div className="p-4 border border-destructive/50 bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Progress bar */}
      <div className="h-0.5 bg-secondary w-full">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Step tabs */}
      <div className="flex gap-4">
        {steps.map((step, i) => (
          <button
            key={step}
            onClick={() => setCurrentStep(i)}
            className={`text-xs font-medium uppercase tracking-widest transition-colors ${
              i === currentStep
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {`0${i + 1} ${step}`}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Form */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 min-w-0 space-y-8"
        >
          {currentStep === 0 && (
            <>
              <div className="flex items-center gap-2 text-foreground">
                <Shield className="size-5 text-primary" />
                <h2 className="text-sm font-bold uppercase tracking-widest">
                  Identity Parameters
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                    First Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Satoshi"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-card border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                    Last Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Nakamoto"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-card border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                  Professional Bio / Metadata
                </label>
                <textarea
                  rows={4}
                  placeholder="Brief technical summary for human/AI indexing..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-card border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors resize-none"
                />
              </div>
            </>
          )}

          {currentStep === 1 && (
            <>
              <div className="flex items-center gap-2 text-foreground">
                <Cpu className="size-5 text-primary" />
                <h2 className="text-sm font-bold uppercase tracking-widest">
                  Skill Sets
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 border border-primary/30 bg-primary/10 text-primary px-3 py-1.5 text-xs font-medium uppercase tracking-wide"
                  >
                    {skill}
                    <button onClick={() => removeSkill(skill)}>
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSkill()}
                  placeholder="Add technical tags (AI recognizable)..."
                  className="flex-1 bg-card border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                />
                <button
                  onClick={addSkill}
                  className="bg-primary text-primary-foreground px-3 flex items-center justify-center hover:opacity-90"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <div className="flex items-center gap-2 text-foreground">
                <Briefcase className="size-5 text-primary" />
                <h2 className="text-sm font-bold uppercase tracking-widest">
                  Gigs
                </h2>
              </div>
              <p className="text-xs text-muted-foreground">
                Define service offerings clients can hire you for.
              </p>
              <div className="space-y-6">
                {gigs.map((gig) => (
                  <div
                    key={gig.id}
                    className="border border-border bg-card p-5 space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Gig #{gigs.indexOf(gig) + 1}
                      </h3>
                      <button
                        onClick={() => removeGig(gig.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                          Title
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Smart Contract Audit"
                          value={gig.title}
                          onChange={(e) =>
                            updateGig(gig.id, { title: e.target.value })
                          }
                          className="w-full bg-card border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                        />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                          Description
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Brief description of the service..."
                          value={gig.description}
                          onChange={(e) =>
                            updateGig(gig.id, { description: e.target.value })
                          }
                          className="w-full bg-card border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors resize-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                          Price (USD)
                        </label>
                        <div className="flex items-center bg-card border border-border px-4 py-3">
                          <span className="text-muted-foreground text-sm mr-2">$</span>
                          <input
                            type="text"
                            placeholder="500"
                            value={gig.price}
                            onChange={(e) =>
                              updateGig(gig.id, { price: e.target.value })
                            }
                            className="bg-transparent text-sm text-foreground outline-none flex-1"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                          Delivery
                        </label>
                        <select
                          value={gig.deliveryTime}
                          onChange={(e) =>
                            updateGig(gig.id, {
                              deliveryTime: e.target.value,
                            })
                          }
                          className="w-full bg-card border border-border px-4 py-3 text-sm text-foreground outline-none focus:border-primary appearance-none"
                        >
                          <option value="">Select</option>
                          {DELIVERY_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2 space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                          Tags
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {gig.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1.5 border border-primary/30 bg-primary/10 text-primary px-2 py-1 text-[10px] font-medium uppercase"
                            >
                              {tag}
                              <button
                                onClick={() => removeGigTag(gig.id, tag)}
                                className="hover:text-destructive"
                              >
                                <X className="size-2.5" />
                              </button>
                            </span>
                          ))}
                          <div className="flex items-center gap-1">
                            <input
                              ref={(el) => {
                                if (el) gigTagInputRefs.current.set(gig.id, el);
                              }}
                              type="text"
                              placeholder="Add tag..."
                              className="w-24 bg-card border border-border px-2 py-1 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  const input = e.currentTarget;
                                  const value = input.value.trim();
                                  if (value) {
                                    addGigTag(gig.id, value);
                                    input.value = "";
                                  }
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const input = gigTagInputRefs.current.get(gig.id);
                                const value = input?.value?.trim();
                                if (value) {
                                  addGigTag(gig.id, value);
                                  if (input) input.value = "";
                                }
                              }}
                              className="bg-primary text-primary-foreground p-1 hover:opacity-90 flex items-center justify-center"
                              aria-label="Add tag"
                            >
                              <Plus className="size-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addGig}
                  className="w-full border border-dashed border-border py-4 text-xs font-medium uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="size-4" />
                  Add Gig
                </button>
              </div>
            </>
          )}

          {currentStep === 3 && (
            <>
              <div className="flex items-center gap-2 text-foreground">
                <Shield className="size-5 text-primary" />
                <h2 className="text-sm font-bold uppercase tracking-widest">
                  Payout Preferences
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                    Base Hourly Rate (USD Equivalent)
                  </label>
                  <div className="flex items-center bg-card border border-border px-4 py-3">
                    <span className="text-muted-foreground text-sm mr-2">$</span>
                    <input
                      type="text"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      className="bg-transparent text-sm text-foreground outline-none flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                    Settlement Frequency
                  </label>
                  <select
                    value={settlementFrequency}
                    onChange={(e) =>
                      setSettlementFrequency(
                        e.target.value as typeof SETTLEMENT_OPTIONS[number]
                      )
                    }
                    className="w-full bg-card border border-border px-4 py-3 text-sm text-foreground outline-none focus:border-primary appearance-none"
                  >
                    {SETTLEMENT_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}
        </motion.div>

        {/* Preview card */}
        <div className="lg:w-80 shrink-0">
          <div className="lg:sticky lg:top-8">
            <FreelancerPreviewCard
              firstName={firstName}
              lastName={lastName}
              bio={bio}
              skills={skills}
              gigs={gigs}
              hourlyRate={hourlyRate}
              settlementFrequency={settlementFrequency}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-border pt-6 flex items-center justify-between">
        <button
          onClick={() =>
            currentStep === 0
              ? router.push("/")
              : setCurrentStep((s) => Math.max(0, s - 1))
          }
          className="border border-border text-foreground px-6 py-3 text-xs font-bold uppercase tracking-wide hover:bg-accent transition-colors"
        >
          {currentStep === 0 ? "Cancel" : "Back"}
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitLoading}
          className="bg-primary text-primary-foreground px-8 py-3 text-xs font-bold uppercase tracking-wide hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
        >
          {submitLoading
            ? "Saving..."
            : currentStep === steps.length - 1
              ? "Submit"
              : "Commit & Continue →"}
        </button>
      </div>

      {/* Footer info */}
      <div className="border border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Cpu className="size-5 text-muted-foreground" />
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Data optimized for cross-chain indexing and AI matching protocols.
          </p>
        </div>
        <div className="flex gap-6">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Node Status</p>
            <p className="text-xs font-bold text-success">Synced</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Validation</p>
            <p className="text-xs font-bold text-primary font-mono">
              {eoaAddress.slice(0, 6)}...{eoaAddress.slice(-4)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
