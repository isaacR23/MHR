"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Camera,
  Plus,
  X,
  Star,
  MapPin,
  Globe,
  Clock,
  Edit3,
  Save,
  Upload,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { WalletSafeCard } from "@/components/WalletSafeCard";
import { useAuth } from "@/components/providers/AuthProvider";

function initialsFromEmail(email: string): string {
  const local = email.split("@")[0]?.trim() || "";
  const parts = local.split(/[._-]/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase().slice(0, 2);
  }
  return local.slice(0, 2).toUpperCase() || "??";
}

function displayNameFromEmail(email: string): string {
  const local = email.split("@")[0]?.trim() || "";
  const parts = local.split(/[._-]/).filter(Boolean);
  return parts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(" ") || email;
}

const defaultSkills = ["Smart Contracts", "Rust", "Solidity", "React", "TypeScript"];

const defaultPortfolio = [
  {
    title: "DeFi Yield Aggregator",
    description: "Built a cross-chain yield optimization protocol handling $2M+ TVL.",
    tags: ["Solidity", "DeFi"],
  },
  {
    title: "NFT Marketplace Backend",
    description: "Architected the indexing and metadata pipeline for a 10K-item collection launch.",
    tags: ["Rust", "IPFS"],
  },
];

const Profile = () => {
  const { userEmail } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState(
    "Senior blockchain engineer specializing in secure smart contract development and cross-chain protocol design. 6+ years building in Web3, with a focus on DeFi and infrastructure tooling."
  );
  const emailDerivedName = useMemo(
    () => (userEmail ? displayNameFromEmail(userEmail) : "Alex Rivers"),
    [userEmail]
  );
  const [displayName, setDisplayName] = useState(emailDerivedName);
  const [title, setTitle] = useState("Lead Smart Contract Engineer");

  useEffect(() => {
    if (userEmail) setDisplayName(displayNameFromEmail(userEmail));
  }, [userEmail]);

  const initials = useMemo(
    () => (userEmail ? initialsFromEmail(userEmail) : "AR"),
    [userEmail]
  );
  const [location, setLocation] = useState("Berlin, Germany");
  const [hourlyRate, setHourlyRate] = useState("$120");
  const [availability, setAvailability] = useState("Available — 30h/week");
  const [skills, setSkills] = useState(defaultSkills);
  const [newSkill, setNewSkill] = useState("");
  const [portfolio, setPortfolio] = useState(defaultPortfolio);

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="h-44 bg-gradient-to-br from-primary/30 via-primary/10 to-accent border border-border overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 40px, hsl(var(--primary) / 0.15) 40px, hsl(var(--primary) / 0.15) 41px), repeating-linear-gradient(0deg, transparent, transparent 40px, hsl(var(--primary) / 0.15) 40px, hsl(var(--primary) / 0.15) 41px)"
          }} />
          {isEditing && (
            <button className="absolute top-3 right-3 bg-card/80 backdrop-blur border border-border px-3 py-1.5 text-[10px] uppercase tracking-widest font-medium text-foreground flex items-center gap-1.5 hover:bg-card transition-colors">
              <Upload className="size-3" />
              Change Banner
            </button>
          )}
        </div>

        {/* Avatar */}
        <div className="absolute -bottom-12 left-6">
          <div className="size-24 border-4 border-background bg-card flex items-center justify-center relative group">
            <span className="text-3xl font-bold text-primary">{initials}</span>
            {isEditing && (
              <button className="absolute inset-0 bg-background/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="size-5 text-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Edit toggle + Start verification */}
        <div className="absolute -bottom-12 right-0 flex items-center gap-2">
          <Link
            href="/verification"
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wide transition-colors bg-emerald-600 text-white hover:bg-emerald-700 border border-emerald-600"
          >
            <ShieldCheck className="size-3.5" />
            Start verification
          </Link>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wide transition-colors ${
              isEditing
                ? "bg-primary text-primary-foreground hover:opacity-90"
                : "border border-border text-foreground hover:bg-accent"
            }`}
          >
            {isEditing ? <Save className="size-3.5" /> : <Edit3 className="size-3.5" />}
            {isEditing ? "Save Profile" : "Edit Profile"}
          </button>
        </div>
      </motion.div>

      {/* Wallet & Safe (ensure Safe flow for testing) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mt-14"
      >
        <WalletSafeCard />
      </motion.div>

      {/* Identity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="pt-6 space-y-4"
      >
        {isEditing ? (
          <div className="space-y-3">
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="text-2xl font-bold bg-transparent border-b border-border text-foreground outline-none focus:border-primary w-full pb-1"
            />
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-sm bg-transparent border-b border-border text-muted-foreground outline-none focus:border-primary w-full pb-1"
            />
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-bold text-foreground">{displayName}</h1>
            <p className="text-sm text-muted-foreground mt-1">{title}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <MapPin className="size-3.5" />
            {isEditing ? (
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-transparent border-b border-border outline-none focus:border-primary text-foreground"
              />
            ) : location}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5" />
            {isEditing ? (
              <input
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="bg-transparent border-b border-border outline-none focus:border-primary text-foreground"
              />
            ) : availability}
          </span>
          <span className="flex items-center gap-1.5">
            <Globe className="size-3.5" />
            {isEditing ? (
              <input
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="bg-transparent border-b border-border outline-none focus:border-primary text-foreground w-16"
              />
            ) : hourlyRate}
            {!isEditing && " / hour"}
          </span>
          <span className="flex items-center gap-1.5">
            <Star className="size-3.5 text-warning" />
            4.9 (32 reviews)
          </span>
        </div>
      </motion.div>

      {/* Bio */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="space-y-3"
      >
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">About</p>
        {isEditing ? (
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full bg-card border border-border px-4 py-3 text-sm text-foreground leading-relaxed outline-none focus:border-primary resize-none"
          />
        ) : (
          <p className="text-sm text-foreground leading-relaxed">{bio}</p>
        )}
      </motion.div>

      {/* Skills */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Skills & Expertise</p>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1.5 border border-primary/30 bg-primary/10 text-primary px-3 py-1.5 text-xs font-medium uppercase tracking-wide"
            >
              {skill}
              {isEditing && (
                <button onClick={() => setSkills(skills.filter(s => s !== skill))}>
                  <X className="size-3" />
                </button>
              )}
            </span>
          ))}
        </div>
        {isEditing && (
          <div className="flex gap-2">
            <input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSkill()}
              placeholder="Add a skill..."
              className="flex-1 bg-card border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
            />
            <button onClick={addSkill} className="bg-primary text-primary-foreground px-3 flex items-center justify-center hover:opacity-90">
              <Plus className="size-4" />
            </button>
          </div>
        )}
      </motion.div>

      {/* Portfolio */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="space-y-3"
      >
        <div className="flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Portfolio Highlights</p>
          {isEditing && (
            <button
              onClick={() => setPortfolio([...portfolio, { title: "", description: "", tags: [] }])}
              className="text-primary text-xs font-medium flex items-center gap-1 hover:opacity-80"
            >
              <Plus className="size-3" /> Add Project
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {portfolio.map((item, i) => (
            <div key={i} className="border border-border bg-card p-5 space-y-3 group relative">
              {isEditing && (
                <button
                  onClick={() => setPortfolio(portfolio.filter((_, idx) => idx !== i))}
                  className="absolute top-3 right-3 text-muted-foreground hover:text-destructive"
                >
                  <X className="size-3.5" />
                </button>
              )}
              {isEditing ? (
                <>
                  <input
                    value={item.title}
                    onChange={(e) => {
                      const updated = [...portfolio];
                      updated[i] = { ...updated[i], title: e.target.value };
                      setPortfolio(updated);
                    }}
                    placeholder="Project title"
                    className="text-sm font-bold bg-transparent border-b border-border text-foreground outline-none focus:border-primary w-full pb-1"
                  />
                  <textarea
                    value={item.description}
                    onChange={(e) => {
                      const updated = [...portfolio];
                      updated[i] = { ...updated[i], description: e.target.value };
                      setPortfolio(updated);
                    }}
                    placeholder="Brief description..."
                    rows={2}
                    className="w-full bg-transparent border-b border-border text-sm text-muted-foreground outline-none focus:border-primary resize-none pb-1"
                  />
                </>
              ) : (
                <>
                  <div className="flex items-start justify-between">
                    <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
                    <ExternalLink className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                </>
              )}
              <div className="flex gap-1.5">
                {item.tags.map((tag) => (
                  <span key={tag} className="text-[10px] uppercase tracking-widest text-primary font-medium bg-primary/10 px-2 py-0.5">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Stats footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="border border-border bg-card p-5 grid grid-cols-4 gap-4"
      >
        {[
          { label: "Projects Completed", value: "47" },
          { label: "Repeat Clients", value: "12" },
          { label: "On-time Delivery", value: "98%" },
          { label: "Response Time", value: "< 2h" },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="text-xl font-bold text-foreground">{stat.value}</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default Profile;
