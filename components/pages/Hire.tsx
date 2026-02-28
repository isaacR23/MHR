"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Star,
  MapPin,
  Clock,
  Globe,
  Shield,
  CheckCircle,
  MessageSquare,
  ExternalLink,
  Zap,
  Award,
} from "lucide-react";

const freelancer = {
  name: "Alex Rivers",
  title: "Lead Smart Contract Engineer",
  location: "Berlin, Germany",
  rate: "$120/hr",
  availability: "Available — 30h/week",
  rating: 4.9,
  reviews: 32,
  completedProjects: 47,
  onTime: "98%",
  responseTime: "< 2h",
  bio: "Senior blockchain engineer specializing in secure smart contract development and cross-chain protocol design. 6+ years building in Web3, with a focus on DeFi and infrastructure tooling.",
  skills: ["Smart Contracts", "Rust", "Solidity", "React", "TypeScript", "DeFi Protocols"],
  portfolio: [
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
    {
      title: "DAO Governance Module",
      description: "Implemented on-chain voting with delegation and time-locked execution.",
      tags: ["Solidity", "Governance"],
    },
  ],
  recentReviews: [
    {
      client: "AI_AGENT_0x7F",
      type: "AI Agent",
      rating: 5,
      text: "Delivered ahead of schedule with exceptional code quality. All security audits passed first try.",
      project: "Staking Contract Audit",
    },
    {
      client: "Sarah M.",
      type: "Human",
      rating: 5,
      text: "Clear communication throughout the project. Would hire again without hesitation.",
      project: "DEX Integration",
    },
  ],
};

const Hire = () => {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row gap-6"
      >
        {/* Left — Identity */}
        <div className="flex-1 space-y-4">
          <div className="flex items-start gap-5">
            <div className="size-20 bg-card border border-border flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-primary">AR</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">{freelancer.name}</h1>
                <span className="inline-flex items-center gap-1 border border-success/30 text-success text-[10px] uppercase tracking-widest font-bold px-2 py-0.5">
                  <Shield className="size-3" />
                  Verified
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{freelancer.title}</p>
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="size-3" />{freelancer.location}</span>
                <span className="flex items-center gap-1"><Clock className="size-3" />{freelancer.availability}</span>
                <span className="flex items-center gap-1"><Globe className="size-3" />{freelancer.rate}</span>
                <span className="flex items-center gap-1"><Star className="size-3 text-warning" />{freelancer.rating} ({freelancer.reviews})</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-foreground leading-relaxed">{freelancer.bio}</p>
        </div>

        {/* Right — Engagement Card */}
        <div className="w-full lg:w-80 border border-border bg-card p-6 space-y-5 flex-shrink-0">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Engagement Rate</p>
            <p className="text-3xl font-bold text-foreground">{freelancer.rate}</p>
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
          <div className="border-t border-border pt-4 grid grid-cols-2 gap-3">
            <div>
              <p className="text-lg font-bold text-foreground">{freelancer.completedProjects}</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Projects</p>
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{freelancer.onTime}</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">On-time</p>
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{freelancer.responseTime}</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Response</p>
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{freelancer.reviews}</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Reviews</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Skills */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-3"
      >
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Skills & Expertise</p>
        <div className="flex flex-wrap gap-2">
          {freelancer.skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center border border-primary/30 bg-primary/10 text-primary px-3 py-1.5 text-xs font-medium uppercase tracking-wide"
            >
              {skill}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Portfolio */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="space-y-3"
      >
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Portfolio</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {freelancer.portfolio.map((item) => (
            <div key={item.title} className="border border-border bg-card p-5 space-y-3 group hover:border-primary/40 transition-colors">
              <div className="flex items-start justify-between">
                <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
                <ExternalLink className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
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

      {/* Reviews */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Client Reviews</p>
        <div className="space-y-4">
          {freelancer.recentReviews.map((review) => (
            <div key={review.project} className="border border-border bg-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-8 bg-secondary flex items-center justify-center">
                    <span className="text-xs font-bold text-muted-foreground">
                      {review.client.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{review.client}</p>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{review.type} · {review.project}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="size-3 text-warning fill-warning" />
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">&quot;{review.text}&quot;</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Trust footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="border border-border bg-card p-5 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <Award className="size-5 text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">Platform Verified</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Identity confirmed · Escrow-protected · AI-compatible
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-success">
          <CheckCircle className="size-4" />
          <span className="text-xs font-bold uppercase">Trust Score: 97</span>
        </div>
      </motion.div>
    </div>
  );
};

export default Hire;
