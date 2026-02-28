"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, X } from "lucide-react";
import { navItems, signInNavItem } from "@/lib/nav";

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const pathname = usePathname();
  const allItems = [...navItems, signInNavItem];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 bottom-0 w-72 bg-background border-r border-border z-50 flex flex-col"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <div className="size-8 bg-primary flex items-center justify-center">
                    <Briefcase className="size-4 text-primary-foreground" />
                  </div>
                  <div className="flex flex-col">
                    <h1 className="text-foreground text-sm font-bold tracking-tight uppercase">
                      Aigent Flow
                    </h1>
                    <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-widest">
                      Workspace v1.0
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="size-5" />
                </button>
              </div>

              <nav className="flex flex-col gap-1">
                {allItems.map((item) => {
                  const isActive = pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive
                          ? "text-primary border-l-2 border-primary bg-accent"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {Icon && <Icon className="size-4" />}
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="mt-auto p-6 space-y-3">
              <div className="border border-border p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  System Health
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="size-2 bg-success rounded-full" />
                  <span className="text-xs font-medium text-foreground uppercase">
                    All Nodes Operational
                  </span>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
