import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { SiteNav, SiteFooter } from "@/components/SiteNav";

/**
 * Wrap any admin-only route's component in this. Renders nothing (past a
 * loading state) until we've confirmed the current user actually has the
 * "admin" role, then redirects everyone else away.
 *
 * Note: this is a UX/defense-in-depth layer, not the real security boundary.
 * The real boundary is the Postgres RLS policies (has_role(auth.uid(), 'admin'))
 * on each table — those are what actually stop a non-admin from reading or
 * writing data, even if they somehow got this component to render. This guard
 * just stops the admin *UI shell* itself from being visible to the wrong people.
 */
export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    if (!isAdmin) {
      navigate({ to: "/" });
    }
  }, [loading, user, isAdmin, navigate]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen bg-brand-bg text-brand-primary">
        <SiteNav />
        <main className="px-6 md:px-10 py-32 max-w-7xl mx-auto text-center">
          <p className="eyebrow mb-3">
            {loading ? "Checking access" : "Redirecting"}
          </p>
          <p className="text-brand-primary/50 text-sm">
            {loading
              ? "One moment…"
              : !user
                ? "You need to sign in to view this page."
                : "This area is for admins only."}
          </p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return <>{children}</>;
}
