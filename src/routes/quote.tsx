import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { EventTypeSelect, type EventType } from "@/components/EventTypeSelect";

export const Route = createFileRoute("/quote")({
  validateSearch: (s: Record<string, unknown>) => ({ pkg: (s.pkg as string) || "" }),
  head: () => ({
    meta: [
      { title: "Book Your Event — Twinkles Events Namibia" },
      { name: "description", content: "Share your event details and get an instant estimated quotation in Namibian Dollars." },
    ],
  }),
  component: Quote,
});

type Service = {
  id: string; slug: string; name: string;
  base_price: number; per_guest_price: number;
  min_guests: number | null; max_guests: number | null;
};

const ADDONS = [
  { id: "lighting", label: "Ambient & festoon lighting", price: 8500 },
  { id: "florals", label: "Premium floral upgrade", price: 12000 },
  { id: "photography", label: "Event photography (6h)", price: 9500 },
  { id: "draping", label: "Ceiling & wall draping", price: 6500 },
  { id: "av", label: "AV & sound system", price: 7800 },
];

const BUDGET_RANGES = [
  "Under N$25,000", "N$25,000 – N$50,000", "N$50,000 – N$100,000",
  "N$100,000 – N$200,000", "N$200,000 – N$500,000", "Over N$500,000",
];

