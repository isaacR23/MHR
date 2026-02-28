"use client";

import { motion } from "framer-motion";
import { Lock, TrendingUp, Download, Plus, Shield, CheckCircle, Clock } from "lucide-react";

const transactions = [
  {
    name: "Neural Network Optimization",
    id: "TX-99281-Escrow",
    category: "Project Funding",
    status: "Secured",
    statusIcon: Shield,
    statusColor: "text-primary",
    amount: "-$12,400.00",
    amountColor: "text-foreground",
  },
  {
    name: "Payout: UI/UX Component Audit",
    id: "TX-88210-Direct",
    category: "Payouts",
    status: "Released",
    statusIcon: CheckCircle,
    statusColor: "text-success",
    amount: "-$3,200.00",
    amountColor: "text-foreground",
  },
  {
    name: "Capital Injection - Automated",
    id: "TX-77312-Inflow",
    category: "Add Funds",
    status: "Processing",
    statusIcon: Clock,
    statusColor: "text-muted-foreground",
    amount: "+$5,000.00",
    amountColor: "text-success",
  },
  {
    name: "Vector Search Indexing Service",
    id: "TX-66104-Escrow",
    category: "Project Funding",
    status: "Secured",
    statusIcon: Shield,
    statusColor: "text-primary",
    amount: "-$1,850.00",
    amountColor: "text-foreground",
  },
];

const Funding = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-foreground">Financial Overview</h1>
        <p className="text-muted-foreground mt-2 max-w-lg">
          Unified capital management for autonomous and human work cycles.
          Seamlessly fund projects and manage liquidity.
        </p>
      </motion.div>

      {/* Balance Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="border border-border bg-card p-6 space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Lock className="size-4" />
            <span className="text-[10px] uppercase tracking-widest font-medium">
              Available Capital
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-foreground">$42,850</span>
            <span className="text-lg text-muted-foreground">.00</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="size-3 text-success" />
            <span className="text-xs font-medium text-success">
              +12.5% from last month
            </span>
          </div>
        </div>
        <div className="border border-border bg-card p-6 space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Lock className="size-4" />
            <span className="text-[10px] uppercase tracking-widest font-medium">
              Secured in Escrow
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-foreground">$18,200</span>
            <span className="text-lg text-muted-foreground">.50</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Committed to 4 active projects
          </p>
        </div>
      </motion.div>

      {/* Funding Gateway */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <h2 className="text-lg font-bold text-foreground">Funding Gateway</h2>
        <div className="border border-border bg-card p-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                Amount (USD)
              </label>
              <div className="flex items-center bg-background border border-border px-4 py-3">
                <span className="text-muted-foreground text-sm mr-2">$</span>
                <input
                  type="text"
                  placeholder="0.00"
                  className="bg-transparent text-sm text-foreground outline-none flex-1"
                />
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                Funding Source
              </label>
              <select className="w-full bg-background border border-border px-4 py-3 text-sm text-foreground outline-none appearance-none">
                <option>Bank Account (**** 4291)</option>
                <option>Wire Transfer</option>
              </select>
            </div>
            <button className="bg-primary text-primary-foreground px-6 py-3 text-xs font-bold uppercase tracking-wide hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap">
              <Plus className="size-4" />
              Add Capital
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-3 italic">
            Infrastructure abstraction active. Assets are automatically converted and secured via smart contract protocol.
          </p>
        </div>
      </motion.div>

      {/* Transaction Ledger */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">
            Transaction Ledger
          </h2>
          <button className="flex items-center gap-1.5 text-primary text-xs font-medium hover:opacity-80">
            Download Report
            <Download className="size-3" />
          </button>
        </div>
        <div className="border border-border bg-card">
          <div className="grid grid-cols-4 gap-4 px-5 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-medium border-b border-border">
            <span>Transaction Details</span>
            <span>Category</span>
            <span>Status</span>
            <span className="text-right">Amount</span>
          </div>
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="grid grid-cols-4 gap-4 px-5 py-4 items-center border-b border-border last:border-b-0"
            >
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {tx.name}
                </p>
                <p className="text-[10px] text-muted-foreground">ID: {tx.id}</p>
              </div>
              <span className="text-xs border border-border px-2 py-1 w-fit text-muted-foreground">
                {tx.category}
              </span>
              <div className="flex items-center gap-1.5">
                <tx.statusIcon className={`size-3.5 ${tx.statusColor}`} />
                <span className={`text-xs font-medium ${tx.statusColor} uppercase`}>
                  {tx.status}
                </span>
              </div>
              <p className={`text-sm font-semibold text-right ${tx.amountColor}`}>
                {tx.amount}
              </p>
            </div>
          ))}
          <div className="px-5 py-3 text-center">
            <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              View All Transactions
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Funding;
