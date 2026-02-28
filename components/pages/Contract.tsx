"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Send,
  Search,
  MoreVertical,
  Plus,
  Download,
  CheckCircle,
  FileText,
  Code,
  Cpu,
} from "lucide-react";

const chatMessages = [
  {
    role: "customer",
    label: "CUSTOMER_AI_AGENT",
    time: "14:20",
    content:
      "System requirement: Please provide the final audit report for the ERC-20 staking logic. Ensure all medium-to-high severity findings are addressed in the re-test summary.",
  },
  {
    role: "freelancer",
    label: "LEAD_AUDITOR",
    time: "14:45",
    content:
      "Understood. I have completed the final verification of the security patches. High-severity issues H-01 and H-02 are now mitigated. Delivery package uploaded to the contract panel.",
    delivery: "New Delivery: Audit_Report_v2.0_Final.pdf",
  },
  {
    role: "customer",
    label: "CUSTOMER_AI_AGENT",
    time: "15:02",
    content:
      "Automated verification running on IPFS CID: QmXoyp...76Xz. Hash matches. Final code review shows zero critical vulnerabilities remaining. Awaiting human confirmation for fund release.",
  },
];

const Contract = () => {
  const [message, setMessage] = useState("");

  return (
    <div className="flex h-full">
      {/* Chat Panel */}
      <div className="flex-1 flex flex-col border-r border-border">
        {/* Chat Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">
                Communication Channel
              </h2>
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest font-medium border border-success/30 text-success px-2 py-0.5">
                <span className="size-1.5 bg-success rounded-full animate-pulse-slow" />
                Live
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Contract #SC-402-AUDIT — Multi-Signature Escrow
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="size-9 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground">
              <Search className="size-4" />
            </button>
            <button className="size-9 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground">
              <MoreVertical className="size-4" />
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <p className="text-center text-[10px] uppercase tracking-widest text-muted-foreground">
            Contract Commenced Oct 24, 2023
          </p>

          {chatMessages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`flex gap-3 ${
                msg.role === "freelancer" ? "justify-end" : ""
              }`}
            >
              {msg.role === "customer" && (
                <div className="size-8 bg-secondary flex items-center justify-center flex-shrink-0 mt-1">
                  <Cpu className="size-4 text-muted-foreground" />
                </div>
              )}
              <div
                className={`max-w-md space-y-2 ${
                  msg.role === "freelancer" ? "items-end flex flex-col" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  {msg.role === "freelancer" && (
                    <span className="text-[10px] text-muted-foreground">
                      {msg.time}
                    </span>
                  )}
                  <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                    {msg.label}
                  </span>
                  {msg.role === "customer" && (
                    <span className="text-[10px] text-muted-foreground">
                      {msg.time}
                    </span>
                  )}
                </div>
                <div
                  className={`p-4 text-sm leading-relaxed ${
                    msg.role === "freelancer"
                      ? "bg-primary/15 border border-primary/30 text-foreground"
                      : "bg-card border border-border text-foreground"
                  }`}
                >
                  {msg.content}
                </div>
                {msg.delivery && (
                  <div className="inline-flex items-center gap-1.5 bg-primary/20 text-primary text-[10px] uppercase tracking-widest font-medium px-3 py-1.5">
                    <FileText className="size-3" />
                    {msg.delivery}
                  </div>
                )}
              </div>
              {msg.role === "freelancer" && (
                <div className="size-8 bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-xs font-bold text-primary">A</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Chat Input */}
        <div className="px-6 py-4 border-t border-border">
          <div className="flex items-center gap-3">
            <button className="size-9 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground">
              <Plus className="size-4" />
            </button>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message or use / for AI commands..."
              className="flex-1 bg-card border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
            />
            <button className="size-9 bg-primary flex items-center justify-center text-primary-foreground hover:opacity-90">
              <Send className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Delivery Panel */}
      <div className="w-[480px] flex-shrink-0 overflow-y-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">
            Contract Delivery
          </h2>
          <span className="border border-success/30 text-success text-[10px] uppercase tracking-widest font-bold px-3 py-1">
            Pending Approval
          </span>
        </div>

        {/* Milestone Summary */}
        <div className="border border-border bg-card p-5 space-y-3">
          <p className="text-[10px] uppercase tracking-widest text-primary font-bold">
            Milestone Summary
          </p>
          <h3 className="text-lg font-bold text-foreground">
            Final Security Audit & Patch Verification
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Professional audit of core staking contracts including gas
            optimization and vulnerability analysis. This delivery fulfills the
            final 50% of the total contract value.
          </p>
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-sm font-semibold text-foreground">
              Delivery Value
            </span>
            <span className="text-lg font-bold text-success">2.45 ETH</span>
          </div>
        </div>

        {/* Attached Assets */}
        <div className="space-y-3">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
            Attached Assets
          </p>
          {[
            {
              name: "Audit_Report_v2.0_Final.pdf",
              size: "1.2 MB",
              verified: "IPFS Verified",
              icon: FileText,
            },
            {
              name: "patch_deployment_logs.json",
              size: "45 KB",
              verified: "On-chain Hash",
              icon: Code,
            },
          ].map((file) => (
            <div
              key={file.name}
              className="border border-border bg-card p-4 flex items-center gap-3"
            >
              <div className="size-10 bg-primary/10 flex items-center justify-center">
                <file.icon className="size-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  {file.name}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {file.size} • {file.verified}
                </p>
              </div>
              <button className="text-muted-foreground hover:text-foreground">
                <Download className="size-4" />
              </button>
            </div>
          ))}
        </div>

        {/* On-chain Evidence */}
        <div className="space-y-3">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
            On-Chain Evidence
          </p>
          <div className="border border-border bg-card p-4 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Escrow Address
                </p>
                <p className="text-xs font-mono text-foreground mt-1">
                  0x9a2...fe82
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Network
                </p>
                <p className="text-xs text-foreground mt-1">Ethereum Mainnet</p>
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                IPFS Content Identifier (CID)
              </p>
              <p className="text-xs font-mono text-foreground mt-1 break-all">
                QmXoypMjTsLE6F2B8M2qE2H7GfN7E9R3G8G76Xz
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button className="w-full bg-primary text-primary-foreground py-3.5 text-sm font-bold uppercase tracking-wide flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
            <CheckCircle className="size-4" />
            Confirm & Release Funds
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button className="border border-border text-foreground py-2.5 text-xs font-bold uppercase tracking-wide hover:bg-accent transition-colors">
              Request Revision
            </button>
            <button className="border border-destructive/30 text-destructive py-2.5 text-xs font-bold uppercase tracking-wide hover:bg-destructive/10 transition-colors">
              Open Dispute
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center">
            By releasing funds, you confirm the work matches the agreed specifications.
            This action is recorded on-chain and is irreversible.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Contract;
