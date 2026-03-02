import { Suspense } from "react";
import Auth from "@/components/pages/Auth";

function AuthFallback() {
  return (
    <div className="dark min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-muted-foreground text-sm uppercase tracking-widest">
        Loading…
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthFallback />}>
      <Auth />
    </Suspense>
  );
}
