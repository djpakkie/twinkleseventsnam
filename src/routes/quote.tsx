import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { packages } from "@/lib/mockData";
import { toast } from "sonner";

export const Route = createFileRoute("/quote")({
  validateSearch: (s: Record<string, unknown>) => ({ pkg: (s.pkg as string) || "" }),
  head: () => ({
    meta: [
      { title: "Request a Quote — Aurum & Olive" },
      { name: "description", content: "Share your event details and receive an itemized digital proposal within 48 hours." },
    ],
  }),
  component: Quote,
});

function Quote() {
  const { pkg } = Route.useSearch();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    eventType: pkg || "",
    date: "",
    guests: "",
    venue: "",
    notes: "",
    budget: "",
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.eventType || !form.date) {
      toast.error("Please complete name, email, event type, and date.");
      return;
    }
    setSubmitted(true);
    toast.success("Quote request received. We'll be in touch within 48 hours.");
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-brand-bg">
        <SiteNav />
        <main className="px-6 md:px-10 py-32 max-w-2xl mx-auto text-center">
          <p className="eyebrow mb-6">Received</p>
          <h1 className="text-5xl font-serif italic mb-6">Thank you, {form.name.split(" ")[0]}.</h1>
          <p className="text-brand-primary/70 mb-10 leading-relaxed">
            Your inquiry for a <em>{form.eventType}</em> on {form.date} is with our studio.
            Expect a tailored proposal in your inbox within 48 hours.
          </p>
          <a href="/" className="text-xs uppercase font-bold tracking-[0.25em] border-b border-brand-primary pb-1">
            Return home
          </a>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      <SiteNav />
      <main className="px-6 md:px-10 py-16 max-w-3xl mx-auto">
        <p className="eyebrow mb-4">Inquiry</p>
        <h1 className="text-5xl font-serif italic mb-4">Request a quote</h1>
        <p className="text-brand-primary/60 mb-12">
          Share a few details and we'll return with an itemized proposal within 48 hours.
        </p>

        <form onSubmit={onSubmit} className="space-y-8 bg-card p-8 md:p-12 border border-brand-primary/5 shadow-sm">
          <Row>
            <Field label="Full name" required>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input"
              />
            </Field>
            <Field label="Email" required>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input"
              />
            </Field>
          </Row>
          <Row>
            <Field label="Phone">
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input"
              />
            </Field>
            <Field label="Event type" required>
              <select
                value={form.eventType}
                onChange={(e) => setForm({ ...form, eventType: e.target.value })}
                className="input"
              >
                <option value="">Select…</option>
                {packages.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
                <option value="custom">Custom / other</option>
              </select>
            </Field>
          </Row>
          <Row>
            <Field label="Event date" required>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="input"
              />
            </Field>
            <Field label="Guest count">
              <input
                type="number"
                value={form.guests}
                onChange={(e) => setForm({ ...form, guests: e.target.value })}
                className="input"
              />
            </Field>
          </Row>
          <Field label="Venue / location">
            <input
              value={form.venue}
              onChange={(e) => setForm({ ...form, venue: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Estimated budget (USD)">
            <input
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: e.target.value })}
              className="input"
              placeholder="e.g. 5,000 – 10,000"
            />
          </Field>
          <Field label="Vision & notes">
            <textarea
              rows={5}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="input resize-none"
              placeholder="Tell us about your style, palette, must-haves…"
            />
          </Field>

          <button
            type="submit"
            className="w-full py-4 bg-brand-primary text-primary-foreground text-xs uppercase tracking-[0.25em] font-bold hover:bg-brand-accent transition-all"
          >
            Submit inquiry
          </button>
        </form>
      </main>
      <SiteFooter />

      <style>{`
        .input {
          width: 100%;
          padding: 0.75rem 1rem;
          background: transparent;
          border: 1px solid color-mix(in oklab, var(--brand-primary) 12%, transparent);
          border-radius: 2px;
          font-family: var(--font-sans);
          font-size: 0.95rem;
          color: var(--brand-primary);
          transition: border-color 0.2s;
        }
        .input:focus {
          outline: none;
          border-color: var(--brand-accent);
        }
      `}</style>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid md:grid-cols-2 gap-6">{children}</div>;
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-[0.2em] font-semibold text-brand-primary/60 mb-2">
        {label} {required && <span className="text-brand-accent">*</span>}
      </span>
      {children}
    </label>
  );
}
