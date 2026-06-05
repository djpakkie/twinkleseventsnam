import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  leads as seedLeads,
  inventory as seedInventory,
  payments as seedPayments,
  staff,
  notifications,
  onlinePayments,
  followUps,
  vendors as seedVendors,
  adminUser,
} from "@/lib/mockData";
import { Eye, Pencil, Download } from "lucide-react";

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

type SectionId =
  | "overview"
  | "leads"
  | "quotations"
  | "invoices"
  | "calendar"
  | "inventory"
  | "payments"
  | "staff"
  | "notifications"
  | "gateways"
  | "followups"
  | "vendors"
  | "mobile";

const sections: { id: SectionId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "leads", label: "Lead pipeline" },
  { id: "quotations", label: "Quotations" },
  { id: "invoices", label: "Invoices" },
  { id: "calendar", label: "Calendar" },
  { id: "inventory", label: "Inventory" },
  { id: "payments", label: "Payments" },
  { id: "staff", label: "Staff" },
  { id: "vendors", label: "Vendors" },
  { id: "notifications", label: "Notifications" },
  { id: "followups", label: "Follow-ups" },
  { id: "gateways", label: "Online payments" },
  { id: "mobile", label: "Mobile app" },
];

type Quotation = {
  id: string;
  client: string;
  type: string;
  guests: number;
  amount: number;
  date: string;
  status: "draft" | "sent" | "accepted" | "invoiced";
  invoiceId?: string;
};

type Invoice = {
  id: string;
  client: string;
  amount: number;
  date: string;
  status: "paid" | "due" | "pending";
  quoteId?: string;
};

type Vendor = { name: string; category: string; rating: number; jobs: number; status: string };
type InventoryItem = { name: string; total: number; booked: number };

