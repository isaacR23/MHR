"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Plus, Shield, Cpu } from "lucide-react";

const steps = ["Identity", "Skills", "Payout"];

const Register = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [skills, setSkills] = useState(["Smart Contracts", "Rust", "Solidity"]);
  const [newSkill, setNewSkill] = useState("");

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
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

      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-8"
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
                    defaultValue="85.00"
                    className="bg-transparent text-sm text-foreground outline-none flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                  Settlement Frequency
                </label>
                <select className="w-full bg-card border border-border px-4 py-3 text-sm text-foreground outline-none focus:border-primary appearance-none">
                  <option>Real-time / Per block</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
              </div>
            </div>
          </>
        )}
      </motion.div>

      {/* Actions */}
      <div className="border-t border-border pt-6 flex items-center justify-between">
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          className="border border-border text-foreground px-6 py-3 text-xs font-bold uppercase tracking-wide hover:bg-accent transition-colors"
        >
          {currentStep === 0 ? "Cancel" : "Back"}
        </button>
        <button
          onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
          className="bg-primary text-primary-foreground px-8 py-3 text-xs font-bold uppercase tracking-wide hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          {currentStep === steps.length - 1 ? "Submit" : "Commit & Continue →"}
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
            <p className="text-xs font-bold text-primary">0x4F...B2</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
