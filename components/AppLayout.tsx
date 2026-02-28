"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import AppSidebar from "./AppSidebar";
import TopBar from "./TopBar";
import MobileDrawer from "./MobileDrawer";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="dark flex h-screen overflow-hidden bg-background text-foreground">
      {/* Desktop only: sidebar */}
      <div className="hidden lg:flex">
        <AppSidebar />
      </div>

      <div className="flex flex-col flex-1 overflow-hidden bg-background">
        {/* Mobile only: hamburger header */}
        <header className="flex lg:hidden md:hidden items-center px-4 py-3 border-b border-border bg-background shrink-0">
          <button
            onClick={() => setDrawerOpen(true)}
            className="text-foreground hover:text-primary transition-colors p-1"
          >
            <Menu className="size-6" />
          </button>
          <div className="ml-3 flex items-center gap-2">
            <div className="size-6 bg-primary flex items-center justify-center">
              <span className="text-[10px] font-bold text-primary-foreground">AF</span>
            </div>
            <span className="text-sm font-bold uppercase tracking-tight text-foreground">
              Aigent Flow
            </span>
          </div>
        </header>

        {/* Tablet only: top bar */}
        <div className="hidden md:flex lg:hidden">
          <TopBar />
        </div>

        <main className="flex-1 overflow-y-auto bg-background">
          {children}
        </main>
      </div>

      {/* Mobile drawer */}
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
