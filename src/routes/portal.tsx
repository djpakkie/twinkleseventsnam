import { createFileRoute } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { upcomingEvent, payments } from "@/lib/mockData";

export const Route = createFileRoute("/portal")({
  head: () => ({
    meta: [
      { title: "Client Portal — Aurum & Olive" },
      { name: "description", content: "Track your event progress, message your coordinator, and manage payments." },
    ],
  }),
  component: Portal,
});

function Portal() {
  const myInvoices = payments.filter((p) => p.client === "Isabella Rossi" || p.id === "INV-3204");
  return (
    <div className="min-h-screen bg-brand-bg">
      <SiteNav />
      <main className="px-6 md:px-10 py-12 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="eyebrow mb-3">Client Portal</p>
            <h1 className="text-4xl font-serif italic">Welcome back, Isabella</h1>
          </div>
          <span className="text-xs text-brand-primary/40">Last login · 2h ago</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Event progress */}
          <div className="lg:col-span-2 bg-card p-8 border border-brand-primary/5 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-brand-accent mb-2">Your Event</p>
                <h2 className="text-3xl font-serif">{upcomingEvent.name}</h2>
                <p className="text-sm text-brand-primary/60 mt-1">
                  {upcomingEvent.date} · {upcomingEvent.location}
                </p>
              </div>
              <span className="px-3 py-1 bg-brand-soft text-[9px] uppercase tracking-widest font-bold">
                In Planning
              </span>
            </div>

            <div className="mt-10">
              <div className="flex justify-between text-[10px] uppercase tracking-widest mb-3">
                <span>Progress</span>
                <span>{upcomingEvent.progress}%</span>
              </div>
              <div className="h-px bg-brand-primary/10 relative">
                <div
                  className="absolute left-0 top-0 h-full bg-brand-primary"
                  style={{ width: `${upcomingEvent.progress}%` }}
                />
              </div>
              <div className="flex justify-between mt-6">
                {upcomingEvent.steps.map((s) => (
                  <div key={s.label} className="text-center flex-1">
                    <div
                      className={`size-3 rounded-full mx-auto mb-2 ${
                        s.done ? "bg-brand-primary" : "bg-brand-primary/15"
                      }`}
                    />
                    <p className={`text-[9px] uppercase tracking-tight ${s.done ? "font-bold" : "text-brand-primary/40"}`}>
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="bg-brand-primary p-8 text-primary-foreground flex flex-col">
            <p className="text-[10px] uppercase tracking-widest text-brand-accent mb-4">Messages</p>
            <div className="space-y-4 flex-1">
              {upcomingEvent.messages.map((m, i) => (
                <div key={i} className="text-sm">
                  <p className="text-xs font-serif italic text-brand-accent">{m.from}</p>
                  <p className="mt-1 leading-relaxed">{m.text}</p>
                  <p className="text-[10px] opacity-50 mt-1">{m.time}</p>
                </div>
              ))}
            </div>
            <button className="mt-6 w-full py-3 bg-primary-foreground text-brand-primary text-[10px] uppercase tracking-widest font-bold hover:bg-brand-accent hover:text-accent-foreground transition-all">
              Open conversation
            </button>
          </div>

          {/* Moodboard */}
          <div className="bg-card p-8 border border-brand-primary/5 shadow-sm">
            <p className="text-[10px] uppercase tracking-widest text-brand-accent mb-4">Moodboard</p>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-square bg-brand-soft" />
              ))}
            </div>
            <button className="mt-4 text-xs uppercase tracking-[0.2em] font-bold border-b border-brand-primary pb-1 hover:text-brand-accent">
              Upload inspiration →
            </button>
          </div>

          {/* Invoices */}
          <div className="lg:col-span-2 bg-card p-8 border border-brand-primary/5 shadow-sm">
            <p className="text-[10px] uppercase tracking-widest text-brand-accent mb-4">Payments</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-brand-primary/40 text-left">
                  <th className="pb-3 font-medium">Invoice</th>
                  <th className="pb-3 font-medium">Due</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {myInvoices.map((inv) => (
                  <tr key={inv.id} className="border-t border-brand-primary/5">
                    <td className="py-4 font-serif">{inv.id}</td>
                    <td className="py-4 text-brand-primary/60">{inv.date}</td>
                    <td className="py-4 font-serif">${inv.amount.toLocaleString()}</td>
                    <td className="py-4 text-right">
                      <span
                        className={`px-2 py-1 text-[9px] uppercase tracking-widest font-bold ${
                          inv.status === "paid"
                            ? "bg-green-50 text-green-700"
                            : "bg-brand-soft text-brand-primary/70"
                        }`}
                      >
                        {inv.status}
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
