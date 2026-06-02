import { createFileRoute } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import {
  leads,
  inventory,
  payments,
  staff,
  notifications,
  onlinePayments,
  aiQuoteSuggestions,
  followUps,
  vendors,
} from "@/lib/mockData";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Twinkles Events Namibia" },
      { name: "description", content: "Manage leads, quotes, bookings, inventory, staff, vendors, and payments." },
    ],
  }),
  component: Admin,
});

const statusStyles: Record<string, string> = {
  new: "bg-brand-soft text-brand-primary/70",
  quoted: "bg-amber-50 text-amber-800",
  deposit: "bg-green-50 text-green-700",
  confirmed: "bg-brand-primary text-primary-foreground",
};

function Admin() {
  const totalRevenue = payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const pipeline = leads.reduce((s, l) => s + l.estimate, 0);
  const conflicts = inventory.filter((i) => i.booked > i.total);
  const unread = notifications.filter((n) => n.unread).length;

  return (
    <div className="min-h-screen bg-brand-bg">
      <SiteNav />
      <main className="px-6 md:px-10 py-12 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="eyebrow mb-3">Management Terminal</p>
            <h1 className="text-4xl font-serif italic">Business operations</h1>
          </div>
          <span className="text-xs text-brand-primary/40">Last updated · 14:02</span>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-brand-primary/10 mb-12 border border-brand-primary/10">
          {[
            { l: "Active leads", v: leads.length.toString() },
            { l: "Pipeline value", v: `N$${pipeline.toLocaleString()}` },
            { l: "Paid YTD", v: `N$${totalRevenue.toLocaleString()}` },
            { l: "Inventory conflicts", v: conflicts.length.toString() },
          ].map((k) => (
            <div key={k.l} className="bg-card p-6">
              <p className="text-[10px] uppercase tracking-widest text-brand-primary/40 mb-2">{k.l}</p>
              <p className="text-3xl font-serif">{k.v}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-12">
          {/* Leads */}
          <div className="lg:col-span-2 bg-card p-8 border border-brand-primary/5 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-serif italic">Lead pipeline</h2>
              <button className="text-[10px] uppercase tracking-widest font-bold text-brand-accent">+ New lead</button>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-brand-primary/40 text-left">
                  <th className="pb-3 font-medium">Client</th>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Estimate</th>
                  <th className="pb-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id} className="border-t border-brand-primary/5 hover:bg-brand-bg/50 transition-colors">
                    <td className="py-4">
                      <p className="font-serif">{l.client}</p>
                      <p className="text-[10px] text-brand-primary/40">{l.id}</p>
                    </td>
                    <td className="py-4 text-brand-primary/70">{l.type}</td>
                    <td className="py-4 text-brand-primary/70">{l.date}</td>
                    <td className="py-4 font-serif">N${l.estimate.toLocaleString()}</td>
                    <td className="py-4 text-right">
                      <span className={`px-2 py-1 text-[9px] uppercase tracking-widest font-bold ${statusStyles[l.status]}`}>
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Notifications (Phase 2) */}
          <div className="bg-brand-primary p-8 text-primary-foreground flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <p className="text-[10px] uppercase tracking-widest text-brand-accent">Notifications</p>
              <span className="text-[10px] bg-brand-accent text-accent-foreground px-2 py-0.5 font-bold">{unread} new</span>
            </div>
            <ul className="space-y-4 flex-1">
              {notifications.slice(0, 5).map((n) => (
                <li key={n.id} className="text-sm leading-snug">
                  <div className="flex items-start gap-2">
                    <span className={`mt-1.5 size-1.5 rounded-full ${n.unread ? "bg-brand-accent" : "bg-primary-foreground/30"}`} />
                    <div className="flex-1">
                      <p className={n.unread ? "" : "opacity-60"}>{n.text}</p>
                      <p className="text-[10px] opacity-50 mt-0.5">{n.time}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-card p-8 border border-brand-primary/5 shadow-sm mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-serif italic">Booking calendar · September 2026</h2>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs border border-brand-primary/10">‹</button>
              <button className="px-3 py-1 text-xs border border-brand-primary/10">›</button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-px bg-brand-primary/5">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="bg-card p-2 text-[10px] uppercase tracking-widest text-brand-primary/40 text-center">
                {d}
              </div>
            ))}
            {Array.from({ length: 30 }, (_, i) => {
              const day = i + 1;
              const evt = leads.find((l) => l.date === `2026-09-${String(day).padStart(2, "0")}`);
              return (
                <div key={day} className="bg-card aspect-square p-2 text-xs relative">
                  <span className="text-brand-primary/40">{day}</span>
                  {evt && (
                    <div className="absolute bottom-1 left-1 right-1 bg-brand-accent text-accent-foreground text-[9px] px-1 py-0.5 truncate">
                      {evt.client.split(" ")[0]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Inventory + Payments */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-card p-8 border border-brand-primary/5 shadow-sm">
            <h2 className="text-xl font-serif italic mb-6">Inventory</h2>
            <div className="space-y-4">
              {inventory.map((item) => {
                const pct = Math.min(100, (item.booked / item.total) * 100);
                const over = item.booked > item.total;
                return (
                  <div key={item.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{item.name}</span>
                      <span className={`font-serif ${over ? "text-destructive" : "text-brand-primary/60"}`}>
                        {item.booked}/{item.total}
                      </span>
                    </div>
                    <div className="h-1 bg-brand-primary/10">
                      <div
                        className={`h-full ${over ? "bg-destructive" : "bg-brand-primary"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-card p-8 border border-brand-primary/5 shadow-sm">
            <h2 className="text-xl font-serif italic mb-6">Recent payments</h2>
            <table className="w-full text-sm">
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-t border-brand-primary/5 first:border-0">
                    <td className="py-3">
                      <p className="font-serif">{p.id}</p>
                      <p className="text-[10px] text-brand-primary/40">{p.client}</p>
                    </td>
                    <td className="py-3 text-brand-primary/60 text-xs">{p.date}</td>
                    <td className="py-3 font-serif text-right">N${p.amount.toLocaleString()}</td>
                    <td className="py-3 text-right pl-3">
                      <span
                        className={`px-2 py-1 text-[9px] uppercase tracking-widest font-bold ${
                          p.status === "paid"
                            ? "bg-green-50 text-green-700"
                            : p.status === "due"
                            ? "bg-amber-50 text-amber-800"
                            : "bg-brand-soft"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── Phase 2 ─── */}
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="eyebrow mb-2">Phase 2</p>
            <h2 className="text-3xl font-serif italic">Operations & engagement</h2>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-12">
          {/* Staff scheduling */}
          <div className="lg:col-span-2 bg-card p-8 border border-brand-primary/5 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif italic">Staff scheduling</h3>
              <button className="text-[10px] uppercase tracking-widest font-bold text-brand-accent">+ Assign shift</button>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-brand-primary/40 text-left">
                  <th className="pb-3 font-medium">Member</th>
                  <th className="pb-3 font-medium">Event</th>
                  <th className="pb-3 font-medium">Shift</th>
                  <th className="pb-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s) => (
                  <tr key={s.name} className="border-t border-brand-primary/5">
                    <td className="py-3">
                      <p className="font-serif">{s.name}</p>
                      <p className="text-[10px] text-brand-primary/40">{s.role}</p>
                    </td>
                    <td className="py-3 text-brand-primary/70">{s.assigned}</td>
                    <td className="py-3 text-brand-primary/70 text-xs">{s.shift}</td>
                    <td className="py-3 text-right">
                      <span
                        className={`px-2 py-1 text-[9px] uppercase tracking-widest font-bold ${
                          s.status === "confirmed"
                            ? "bg-green-50 text-green-700"
                            : s.status === "pending"
                            ? "bg-amber-50 text-amber-800"
                            : "bg-brand-soft text-brand-primary/70"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile app teaser */}
          <div className="bg-brand-soft p-8 border border-brand-primary/5 shadow-sm flex flex-col">
            <p className="text-[10px] uppercase tracking-widest text-brand-accent mb-3">Companion App</p>
            <h3 className="text-2xl font-serif italic mb-3">On-site mobile</h3>
            <p className="text-sm text-brand-primary/70 leading-relaxed mb-6">
              Crew check-ins, install checklists, and live photo uploads — direct from the venue.
            </p>
            <div className="grid grid-cols-2 gap-2 mt-auto">
              <button className="py-3 bg-brand-primary text-primary-foreground text-[10px] uppercase tracking-widest font-bold">
                iOS Beta
              </button>
              <button className="py-3 border border-brand-primary/20 text-[10px] uppercase tracking-widest font-bold">
                Android
              </button>
            </div>
          </div>
        </div>

        {/* ─── Phase 3 ─── */}
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="eyebrow mb-2">Phase 3</p>
            <h2 className="text-3xl font-serif italic">Automation & growth</h2>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* AI quote suggestions */}
          <div className="bg-brand-primary p-8 text-primary-foreground">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[10px] uppercase tracking-widest text-brand-accent">AI Quote Engine</span>
              <span className="text-[9px] bg-brand-accent text-accent-foreground px-2 py-0.5 font-bold">BETA</span>
            </div>
            <ul className="space-y-6">
              {aiQuoteSuggestions.map((s) => (
                <li key={s.lead} className="pb-6 border-b border-primary-foreground/10 last:border-0 last:pb-0">
                  <p className="text-[10px] uppercase tracking-widest opacity-60 mb-2">{s.lead}</p>
                  <p className="text-sm font-serif italic mb-2">{s.suggestion}</p>
                  <p className="text-xs opacity-80">↗ {s.upsell}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Online payments */}
          <div className="bg-card p-8 border border-brand-primary/5 shadow-sm">
            <h3 className="text-xl font-serif italic mb-6">Online payments</h3>
            <ul className="space-y-3">
              {onlinePayments.map((p) => (
                <li key={p.method} className="flex items-center justify-between py-3 border-t border-brand-primary/5 first:border-0">
                  <div>
                    <p className="font-serif text-sm">{p.method}</p>
                    <p className="text-[10px] text-brand-primary/40 uppercase tracking-widest">{p.processor} · {p.fee}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-[9px] uppercase tracking-widest font-bold ${
                      p.enabled ? "bg-green-50 text-green-700" : "bg-brand-soft text-brand-primary/40"
                    }`}
                  >
                    {p.enabled ? "Live" : "Off"}
                  </span>
                </li>
              ))}
            </ul>
            <button className="mt-6 w-full py-3 bg-brand-primary text-primary-foreground text-[10px] uppercase tracking-widest font-bold">
              Configure gateways
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-12">
          {/* Automated follow-ups */}
          <div className="bg-card p-8 border border-brand-primary/5 shadow-sm">
            <h3 className="text-xl font-serif italic mb-6">Automated follow-ups</h3>
            <ul className="space-y-4">
              {followUps.map((f) => (
                <li key={f.client} className="text-sm border-t border-brand-primary/5 first:border-0 pt-4 first:pt-0">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-serif">{f.client}</p>
                    <span
                      className={`px-2 py-0.5 text-[9px] uppercase tracking-widest font-bold ${
                        f.status === "scheduled"
                          ? "bg-green-50 text-green-700"
                          : f.status === "pending"
                          ? "bg-amber-50 text-amber-800"
                          : "bg-brand-soft text-brand-primary/60"
                      }`}
                    >
                      {f.status}
                    </span>
                  </div>
                  <p className="text-xs text-brand-primary/60 mb-1">{f.trigger}</p>
                  <p className="text-xs text-brand-primary/70">→ {f.action} · <span className="italic">{f.when}</span></p>
                </li>
              ))}
            </ul>
          </div>

          {/* Vendor management */}
          <div className="bg-card p-8 border border-brand-primary/5 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif italic">Vendor management</h3>
              <button className="text-[10px] uppercase tracking-widest font-bold text-brand-accent">+ Add vendor</button>
            </div>
            <ul className="space-y-3">
              {vendors.map((v) => (
                <li key={v.name} className="flex items-center justify-between py-3 border-t border-brand-primary/5 first:border-0">
                  <div>
                    <p className="font-serif text-sm">{v.name}</p>
                    <p className="text-[10px] text-brand-primary/40 uppercase tracking-widest">{v.category} · {v.jobs} jobs</p>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-sm">★ {v.rating}</p>
                    <p className="text-[9px] uppercase tracking-widest text-brand-primary/50">{v.status}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
