"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  Github,
  Chrome,
} from "lucide-react";

const Auth = () => {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);

  // Sign in fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Sign up fields (all optional)
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder — will integrate with backend
    console.log("Sign in:", { email, password });
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder — will integrate with backend
    console.log("Sign up:", { displayName, signupEmail, signupPassword });
  };

  return (
    <div className="dark min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-8"
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="size-12 bg-primary flex items-center justify-center">
            <Briefcase className="size-6 text-primary-foreground" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground uppercase tracking-tight">
              Aigent Flow
            </h1>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
              {mode === "signin"
                ? "Welcome back"
                : "Join the network"}
            </p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex border border-border">
          <button
            onClick={() => setMode("signin")}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wide transition-colors ${
              mode === "signin"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wide transition-colors ${
              mode === "signup"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Social Login */}
        <div className="space-y-3">
          <button className="w-full flex items-center justify-center gap-3 border border-border py-3 text-sm font-medium text-foreground hover:bg-accent transition-colors">
            <Chrome className="size-4" />
            Continue with Google
          </button>
          <button className="w-full flex items-center justify-center gap-3 border border-border py-3 text-sm font-medium text-foreground hover:bg-accent transition-colors">
            <Github className="size-4" />
            Continue with GitHub
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
            or
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Sign In Form */}
        {mode === "signin" && (
          <motion.form
            key="signin"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onSubmit={handleSignIn}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                Email
              </label>
              <div className="flex items-center border border-border bg-card">
                <Mail className="size-4 text-muted-foreground ml-4" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="flex-1 bg-transparent px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                Password
              </label>
              <div className="flex items-center border border-border bg-card">
                <Lock className="size-4 text-muted-foreground ml-4" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="flex-1 bg-transparent px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="pr-4 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="text-xs text-primary hover:opacity-80 transition-opacity"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-3.5 text-sm font-bold uppercase tracking-wide flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              Sign In
              <ArrowRight className="size-4" />
            </button>
          </motion.form>
        )}

        {/* Sign Up Form — no required fields */}
        {mode === "signup" && (
          <motion.form
            key="signup"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onSubmit={handleSignUp}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                Display Name{" "}
                <span className="text-muted-foreground/60">— optional</span>
              </label>
              <div className="flex items-center border border-border bg-card">
                <User className="size-4 text-muted-foreground ml-4" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="How should we call you?"
                  className="flex-1 bg-transparent px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                Email{" "}
                <span className="text-muted-foreground/60">— optional</span>
              </label>
              <div className="flex items-center border border-border bg-card">
                <Mail className="size-4 text-muted-foreground ml-4" />
                <input
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="flex-1 bg-transparent px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                Password{" "}
                <span className="text-muted-foreground/60">— optional</span>
              </label>
              <div className="flex items-center border border-border bg-card">
                <Lock className="size-4 text-muted-foreground ml-4" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="Create a password"
                  className="flex-1 bg-transparent px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="pr-4 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground leading-relaxed">
              All fields are optional. You can complete your profile later.
              By signing up you agree to our Terms of Service.
            </p>

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-3.5 text-sm font-bold uppercase tracking-wide flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              Create Account
              <ArrowRight className="size-4" />
            </button>
          </motion.form>
        )}

        {/* Footer */}
        <p className="text-center text-[10px] text-muted-foreground uppercase tracking-widest">
          Secured by on-chain identity protocols
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
