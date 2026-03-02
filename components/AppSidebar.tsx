"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, LogIn, UserPlus, LogOut } from "lucide-react";
import { navItems, signInNavItem } from "@/lib/nav";
import { useAuth } from "@/components/providers/AuthProvider";

export default function AppSidebar() {
  const pathname = usePathname();
  const { isLoggedIn, userEmail, logout, isLoading } = useAuth();
  const SignInIcon = signInNavItem.icon;

  return (
    <aside className="w-64 flex-shrink-0 border-r border-border bg-background flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-10">
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

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
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
        {!isLoading && (
          <>
            {isLoggedIn ? (
              <div className="space-y-2">
                <div className="border border-border p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Connected
                  </p>
                  <p className="text-xs font-medium text-foreground truncate mt-1" title={userEmail ?? undefined}>
                    {userEmail ?? "—"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="flex items-center justify-center gap-2 w-full border border-border text-foreground py-2.5 text-sm font-bold uppercase tracking-wide hover:bg-accent transition-colors"
                >
                  <LogOut className="size-4" />
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/auth?mode=signin"
                  className="flex items-center justify-center gap-2 w-full border border-border text-foreground py-2.5 text-sm font-bold uppercase tracking-wide hover:bg-accent transition-colors"
                >
                  {SignInIcon && <SignInIcon className="size-4" />}
                  Sign In
                </Link>
                <Link
                  href="/auth?mode=signup"
                  className="flex items-center justify-center gap-2 w-full border border-border text-foreground py-2.5 text-sm font-bold uppercase tracking-wide hover:bg-accent transition-colors"
                >
                  <UserPlus className="size-4" />
                  Sign Up
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