function Admin() {
  const [active, setActive] = useState<SectionId>("overview");

  // Interactive state
  const [quotations, setQuotations] = useState<Quotation[]>([
    { id: "Q-1001", client: "Isabella Rossi", type: "Garden Wedding", guests: 150, amount: 75000, date: "2026-09-14", status: "sent" },
    { id: "Q-1002", client: "Adeyemi Family", type: "Anniversary", guests: 80, amount: 113000, date: "2026-08-03", status: "accepted" },
  ]);
  const [invoices, setInvoices] = useState<Invoice[]>(
    seedPayments.map((p) => ({ id: p.id, client: p.client, amount: p.amount, date: p.date, status: p.status as Invoice["status"] }))
  );
  const [vendorList, setVendorList] = useState<Vendor[]>(seedVendors);
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>(seedInventory);

  const totalRevenue = invoices.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const pipeline = seedLeads.reduce((s, l) => s + l.estimate, 0);
  const conflicts = inventoryList.filter((i) => i.booked > i.total);
  const unread = notifications.filter((n) => n.unread).length;

  return (
    <div className="min-h-screen bg-brand-bg">
      <SiteNav />
      <div className="flex">
        {/* LEFT CONTROL RAIL */}
        <aside className="w-72 shrink-0 border-r border-brand-primary/10 bg-card sticky top-[81px] self-start h-[calc(100vh-81px)] overflow-y-auto">
          <div className="p-6 border-b border-brand-primary/10">
            <p className="eyebrow mb-3">Administrator</p>
            <div className="flex items-center gap-3 mb-3">
              <div className="size-10 rounded-full bg-brand-primary text-primary-foreground grid place-items-center font-serif text-lg">
                {adminUser.email[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-serif text-sm truncate">{adminUser.name}</p>
                <p className="text-[10px] text-brand-primary/50 truncate">{adminUser.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[9px] uppercase tracking-widest font-bold bg-green-50 text-green-700">
                {adminUser.role}
              </span>
              <span className="text-[9px] uppercase tracking-widest text-brand-primary/50">Full rights</span>
            </div>
          </div>

          <div className="p-6 border-b border-brand-primary/10 space-y-2">
            <p className="eyebrow mb-3">Quick actions</p>
            <button
              onClick={() => setActive("quotations")}
              className="w-full text-left px-3 py-2 bg-brand-primary text-primary-foreground text-[10px] uppercase tracking-widest font-bold hover:bg-brand-accent transition-colors"
            >
              + Generate quotation
            </button>
            <button
              onClick={() => setActive("vendors")}
              className="w-full text-left px-3 py-2 border border-brand-primary/15 text-[10px] uppercase tracking-widest font-bold hover:bg-brand-bg transition-colors"
            >
              + Add vendor
            </button>
            <button
              onClick={() => setActive("inventory")}
              className="w-full text-left px-3 py-2 border border-brand-primary/15 text-[10px] uppercase tracking-widest font-bold hover:bg-brand-bg transition-colors"
            >
              + Add inventory
            </button>
            <button
              onClick={() => setActive("invoices")}
              className="w-full text-left px-3 py-2 border border-brand-primary/15 text-[10px] uppercase tracking-widest font-bold hover:bg-brand-bg transition-colors"
            >
              View invoices
            </button>
          </div>

          <nav className="p-6">
            <p className="eyebrow mb-3">Navigate</p>
            <ul className="space-y-1">
              {sections.map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => setActive(s.id)}
                    className={`w-full text-left block px-3 py-2 text-xs border-l-2 transition-all ${
                      active === s.id
                        ? "text-brand-primary bg-brand-bg border-brand-accent font-medium"
                        : "text-brand-primary/70 hover:text-brand-primary hover:bg-brand-bg border-transparent hover:border-brand-accent"
                    }`}
                  >
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* MAIN */}
        <main className="flex-1 px-6 md:px-10 py-12 max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="eyebrow mb-3">Management Terminal</p>
              <h1 className="text-4xl font-serif italic">
                {sections.find((s) => s.id === active)?.label}
              </h1>
            </div>
            <span className="text-xs text-brand-primary/40">Last updated · 14:02</span>
          </div>

          {active === "overview" && (
            <OverviewView
              totals={{ leads: seedLeads.length, pipeline, totalRevenue, conflicts: conflicts.length, quotations: quotations.length, invoices: invoices.length }}
            />
          )}
          {active === "leads" && <LeadsView />}
          {active === "quotations" && (
            <QuotationsView
              quotations={quotations}
              setQuotations={setQuotations}
              invoices={invoices}
              setInvoices={setInvoices}
            />
          )}
          {active === "invoices" && <InvoicesView invoices={invoices} quotations={quotations} />}
          {active === "calendar" && <CalendarView />}
          {active === "inventory" && <InventoryView items={inventoryList} setItems={setInventoryList} />}
          {active === "payments" && <PaymentsView invoices={invoices} />}
          {active === "staff" && <StaffView />}
          {active === "vendors" && <VendorsView vendors={vendorList} setVendors={setVendorList} />}
          {active === "notifications" && <NotificationsView unread={unread} />}
          {active === "followups" && <FollowUpsView />}
          {active === "gateways" && <GatewaysView />}
          {active === "mobile" && <MobileView />}
        </main>
      </div>
      <SiteFooter />
    </div>
  );
}

// ─── Section Views ────────────────────────────────────────

function OverviewView({ totals }: { totals: { leads: number; pipeline: number; totalRevenue: number; conflicts: number; quotations: number; invoices: number } }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-brand-primary/10 border border-brand-primary/10">
      {[
        { l: "Active leads", v: totals.leads.toString() },
        { l: "Pipeline value", v: `N$${totals.pipeline.toLocaleString()}` },
        { l: "Paid YTD", v: `N$${totals.totalRevenue.toLocaleString()}` },
        { l: "Quotations", v: totals.quotations.toString() },
        { l: "Invoices", v: totals.invoices.toString() },
        { l: "Inventory conflicts", v: totals.conflicts.toString() },
      ].map((k) => (
        <div key={k.l} className="bg-card p-6">
          <p className="text-[10px] uppercase tracking-widest text-brand-primary/40 mb-2">{k.l}</p>
          <p className="text-3xl font-serif">{k.v}</p>
        </div>
      ))}
    </div>
  );
}

function LeadsView() {
  return (
    <div className="bg-card p-8 border border-brand-primary/5 shadow-sm">
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
          {seedLeads.map((l) => (
            <tr key={l.id} className="border-t border-brand-primary/5 hover:bg-brand-bg/50">
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
  );
}

function QuotationsView({
  quotations,
  setQuotations,
  invoices,
  setInvoices,
}: {
  quotations: Quotation[];
  setQuotations: React.Dispatch<React.SetStateAction<Quotation[]>>;
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
}) {
  const [form, setForm] = useState({ client: "", type: "", guests: "", amount: "", date: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.client || !form.amount) return;
    const id = `Q-${1000 + quotations.length + 1}`;
    setQuotations((q) => [
      { id, client: form.client, type: form.type, guests: Number(form.guests) || 0, amount: Number(form.amount), date: form.date, status: "draft" },
      ...q,
    ]);
    setForm({ client: "", type: "", guests: "", amount: "", date: "" });
  };

  const convertToInvoice = (q: Quotation) => {
    if (q.invoiceId) return;
    const id = `INV-${3300 + invoices.length + 1}`;
    setInvoices((inv) => [{ id, client: q.client, amount: q.amount, date: q.date, status: "pending", quoteId: q.id }, ...inv]);
    setQuotations((qs) => qs.map((x) => (x.id === q.id ? { ...x, status: "invoiced", invoiceId: id } : x)));
  };

  return (
    <div className="space-y-6">
      <div className="bg-card p-8 border border-brand-primary/5 shadow-sm">
        <h3 className="text-lg font-serif italic mb-6">Generate quotation</h3>
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { k: "client", label: "Client name", type: "text" },
            { k: "type", label: "Event type", type: "text" },
            { k: "guests", label: "Guests", type: "number" },
            { k: "amount", label: "Amount (N$)", type: "number" },
            { k: "date", label: "Event date", type: "date" },
          ].map((f) => (
            <label key={f.k} className="block">
              <span className="text-[10px] uppercase tracking-widest text-brand-primary/50">{f.label}</span>
              <input
                required={f.k === "client" || f.k === "amount"}
                type={f.type}
                value={(form as any)[f.k]}
                onChange={(e) => setForm({ ...form, [f.k]: e.target.value })}
                className="mt-1 w-full border border-brand-primary/15 bg-brand-bg px-3 py-2 text-sm focus:outline-none focus:border-brand-accent"
              />
            </label>
          ))}
          <div className="md:col-span-2">
            <button type="submit" className="px-6 py-3 bg-brand-primary text-primary-foreground text-[10px] uppercase tracking-widest font-bold hover:bg-brand-accent transition-colors">
              + Generate quotation
            </button>
          </div>
        </form>
      </div>

      <div className="bg-card p-8 border border-brand-primary/5 shadow-sm">
        <h3 className="text-lg font-serif italic mb-6">All quotations</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-widest text-brand-primary/40 text-left">
              <th className="pb-3 font-medium">Quote</th>
              <th className="pb-3 font-medium">Client</th>
              <th className="pb-3 font-medium">Event</th>
              <th className="pb-3 font-medium">Amount</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {quotations.map((q) => (
              <tr key={q.id} className="border-t border-brand-primary/5">
                <td className="py-3 font-serif">{q.id}</td>
                <td className="py-3">{q.client}</td>
                <td className="py-3 text-brand-primary/70 text-xs">{q.type} · {q.date}</td>
                <td className="py-3 font-serif">N${q.amount.toLocaleString()}</td>
                <td className="py-3">
                  <span className="px-2 py-1 text-[9px] uppercase tracking-widest font-bold bg-brand-soft text-brand-primary/70">
                    {q.status}
                  </span>
                  {q.invoiceId && <span className="ml-2 text-[10px] text-brand-primary/50">→ {q.invoiceId}</span>}
                </td>
                <td className="py-3 text-right">
                  {q.invoiceId ? (
                    <span className="text-[10px] uppercase tracking-widest text-brand-primary/40">Linked</span>
                  ) : (
                    <button
                      onClick={() => convertToInvoice(q)}
                      className="text-[10px] uppercase tracking-widest font-bold text-brand-accent hover:underline"
                    >
                      → Invoice
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InvoicesView({ invoices, quotations }: { invoices: Invoice[]; quotations: Quotation[] }) {
  const quoteFor = (id?: string) => quotations.find((q) => q.id === id);
  return (
    <div className="bg-card p-8 border border-brand-primary/5 shadow-sm">
      <h3 className="text-lg font-serif italic mb-6">Invoices</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[10px] uppercase tracking-widest text-brand-primary/40 text-left">
            <th className="pb-3 font-medium">Invoice</th>
            <th className="pb-3 font-medium">Client</th>
            <th className="pb-3 font-medium">Linked quote</th>
            <th className="pb-3 font-medium">Date</th>
            <th className="pb-3 font-medium">Amount</th>
            <th className="pb-3 font-medium text-right">Status</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((p) => {
            const q = quoteFor(p.quoteId);
            return (
              <tr key={p.id} className="border-t border-brand-primary/5">
                <td className="py-3 font-serif">{p.id}</td>
                <td className="py-3">{p.client}</td>
                <td className="py-3 text-brand-primary/60 text-xs">
                  {p.quoteId ? `${p.quoteId}${q ? ` · ${q.type}` : ""}` : "—"}
                </td>
                <td className="py-3 text-brand-primary/60 text-xs">{p.date}</td>
                <td className="py-3 font-serif">N${p.amount.toLocaleString()}</td>
                <td className="py-3 text-right">
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
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function CalendarView() {
  return (
    <div className="bg-card p-8 border border-brand-primary/5 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-serif italic">September 2026</h3>
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
          const evt = seedLeads.find((l) => l.date === `2026-09-${String(day).padStart(2, "0")}`);
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
  );
}

function InventoryView({
  items,
  setItems,
}: {
  items: InventoryItem[];
  setItems: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
}) {
  const [form, setForm] = useState({ name: "", total: "", booked: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.total) return;
    setItems((it) => [...it, { name: form.name, total: Number(form.total), booked: Number(form.booked) || 0 }]);
    setForm({ name: "", total: "", booked: "" });
  };

  return (
    <div className="space-y-6">
      <div className="bg-card p-8 border border-brand-primary/5 shadow-sm">
        <h3 className="text-lg font-serif italic mb-6">Add inventory item</h3>
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="block">
            <span className="text-[10px] uppercase tracking-widest text-brand-primary/50">Item name</span>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full border border-brand-primary/15 bg-brand-bg px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-[10px] uppercase tracking-widest text-brand-primary/50">Total qty</span>
            <input required type="number" value={form.total} onChange={(e) => setForm({ ...form, total: e.target.value })} className="mt-1 w-full border border-brand-primary/15 bg-brand-bg px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-[10px] uppercase tracking-widest text-brand-primary/50">Booked qty</span>
            <input type="number" value={form.booked} onChange={(e) => setForm({ ...form, booked: e.target.value })} className="mt-1 w-full border border-brand-primary/15 bg-brand-bg px-3 py-2 text-sm" />
          </label>
          <div className="md:col-span-3">
            <button type="submit" className="px-6 py-3 bg-brand-primary text-primary-foreground text-[10px] uppercase tracking-widest font-bold hover:bg-brand-accent transition-colors">
              + Add item
            </button>
          </div>
        </form>
      </div>

      <div className="bg-card p-8 border border-brand-primary/5 shadow-sm">
        <h3 className="text-lg font-serif italic mb-6">Stock</h3>
        <div className="space-y-4">
          {items.map((item) => {
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
                  <div className={`h-full ${over ? "bg-destructive" : "bg-brand-primary"}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PaymentsView({ invoices }: { invoices: Invoice[] }) {
  return (
    <div className="bg-card p-8 border border-brand-primary/5 shadow-sm">
      <h3 className="text-lg font-serif italic mb-6">Payment tracking</h3>
      <table className="w-full text-sm">
        <tbody>
          {invoices.map((p) => (
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
  );
}

function StaffView() {
  return (
    <div className="bg-card p-8 border border-brand-primary/5 shadow-sm">
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
  );
}

function VendorsView({
  vendors,
  setVendors,
}: {
  vendors: Vendor[];
  setVendors: React.Dispatch<React.SetStateAction<Vendor[]>>;
}) {
  const [form, setForm] = useState({ name: "", category: "", rating: "5", status: "trial" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.category) return;
    setVendors((v) => [...v, { name: form.name, category: form.category, rating: Number(form.rating), jobs: 0, status: form.status }]);
    setForm({ name: "", category: "", rating: "5", status: "trial" });
  };

  return (
    <div className="space-y-6">
      <div className="bg-card p-8 border border-brand-primary/5 shadow-sm">
        <h3 className="text-lg font-serif italic mb-6">Add vendor</h3>
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-[10px] uppercase tracking-widest text-brand-primary/50">Vendor name</span>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full border border-brand-primary/15 bg-brand-bg px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-[10px] uppercase tracking-widest text-brand-primary/50">Category</span>
            <input required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="mt-1 w-full border border-brand-primary/15 bg-brand-bg px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-[10px] uppercase tracking-widest text-brand-primary/50">Rating</span>
            <input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} className="mt-1 w-full border border-brand-primary/15 bg-brand-bg px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-[10px] uppercase tracking-widest text-brand-primary/50">Status</span>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="mt-1 w-full border border-brand-primary/15 bg-brand-bg px-3 py-2 text-sm">
              <option value="trial">trial</option>
              <option value="active">active</option>
              <option value="preferred">preferred</option>
            </select>
          </label>
          <div className="md:col-span-2">
            <button type="submit" className="px-6 py-3 bg-brand-primary text-primary-foreground text-[10px] uppercase tracking-widest font-bold hover:bg-brand-accent transition-colors">
              + Add vendor
            </button>
          </div>
        </form>
      </div>

      <div className="bg-card p-8 border border-brand-primary/5 shadow-sm">
        <h3 className="text-lg font-serif italic mb-6">Vendor directory</h3>
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
  );
}

function NotificationsView({ unread }: { unread: number }) {
  return (
    <div className="bg-brand-primary p-8 text-primary-foreground">
      <div className="flex justify-between items-center mb-4">
        <p className="text-[10px] uppercase tracking-widest text-brand-accent">All notifications</p>
        <span className="text-[10px] bg-brand-accent text-accent-foreground px-2 py-0.5 font-bold">{unread} new</span>
      </div>
      <ul className="space-y-4">
        {notifications.map((n) => (
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
  );
}

function FollowUpsView() {
  return (
    <div className="bg-card p-8 border border-brand-primary/5 shadow-sm">
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
  );
}

function GatewaysView() {
  return (
    <div className="bg-card p-8 border border-brand-primary/5 shadow-sm">
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
  );
}

function MobileView() {
  return (
    <div className="bg-brand-soft p-8 border border-brand-primary/5 shadow-sm">
      <p className="text-[10px] uppercase tracking-widest text-brand-accent mb-3">Companion App</p>
      <h3 className="text-2xl font-serif italic mb-3">On-site mobile</h3>
      <p className="text-sm text-brand-primary/70 leading-relaxed mb-6 max-w-xl">
        Crew check-ins, install checklists, and live photo uploads — direct from the venue.
      </p>
      <div className="flex gap-2">
        <button className="px-6 py-3 bg-brand-primary text-primary-foreground text-[10px] uppercase tracking-widest font-bold">iOS Beta</button>
        <button className="px-6 py-3 border border-brand-primary/20 text-[10px] uppercase tracking-widest font-bold">Android</button>
      </div>
    </div>
  );
}
