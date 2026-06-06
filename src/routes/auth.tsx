import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Twinkles Events Namibia" },
      { name: "description", content: "Sign in or create an account to track your bookings, quotations and event timeline." },
    ],
  }),
  component: Auth,
});

function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/portal" });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin, data: { full_name: name } },
        });
        if (error) throw error;
        toast.success("Account created. You're signed in.");
        navigate({ to: "/portal" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back.");
        navigate({ to: "/portal" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally { setBusy(false); }
  }

  async function google() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/portal" });
    if (result.error) { toast.error("Google sign-in failed"); setBusy(false); return; }
    if (!result.redirected) navigate({ to: "/portal" });
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      <SiteNav />
      <main className="px-6 md:px-10 py-20 max-w-md mx-auto">
        <p className="eyebrow mb-4">{mode === "signin" ? "Welcome back" : "Create account"}</p>
        <h1 className="text-4xl font-serif italic mb-8">
          {mode === "signin" ? "Sign in" : "Join us"}
        </h1>

        <button
          onClick={google}
          disabled={busy}
          className="w-full py-3 mb-6 border border-brand-primary/20 hover:bg-brand-primary hover:text-primary-foreground transition-all text-xs uppercase tracking-[0.2em] font-bold disabled:opacity-50"
        >
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-6 text-[10px] uppercase tracking-widest text-brand-primary/40">
          <span className="flex-1 h-px bg-brand-primary/10" />or<span className="flex-1 h-px bg-brand-primary/10" />
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          {mode === "signup" && (
            <Field label="Full name">
              <input value={name} onChange={(e) => setName(e.target.value)} className="auth-input" />
            </Field>
          )}
          <Field label="Email">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="auth-input" />
          </Field>
          <Field label="Password">
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="auth-input" />
          </Field>
          <button
            type="submit"
            disabled={busy}
            className="w-full py-4 bg-brand-primary text-primary-foreground text-xs uppercase tracking-[0.25em] font-bold hover:bg-brand-accent transition-all disabled:opacity-50"
          >
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="text-sm text-brand-primary/60 mt-6 text-center">
          {mode === "signin" ? "New here? " : "Have an account? "}
          <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-brand-accent underline-offset-4 hover:underline">
            {mode === "signin" ? "Create an account" : "Sign in"}
          </button>
        </p>
        <p className="text-xs text-brand-primary/40 mt-8 text-center">
          <Link to="/">← Back home</Link>
        </p>
      </main>
      <SiteFooter />
      <style>{`
        .auth-input { width: 100%; padding: .75rem 1rem; background: transparent;
          border: 1px solid color-mix(in oklab, var(--brand-primary) 12%, transparent);
          border-radius: 2px; font-size: .95rem; color: var(--brand-primary); transition: border-color .2s; }
        .auth-input:focus { outline: none; border-color: var(--brand-accent); }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-[0.2em] font-semibold text-brand-primary/60 mb-2">{label}</span>
      {children}
    </label>
  );
}
