"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Clock,
  StickyNote,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Briefcase,
} from "lucide-react";

interface Note {
  id: string;
  text: string;
  timestamp: string;
}

interface Contract {
  id: string;
  title: string;
  client: string;
  clientType: "Human" | "AI Agent";
  status: "Active" | "In Review" | "Pending Start";
  statusColor: string;
  value: string;
  deadline: string;
  progress: number;
  milestone: string;
  notes: Note[];
}

const initialContracts: Contract[] = [
  {
    id: "SC-402",
    title: "Smart Contract Security Audit",
    client: "AI_AGENT_0x7F",
    clientType: "AI Agent",
    status: "Active",
    statusColor: "bg-success",
    value: "$4,800",
    deadline: "Mar 15, 2026",
    progress: 65,
    milestone: "Final patch verification in progress",
    notes: [
      {
        id: "n1",
        text: "H-01 and H-02 vulnerabilities patched. Awaiting re-test confirmation from client agent.",
        timestamp: "Feb 24, 2026 · 14:30",
      },
      {
        id: "n2",
        text: "Gas optimization complete — reduced deployment cost by 18%.",
        timestamp: "Feb 22, 2026 · 09:15",
      },
    ],
  },
  {
    id: "SC-389",
    title: "DEX Integration & Liquidity Module",
    client: "Sarah M.",
    clientType: "Human",
    status: "Active",
    statusColor: "bg-success",
    value: "$7,200",
    deadline: "Apr 02, 2026",
    progress: 40,
    milestone: "Core swap logic implemented, working on slippage protection",
    notes: [
      {
        id: "n3",
        text: "Client requested support for 3 additional token pairs. Adjusting scope.",
        timestamp: "Feb 25, 2026 · 11:00",
      },
    ],
  },
  {
    id: "SC-415",
    title: "DAO Governance Voting Module",
    client: "GOVERNANCE_BOT_v2",
    clientType: "AI Agent",
    status: "In Review",
    statusColor: "bg-warning",
    value: "$3,400",
    deadline: "Feb 28, 2026",
    progress: 90,
    milestone: "Delegation logic submitted for review",
    notes: [],
  },
  {
    id: "SC-420",
    title: "Cross-Chain Bridge Monitoring",
    client: "BlockOps Inc.",
    clientType: "Human",
    status: "Pending Start",
    statusColor: "bg-muted-foreground",
    value: "$5,500",
    deadline: "Mar 20, 2026",
    progress: 0,
    milestone: "Awaiting kickoff meeting",
    notes: [],
  },
];

