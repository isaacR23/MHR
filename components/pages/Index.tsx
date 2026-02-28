"use client";

import { motion } from "framer-motion";
import { TrendingUp, Zap, Monitor } from "lucide-react";
import Link from "next/link";

const stats = [
  {
    label: "Available Balance",
    value: "$12,450.00",
    sub: "12% Increase",
    subColor: "text-success",
    icon: Monitor,
  },
  {
    label: "Active Tasks",
    value: "08",
    sub: "3 Humans · 5 AI Agents",
    icon: Zap,
  },
  {
    label: "Network Status",
    value: "Optimal",
    sub: "Latency: 14ms",
    icon: Monitor,
  },
];

const projects = [
  {
    name: "Neural Interface Designer",
    type: "Autonomous AI Agent",
    status: "Processing",
    statusColor: "bg-primary",
    progress: 65,
    uptime: "14d 08h 12m",
    budget: "$3,200.00",
  },
  {
    name: "Alex Rivers",
    type: "Human Lead Architect",
    status: "Active",
    statusColor: "bg-success",
    progress: 45,
    uptime: "45d 02h 44m",
    budget: "$5,800.00",
  },
  {
    name: "Data Scraper v4",
    type: "Utility Script Agent",
    status: "Idle",
    statusColor: "bg-muted-foreground",
    progress: 20,
    uptime: "0d 14h 05m",
    budget: "$450.00",
  },
];

const Index = () => {
  return (
    <div className="p-8 space-y-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col lg:flex-row gap-8 items-start"
      >
        <div className="flex-1 space-y-6">
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-foreground">
            Effortless Workflows{" "}
            <span className="text-primary">for the Future.</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-lg">
            A minimalist platform for human and AI collaboration. Hire, manage,
            and scale your workforce with sharp geometric precision.
          </p>
          <div className="flex gap-4">
            <Link
              href="/register"
              className="bg-primary text-primary-foreground px-6 py-3 text-sm font-bold uppercase tracking-wide hover:opacity-90 transition-opacity"
            >
              Get Started
            </Link>
            <button className="border border-border text-foreground px-6 py-3 text-sm font-bold uppercase tracking-wide hover:bg-accent transition-colors">
              Documentation
            </button>
          </div>
        </div>
        <div className="w-full lg:w-96 h-56 border border-border bg-card flex items-end p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Monitor className="size-4 text-primary" />
            <span className="text-[10px] uppercase tracking-widest font-medium">
              Live Node Visualization
            </span>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="border border-border bg-card p-5 space-y-2"
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                {stat.label}
              </p>
              <stat.icon className="size-4 text-muted-foreground" />
            </div>
            <p className="text-3xl font-bold text-foreground">{stat.value}</p>
            <p className={`text-xs font-medium ${stat.subColor || "text-muted-foreground"}`}>
              {stat.sub}
            </p>
          </div>
        ))}
      </motion.div>

      {/* Active Workspace */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold uppercase tracking-wide text-foreground">
            Active Workspace
          </h2>
        </div>
        <div className="border border-border bg-card">
          <div className="grid grid-cols-5 gap-4 px-5 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-medium border-b border-border">
            <span>Project / Agent</span>
            <span>Status</span>
            <span>Progress</span>
            <span>Uptime</span>
            <span className="text-right">Budget</span>
          </div>
          {projects.map((project) => (
            <div
              key={project.name}
              className="grid grid-cols-5 gap-4 px-5 py-4 items-center border-b border-border last:border-b-0 hover:bg-accent/50 transition-colors"
            >
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {project.name}
                </p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {project.type}
                </p>
              </div>
              <div>
                <span
                  className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-medium text-foreground`}
                >
                  <span className={`size-1.5 ${project.statusColor}`} />
                  {project.status}
                </span>
              </div>
              <div>
                <div className="w-full h-1 bg-secondary">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{project.uptime}</p>
              <p className="text-sm font-semibold text-foreground text-right">
                {project.budget}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Index;
