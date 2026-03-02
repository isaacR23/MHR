"use client";

import { useState } from "react";
import Image from "next/image";
import { Menu } from "lucide-react";
import AppSidebar from "./AppSidebar";
import TopBar from "./TopBar";
import MobileDrawer from "./MobileDrawer";

const APP_NAME = "Aigent Flow";

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
            <Image
              src="/icon.svg"
              alt={APP_NAME}
              width={24}
              height={24}
              className="size-6 shrink-0"
            />
            <span className="text-sm font-bold uppercase tracking-tight text-foreground">
              {APP_NAME}
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
