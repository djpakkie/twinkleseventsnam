import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export function SiteNav() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const linkClass =
    "text-xs uppercase tracking-[0.2em] font-medium hover:text-brand-accent transition-colors";

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  return (
    <nav className="flex items-center justify-between px-6 md:px-10 py-6 border-b border-brand-primary/5 bg-brand-bg/80 backdrop-blur sticky top-0 z-40">
      <Link to="/" className="text-xl md:text-2xl font-serif font-semibold tracking-tight">
        Twinkles Events Namibia
      </Link>
      <div className="hidden md:flex gap-8 items-center">
        <Link to="/services" className={linkClass} activeProps={{ className: "text-brand-accent" }}>Services</Link>
        <Link to="/packages" className={linkClass} activeProps={{ className: "text-brand-accent" }}>Packages</Link>
        <Link to="/quote" className={linkClass} activeProps={{ className: "text-brand-accent" }}>Book</Link>
        {user && <Link to="/portal" className={linkClass} activeProps={{ className: "text-brand-accent" }}>Portal</Link>}
        {isAdmin && <Link to="/admin" className={linkClass} activeProps={{ className: "text-brand-accent" }}>Admin</Link>}
        {user ? (
          <button onClick={signOut} className={linkClass}>Sign out</button>
        ) : (
          <Link to="/auth" className={linkClass}>Sign in</Link>
        )}
      </div>
      <Link
        to="/quote"
        className="px-5 py-2.5 bg-brand-primary text-primary-foreground text-[10px] uppercase tracking-widest font-semibold hover:bg-brand-accent transition-all"
      >
        Book Event
      </Link>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="px-6 md:px-10 py-10 border-t border-brand-primary/10 mt-24">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-xl font-serif font-semibold">Twinkles Events Namibia</div>
        <div className="text-[10px] text-brand-primary/40 tracking-widest uppercase">
          © 2026 Twinkles Events Namibia · Windhoek · All rights reserved
        </div>
        <div className="flex gap-3">
          <div className="size-8 rounded-full border border-brand-primary/10 grid place-items-center text-[9px]">IG</div>
          <div className="size-8 rounded-full border border-brand-primary/10 grid place-items-center text-[9px]">FB</div>
        </div>
      </div>
    </footer>
  );
}
