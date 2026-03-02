import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  Wallet,
  UserCircle,
  Search,
  Shield,
  LogIn,
} from "lucide-react";

export interface NavItem {
  label: string;
  path: string;
  icon?: LucideIcon;
}

/** Full nav items for sidebar and mobile drawer (with icons). */
export const navItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Workspaces", icon: Briefcase, path: "/workspaces" },
  { label: "Talent Pool", icon: Users, path: "/register" },
  { label: "Find Talent", icon: Search, path: "/hire" },
  { label: "Active Contracts", icon: FileText, path: "/contract" },
  { label: "Payments", icon: Wallet, path: "/funding" },
  { label: "My Profile", icon: UserCircle, path: "/profile" },
  { label: "Verification", icon: Shield, path: "/verification" },
];

/** Top bar nav links (label + path only). Order matches TopBar design. */
export const navLinks: { label: string; path: string }[] = [
  { label: "Dashboard", path: "/" },
  { label: "Browse Gigs", path: "/gigs" },
  { label: "Talent Pool", path: "/register" },
  { label: "Find Talent", path: "/hire" },
  { label: "Workspaces", path: "/workspaces" },
  { label: "Contracts", path: "/contract" },
  { label: "Payments", path: "/funding" },
  { label: "Profile", path: "/profile" },
];

/** Sign In link for sidebar footer and mobile drawer. */
export const signInNavItem: NavItem = {
  label: "Sign In",
  icon: LogIn,
  path: "/auth",
};
