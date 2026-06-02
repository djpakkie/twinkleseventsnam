import { createFileRoute } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { leads, inventory, payments } from "@/lib/mockData";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Aurum & Olive" },
      { name: "description", content: "Manage leads, quotes, bookings, inventory, and payments." },
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
            { l: "Pipeline value", v: `$${pipeline.toLocaleString()}` },
            { l: "Paid YTD", v: `$${totalRevenue.toLocaleString()}` },
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
                    <td className="py-4 font-serif">${l.estimate.toLocaleString()}</td>
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

          {/* Inventory alert */}
          <div className="bg-brand-primary p-8 text-primary-foreground flex flex-col">
            <p className="text-[10px] uppercase tracking-widest text-brand-accent mb-4">Inventory Alert</p>
            {conflicts.length > 0 ? (
              <>
                <p className="text-lg leading-snug font-serif italic mb-2">
                  "{conflicts[0].name}" is over-booked.
                </p>
                <p className="text-sm opacity-70 mb-6">
                  {conflicts[0].booked} reserved / {conflicts[0].total} available
                </p>
              </>
            ) : (
              <p className="text-lg font-serif italic mb-6">All inventory tracked & clear.</p>
            )}
            <button className="mt-auto w-full py-3 bg-primary-foreground text-brand-primary text-[10px] uppercase tracking-widest font-bold hover:bg-brand-accent hover:text-accent-foreground transition-all">
              Resolve schedule
            </button>
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
        <div className="grid md:grid-cols-2 gap-6">
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
                    <td className="py-3 font-serif text-right">${p.amount.toLocaleString()}</td>
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
      </main>
      <SiteFooter />
    </div>
  );
}