function Quote() {
  const { pkg } = Route.useSearch();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: services } = useQuery({
    queryKey: ["services-all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*").eq("active", true).order("sort_order");
      if (error) throw error;
      return data as unknown as Service[];
    },
  });

  const [submitted, setSubmitted] = useState<{ id: string; total: number } | null>(null);
  const [eventType, setEventType] = useState<EventType | null>(null);
  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    serviceSlug: pkg || "",
    date: "", guests: "50", venue: "", notes: "", budget: "",
    addons: [] as string[],
  });

  const selectedService = useMemo(
    () => services?.find((s) => s.slug === form.serviceSlug),
    [services, form.serviceSlug],
  );

  const estimate = useMemo(() => {
    if (!selectedService) return 0;
    const g = Math.max(0, parseInt(form.guests || "0", 10) || 0);
    const base = Number(selectedService.base_price) + Number(selectedService.per_guest_price) * g;
    const addons = ADDONS.filter((a) => form.addons.includes(a.id)).reduce((s, a) => s + a.price, 0);
    return Math.round(base + addons);
  }, [selectedService, form.guests, form.addons]);

  function toggleAddon(id: string) {
    setForm((f) => ({ ...f, addons: f.addons.includes(id) ? f.addons.filter((x) => x !== id) : [...f.addons, id] }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to submit a booking.");
      navigate({ to: "/auth" });
      return;
    }
    if (!form.name || !form.email || !selectedService || !form.date || !eventType) {
      toast.error("Please complete name, email, event type, service, and date.");
      return;
    }
    const { data, error } = await supabase.from("bookings").insert({
      user_id: user.id,
      service_id: selectedService.id,
      event_type_id: eventType.id,
      event_type: eventType.name,
      client_name: form.name,
      client_email: form.email,
      client_phone: form.phone || null,
      event_date: form.date,
      venue: form.venue || null,
      guest_count: parseInt(form.guests, 10) || 0,
      budget_range: form.budget || null,
      special_requirements: form.notes || null,
      estimated_total: estimate,
      addons: form.addons,
    }).select("id").single();

    if (error) { toast.error(error.message); return; }
    toast.success("Booking received! We'll be in touch within 48 hours.");
    setSubmitted({ id: data.id, total: estimate });
  }


  function handleEventTypeChange(t: EventType | null) {
    setEventType(t);
    if (t?.default_service_id && services && !form.serviceSlug) {
      const svc = services.find((s) => s.id === t.default_service_id);
      if (svc) setForm((f) => ({ ...f, serviceSlug: svc.slug }));
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-brand-bg">
        <SiteNav />
        <main className="px-6 md:px-10 py-32 max-w-2xl mx-auto text-center">
          <p className="eyebrow mb-6">Received</p>
          <h1 className="text-5xl font-serif italic mb-6">Thank you, {form.name.split(" ")[0]}.</h1>
          <p className="text-brand-primary/70 mb-3 leading-relaxed">
            Your booking for <em>{selectedService?.name}</em> on {form.date} is logged.
          </p>
          <p className="text-3xl font-serif mb-2">Estimate: N${submitted.total.toLocaleString()}</p>
          <p className="text-xs text-brand-primary/50 mb-10">Final quotation confirmed within 48 hours.</p>
          {user ? (
            <Link to="/portal" className="text-xs uppercase font-bold tracking-[0.25em] border-b border-brand-primary pb-1">
              View in your portal
            </Link>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-brand-primary/60">Want to track this booking?</p>
              <button onClick={() => navigate({ to: "/auth" })} className="text-xs uppercase font-bold tracking-[0.25em] border-b border-brand-primary pb-1">
                Create an account
              </button>
            </div>
          )}
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      <SiteNav />
      <main className="px-6 md:px-10 py-16 max-w-5xl mx-auto">
        <p className="eyebrow mb-4">Book your event</p>
        <h1 className="text-5xl font-serif italic mb-4">Request a quotation</h1>
        <p className="text-brand-primary/60 mb-12 max-w-2xl">
          Fill in your event details and see an instant estimated quotation in Namibian Dollars. We'll confirm a final, itemized proposal within 48 hours.
        </p>

        <form onSubmit={onSubmit} className="grid lg:grid-cols-[1fr_320px] gap-10 items-start">
          <div className="space-y-7 bg-card p-8 md:p-10 border border-brand-primary/5 shadow-sm">
            <Row>
              <Field label="Full name" required>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="qinput" />
              </Field>
              <Field label="Email" required>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="qinput" />
              </Field>
            </Row>
            <Row>
              <Field label="Phone">
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="qinput" />
              </Field>
              <Field label="Event type" required>
                <EventTypeSelect value={eventType?.id ?? null} onChange={handleEventTypeChange} required />
              </Field>
            </Row>
            <Row>
              <Field label="Service / package" required>
                <select value={form.serviceSlug} onChange={(e) => setForm({ ...form, serviceSlug: e.target.value })} className="qinput">
                  <option value="">Select a package…</option>
                  {services?.map((s) => <option key={s.id} value={s.slug}>{s.name}</option>)}
                </select>
              </Field>
              <Field label="Budget range">
                <select value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className="qinput">
                  <option value="">Select a range…</option>
                  {BUDGET_RANGES.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </Field>
            </Row>
            <Row>
              <Field label="Event date" required>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="qinput" />
              </Field>
              <Field label="Number of guests" required>
                <input type="number" min={1} value={form.guests} onChange={(e) => setForm({ ...form, guests: e.target.value })} className="qinput" />
              </Field>
            </Row>
            <Field label="Venue / location">
              <input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} className="qinput" placeholder="e.g. Swakopmund, private estate" />
            </Field>
            <Field label="Add-ons (optional)">
              <div className="grid sm:grid-cols-2 gap-2 mt-1">
                {ADDONS.map((a) => (
                  <label key={a.id} className="flex items-center gap-3 p-3 border border-brand-primary/10 cursor-pointer hover:border-brand-accent transition-colors">
                    <input type="checkbox" checked={form.addons.includes(a.id)} onChange={() => toggleAddon(a.id)} className="accent-brand-accent" />
                    <span className="flex-1 text-sm">{a.label}</span>
                    <span className="text-xs text-brand-primary/50">+N${a.price.toLocaleString()}</span>
                  </label>
                ))}
              </div>
            </Field>
            <Field label="Special requirements">
              <textarea rows={4} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="qinput resize-none" placeholder="Dietary, accessibility, theme, must-haves…" />
            </Field>
          </div>

          <aside className="bg-brand-primary text-primary-foreground p-8 sticky top-24">
            <p className="text-[10px] uppercase tracking-[0.25em] text-brand-accent mb-3">Live estimate</p>
            <p className="text-4xl font-serif mb-2">N${estimate.toLocaleString()}</p>
            <p className="text-xs text-primary-foreground/60 mb-6">
              {selectedService ? `Based on ${selectedService.name} · ${form.guests} guests` : "Select a service to begin"}
            </p>
            {selectedService && (
              <ul className="text-xs space-y-2 mb-6 pb-6 border-b border-primary-foreground/10">
                <Row2 k="Base" v={`N$${Number(selectedService.base_price).toLocaleString()}`} />
                <Row2 k={`Per-guest × ${form.guests || 0}`} v={`N$${(Number(selectedService.per_guest_price) * (parseInt(form.guests || "0", 10) || 0)).toLocaleString()}`} />
                {form.addons.map((id) => {
                  const a = ADDONS.find((x) => x.id === id)!;
                  return <Row2 key={id} k={a.label} v={`N$${a.price.toLocaleString()}`} />;
                })}
              </ul>
            )}
            <button type="submit"
              className="w-full py-4 bg-brand-accent text-accent-foreground text-xs uppercase tracking-[0.25em] font-bold hover:brightness-110 transition-all">
              Submit booking
            </button>
            <p className="text-[10px] text-primary-foreground/40 mt-4 text-center">
              Estimate only · final quote in 48h
            </p>
          </aside>
        </form>
      </main>
      <SiteFooter />
      <style>{`
        .qinput { width: 100%; padding: .75rem 1rem; background: transparent;
          border: 1px solid color-mix(in oklab, var(--brand-primary) 12%, transparent);
          border-radius: 2px; font-size: .95rem; color: var(--brand-primary); transition: border-color .2s; }
        .qinput:focus { outline: none; border-color: var(--brand-accent); }
      `}</style>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid md:grid-cols-2 gap-6">{children}</div>;
}
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-[0.2em] font-semibold text-brand-primary/60 mb-2">
        {label} {required && <span className="text-brand-accent">*</span>}
      </span>
      {children}
    </label>
  );
}
function Row2({ k, v }: { k: string; v: string }) {
  return <li className="flex justify-between gap-3"><span className="text-primary-foreground/60">{k}</span><span>{v}</span></li>;
}
