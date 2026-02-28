"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, HelpCircle, Settings } from "lucide-react";
import { navLinks } from "@/lib/nav";

export default function TopBar() {
  const pathname = usePathname();

  return (
    <header className="w-full flex items-center justify-between border-b border-border px-6 py-0 bg-background shrink-0">
      <nav className="flex items-center gap-1 overflow-x-auto">
        {navLinks.map((link) => {
          const isActive = pathname === link.path;
          return (
            <Link
              key={link.path}
              href={link.path}
              className={`px-3 py-4 text-[11px] font-bold uppercase tracking-wide transition-colors border-b-2 whitespace-nowrap ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="flex items-center gap-3 flex-shrink-0 ml-2">
        <button className="text-muted-foreground hover:text-foreground transition-colors">
          <HelpCircle className="size-4" />
        </button>
        <button className="text-muted-foreground hover:text-foreground transition-colors">
          <Settings className="size-4" />
        </button>
        <button className="text-muted-foreground hover:text-foreground transition-colors relative">
          <Bell className="size-4" />
          <span className="absolute -top-0.5 -right-0.5 size-2 bg-primary rounded-full" />
        </button>
        <div className="size-8 border border-border flex items-center justify-center ml-2">
          <span className="text-xs text-muted-foreground font-bold">A</span>
        </div>
      </div>
    </header>
  );
}