const Workspaces = () => {
  const [contracts, setContracts] = useState<Contract[]>(initialContracts);
  const [expandedId, setExpandedId] = useState<string | null>("SC-402");
  const [newNoteTexts, setNewNoteTexts] = useState<Record<string, string>>({});

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const addNote = (contractId: string) => {
    const text = newNoteTexts[contractId]?.trim();
    if (!text) return;

    setContracts((prev) =>
      prev.map((c) =>
        c.id === contractId
          ? {
              ...c,
              notes: [
                {
                  id: `n-${Date.now()}`,
                  text,
                  timestamp: new Date().toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }) + " · " + new Date().toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                },
                ...c.notes,
              ],
            }
          : c
      )
    );
    setNewNoteTexts((prev) => ({ ...prev, [contractId]: "" }));
  };

  const deleteNote = (contractId: string, noteId: string) => {
    setContracts((prev) =>
      prev.map((c) =>
        c.id === contractId
          ? { ...c, notes: c.notes.filter((n) => n.id !== noteId) }
          : c
      )
    );
  };

  const activeCount = contracts.filter((c) => c.status === "Active").length;
  const totalValue = contracts.reduce((sum, c) => {
    const num = parseFloat(c.value.replace(/[$,]/g, ""));
    return sum + num;
  }, 0);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Briefcase className="size-5 text-primary" />
            <p className="text-[10px] uppercase tracking-widest text-primary font-bold">
              Freelancer Workspace
            </p>
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Active Engagements
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg">
            Track your contracts, milestones, and personal notes — all in one
            place.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="border border-border bg-card px-5 py-3 text-center">
            <p className="text-2xl font-bold text-foreground">{activeCount}</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Active
            </p>
          </div>
          <div className="border border-border bg-card px-5 py-3 text-center">
            <p className="text-2xl font-bold text-foreground">{contracts.length}</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Total
            </p>
          </div>
          <div className="border border-border bg-card px-5 py-3 text-center">
            <p className="text-2xl font-bold text-success">
              ${totalValue.toLocaleString()}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Pipeline
            </p>
          </div>
        </div>
      </motion.div>

      {/* Contract List */}
      <div className="space-y-4">
        {contracts.map((contract, i) => {
          const isExpanded = expandedId === contract.id;
          return (
            <motion.div
              key={contract.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="border border-border bg-card"
            >
              {/* Contract Header Row */}
              <button
                onClick={() => toggleExpand(contract.id)}
                className="w-full flex items-center gap-4 px-6 py-5 text-left hover:bg-accent/30 transition-colors"
              >
                <div className="text-muted-foreground">
                  {isExpanded ? (
                    <ChevronDown className="size-4" />
                  ) : (
                    <ChevronRight className="size-4" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-bold text-foreground truncate">
                      {contract.title}
                    </h3>
                    <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-medium text-foreground">
                      <span className={`size-1.5 ${contract.statusColor}`} />
                      {contract.status}
                    </span>
                  </div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                    {contract.id} · {contract.client} · {contract.clientType}
                  </p>
                </div>

                <div className="hidden md:flex items-center gap-6 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">
                      {contract.value}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                      Value
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      {contract.deadline}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                      Deadline
                    </p>
                  </div>
                  <div className="w-24">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                        Progress
                      </span>
                      <span className="text-xs font-bold text-foreground">
                        {contract.progress}%
                      </span>
                    </div>
                    <div className="h-1 bg-secondary w-full">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${contract.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="border-t border-border"
                >
                  {/* Milestone */}
                  <div className="px-6 py-4 border-b border-border bg-accent/20">
                    <div className="flex items-center gap-2">
                      {contract.status === "In Review" ? (
                        <AlertCircle className="size-4 text-warning" />
                      ) : contract.status === "Active" ? (
                        <CheckCircle className="size-4 text-success" />
                      ) : (
                        <Clock className="size-4 text-muted-foreground" />
                      )}
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                        Current Milestone
                      </p>
                    </div>
                    <p className="text-sm text-foreground mt-1">
                      {contract.milestone}
                    </p>
                  </div>

                  {/* Notes Section */}
                  <div className="px-6 py-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <StickyNote className="size-4 text-primary" />
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                        Personal Notes ({contract.notes.length})
                      </p>
                    </div>

                    {/* Add Note */}
                    <div className="flex gap-2">
                      <input
                        value={newNoteTexts[contract.id] || ""}
                        onChange={(e) =>
                          setNewNoteTexts((prev) => ({
                            ...prev,
                            [contract.id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) =>
                          e.key === "Enter" && addNote(contract.id)
                        }
                        placeholder="Add a note to this engagement..."
                        className="flex-1 bg-background border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                      />
                      <button
                        onClick={() => addNote(contract.id)}
                        className="bg-primary text-primary-foreground px-4 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wide hover:opacity-90 transition-opacity"
                      >
                        <Plus className="size-3.5" />
                        Add
                      </button>
                    </div>

                    {/* Notes List */}
                    {contract.notes.length > 0 ? (
                      <div className="space-y-2">
                        {contract.notes.map((note) => (
                          <div
                            key={note.id}
                            className="flex items-start gap-3 border border-border bg-background p-4 group"
                          >
                            <FileText className="size-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-foreground leading-relaxed">
                                {note.text}
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-1.5 uppercase tracking-widest">
                                {note.timestamp}
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                deleteNote(contract.id, note.id)
                              }
                              className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic py-2">
                        No notes yet. Add your first note above.
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Workspaces;
