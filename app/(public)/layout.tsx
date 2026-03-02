import Link from "next/link";
import { Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 text-foreground">
            <div className="flex size-9 items-center justify-center bg-primary">
              <Briefcase className="size-4 text-primary-foreground" />
            </div>
            <span className="font-semibold uppercase tracking-tight">MHR</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/gigs">Browse Gigs</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/auth">Sign In</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
