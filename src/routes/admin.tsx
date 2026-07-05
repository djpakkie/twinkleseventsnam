import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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
import { Eye, Pencil, Download, Mail, FileText, Search, Plus, Trash2, User } from "lucide-react";
import { ClientSelect, fullName, type Client } from "@/components/ClientSelect";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  downloadQuotationPDF,
  downloadInvoicePDF,
  viewInvoicePDF,
  downloadStatementPDF,
  viewStatementPDF,
} from "@/lib/pdf";

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
  | "clients"
  | "quotations"
  | "invoices"
  | "statements"
  | "calendar"
  | "inventory"
  | "event-types"
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
  { id: "clients", label: "Clients" },
  { id: "quotations", label: "Quotations" },
  { id: "invoices", label: "Invoices" },
  { id: "statements", label: "Statements" },
  { id: "calendar", label: "Calendar" },
  { id: "inventory", label: "Inventory" },
  { id: "event-types", label: "Event types" },
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
            <div className="flex items-center gap-4">
              <a href="/dashboard" className="text-xs uppercase tracking-widest border border-brand-primary/20 px-3 py-2 hover:bg-brand-bg">
                Live dashboard →
              </a>
              <span className="text-xs text-brand-primary/40">Last updated · 14:02</span>
            </div>
          </div>


          {active === "overview" && (
            <OverviewView
              totals={{ leads: seedLeads.length, pipeline, totalRevenue, conflicts: conflicts.length, quotations: quotations.length, invoices: invoices.length }}
            />
          )}
          {active === "leads" && <LeadsView />}
          {active === "clients" && <ClientsView />}
          {active === "quotations" && (
            <QuotationsView
              quotations={quotations}
              setQuotations={setQuotations}
              invoices={invoices}
              setInvoices={setInvoices}
            />
          )}
          {active === "invoices" && <InvoicesView invoices={invoices} quotations={quotations} />}
          {active === "statements" && <StatementsView invoices={invoices} />}
          {active === "calendar" && <CalendarView />}
          {active === "inventory" && <InventoryView items={inventoryList} setItems={setInventoryList} />}
          {active === "event-types" && <EventTypesView />}
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
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<Quotation | null>(null);
  const [editForm, setEditForm] = useState({ client: "", type: "", guests: "", amount: "", date: "", status: "draft" as Quotation["status"] });

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

  const openView = (q: Quotation) => {
    setSelected(q);
    setViewOpen(true);
  };

  const openEdit = (q: Quotation) => {
    setSelected(q);
    setEditForm({ client: q.client, type: q.type, guests: String(q.guests), amount: String(q.amount), date: q.date, status: q.status });
    setEditOpen(true);
  };

  const saveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setQuotations((qs) =>
      qs.map((x) =>
        x.id === selected.id
          ? { ...x, client: editForm.client, type: editForm.type, guests: Number(editForm.guests) || 0, amount: Number(editForm.amount), date: editForm.date, status: editForm.status }
          : x
      )
    );
    setEditOpen(false);
  };

  const downloadQuotation = (q: Quotation) => downloadQuotationPDF(q);

  const quoteStatusStyles: Record<string, string> = {
    draft: "bg-brand-soft text-brand-primary/70",
    sent: "bg-amber-50 text-amber-800",
    accepted: "bg-green-50 text-green-700",
    invoiced: "bg-brand-primary text-primary-foreground",
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
              <th className="pb-3 font-medium text-right">Actions</th>
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
                  <span className={`px-2 py-1 text-[9px] uppercase tracking-widest font-bold ${quoteStatusStyles[q.status] || "bg-brand-soft"}`}>
                    {q.status}
                  </span>
                  {q.invoiceId && <span className="ml-2 text-[10px] text-brand-primary/50">→ {q.invoiceId}</span>}
                </td>
                <td className="py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openView(q)} className="p-1.5 hover:bg-brand-bg rounded transition-colors" title="View">
                      <Eye className="size-3.5 text-brand-primary/60" />
                    </button>
                    <button onClick={() => openEdit(q)} className="p-1.5 hover:bg-brand-bg rounded transition-colors" title="Edit">
                      <Pencil className="size-3.5 text-brand-primary/60" />
                    </button>
                    <button onClick={() => downloadQuotation(q)} className="p-1.5 hover:bg-brand-bg rounded transition-colors" title="Download">
                      <Download className="size-3.5 text-brand-primary/60" />
                    </button>
                    {q.invoiceId ? (
                      <span className="text-[10px] uppercase tracking-widest text-brand-primary/40 ml-1">Linked</span>
                    ) : (
                      <button
                        onClick={() => convertToInvoice(q)}
                        className="text-[10px] uppercase tracking-widest font-bold text-brand-accent hover:underline ml-1"
                      >
                        → Invoice
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif italic">Quotation {selected?.id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-brand-primary/10 pb-2">
              <span className="text-[10px] uppercase tracking-widest text-brand-primary/50">Client</span>
              <span className="font-serif">{selected?.client}</span>
            </div>
            <div className="flex justify-between border-b border-brand-primary/10 pb-2">
              <span className="text-[10px] uppercase tracking-widest text-brand-primary/50">Event Type</span>
              <span>{selected?.type}</span>
            </div>
            <div className="flex justify-between border-b border-brand-primary/10 pb-2">
              <span className="text-[10px] uppercase tracking-widest text-brand-primary/50">Guests</span>
              <span>{selected?.guests}</span>
            </div>
            <div className="flex justify-between border-b border-brand-primary/10 pb-2">
              <span className="text-[10px] uppercase tracking-widest text-brand-primary/50">Event Date</span>
              <span>{selected?.date}</span>
            </div>
            <div className="flex justify-between border-b border-brand-primary/10 pb-2">
              <span className="text-[10px] uppercase tracking-widest text-brand-primary/50">Status</span>
              <span className={`px-2 py-0.5 text-[9px] uppercase tracking-widest font-bold ${selected ? quoteStatusStyles[selected.status] : ""}`}>{selected?.status}</span>
            </div>
            {selected?.invoiceId && (
              <div className="flex justify-between border-b border-brand-primary/10 pb-2">
                <span className="text-[10px] uppercase tracking-widest text-brand-primary/50">Linked Invoice</span>
                <span className="font-serif text-brand-accent">{selected.invoiceId}</span>
              </div>
            )}
            <div className="flex justify-between pt-2">
              <span className="text-[10px] uppercase tracking-widest text-brand-primary/50">Amount</span>
              <span className="font-serif text-lg italic">N${selected?.amount.toLocaleString()}</span>
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => selected && downloadQuotation(selected)} className="px-4 py-2 bg-brand-primary text-primary-foreground text-[10px] uppercase tracking-widest font-bold hover:bg-brand-accent transition-colors">
              Download
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif italic">Edit Quotation {selected?.id}</DialogTitle>
          </DialogHeader>
          <form onSubmit={saveEdit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-[10px] uppercase tracking-widest text-brand-primary/50">Client name</span>
                <input required value={editForm.client} onChange={(e) => setEditForm({ ...editForm, client: e.target.value })} className="mt-1 w-full border border-brand-primary/15 bg-brand-bg px-3 py-2 text-sm focus:outline-none focus:border-brand-accent" />
              </label>
              <label className="block">
                <span className="text-[10px] uppercase tracking-widest text-brand-primary/50">Event type</span>
                <input value={editForm.type} onChange={(e) => setEditForm({ ...editForm, type: e.target.value })} className="mt-1 w-full border border-brand-primary/15 bg-brand-bg px-3 py-2 text-sm focus:outline-none focus:border-brand-accent" />
              </label>
              <label className="block">
                <span className="text-[10px] uppercase tracking-widest text-brand-primary/50">Guests</span>
                <input type="number" value={editForm.guests} onChange={(e) => setEditForm({ ...editForm, guests: e.target.value })} className="mt-1 w-full border border-brand-primary/15 bg-brand-bg px-3 py-2 text-sm focus:outline-none focus:border-brand-accent" />
              </label>
              <label className="block">
                <span className="text-[10px] uppercase tracking-widest text-brand-primary/50">Amount (N$)</span>
                <input required type="number" value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} className="mt-1 w-full border border-brand-primary/15 bg-brand-bg px-3 py-2 text-sm focus:outline-none focus:border-brand-accent" />
              </label>
              <label className="block">
                <span className="text-[10px] uppercase tracking-widest text-brand-primary/50">Event date</span>
                <input type="date" value={editForm.date} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} className="mt-1 w-full border border-brand-primary/15 bg-brand-bg px-3 py-2 text-sm focus:outline-none focus:border-brand-accent" />
              </label>
              <label className="block">
                <span className="text-[10px] uppercase tracking-widest text-brand-primary/50">Status</span>
                <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value as Quotation["status"] })} className="mt-1 w-full border border-brand-primary/15 bg-brand-bg px-3 py-2 text-sm focus:outline-none focus:border-brand-accent">
                  <option value="draft">draft</option>
                  <option value="sent">sent</option>
                  <option value="accepted">accepted</option>
                  <option value="invoiced">invoiced</option>
                </select>
              </label>
            </div>
            <DialogFooter>
              <button type="submit" className="px-6 py-3 bg-brand-primary text-primary-foreground text-[10px] uppercase tracking-widest font-bold hover:bg-brand-accent transition-colors">
                Save changes
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InvoicesView({ invoices, quotations }: { invoices: Invoice[]; quotations: Quotation[] }) {
  const quoteFor = (id?: string) => quotations.find((q) => q.id === id);

  const clientOutstanding = (client: string) => {
    const inv = invoices.filter((i) => i.client === client);
    const total = inv.reduce((s, i) => s + i.amount, 0);
    const paid = inv.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);
    return total - paid;
  };

  const downloadClientStatement = (client: string) => {
    const inv = invoices.filter((i) => i.client === client);
    downloadStatementPDF({
      client,
      period: `${new Date().getFullYear()} — YTD`,
      lines: inv.map((i) => ({
        id: i.id,
        date: i.date,
        description: `Invoice ${i.quoteId ? `(quote ${i.quoteId})` : ""}`.trim(),
        amount: i.amount,
        status: i.status,
      })),
    });
  };

  const emailInvoice = (p: Invoice) => {
    downloadInvoicePDF(p);
    const to = window.prompt(`Email invoice ${p.id} to:`, "") ?? "";
    const subject = encodeURIComponent(`Invoice ${p.id} — Twinkles Events Namibia`);
    const body = encodeURIComponent(
      `Dear ${p.client},\n\nPlease find attached invoice ${p.id} dated ${p.date} for N$${p.amount.toLocaleString()}.\n\n(The PDF has been downloaded to your device — please attach it before sending.)\n\nKind regards,\nTwinkles Events Namibia`,
    );
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  };

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
            <th className="pb-3 font-medium">Status</th>
            <th className="pb-3 font-medium">Statement</th>
            <th className="pb-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((p) => {
            const q = quoteFor(p.quoteId);
            const outstanding = clientOutstanding(p.client);
            return (
              <tr key={p.id} className="border-t border-brand-primary/5">
                <td className="py-3 font-serif">{p.id}</td>
                <td className="py-3">{p.client}</td>
                <td className="py-3 text-brand-primary/60 text-xs">
                  {p.quoteId ? `${p.quoteId}${q ? ` · ${q.type}` : ""}` : "—"}
                </td>
                <td className="py-3 text-brand-primary/60 text-xs">{p.date}</td>
                <td className="py-3 font-serif">N${p.amount.toLocaleString()}</td>
                <td className="py-3">
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
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <span className={`font-serif text-xs ${outstanding > 0 ? "text-brand-accent" : "text-green-700"}`}>
                      N${outstanding.toLocaleString()}
                    </span>
                    <button
                      onClick={() => downloadClientStatement(p.client)}
                      className="p-1 hover:bg-brand-bg rounded transition-colors"
                      title="Download client statement"
                    >
                      <FileText className="size-3.5 text-brand-primary/60" />
                    </button>
                  </div>
                </td>
                <td className="py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => viewInvoicePDF(p)}
                      className="p-1.5 hover:bg-brand-bg rounded transition-colors"
                      title="View invoice PDF"
                    >
                      <Eye className="size-3.5 text-brand-primary/60" />
                    </button>
                    <button
                      onClick={() => downloadInvoicePDF(p)}
                      className="p-1.5 hover:bg-brand-bg rounded transition-colors"
                      title="Download invoice PDF"
                    >
                      <Download className="size-3.5 text-brand-primary/60" />
                    </button>
                    <button
                      onClick={() => emailInvoice(p)}
                      className="p-1.5 hover:bg-brand-bg rounded transition-colors"
                      title="Email invoice"
                    >
                      <Mail className="size-3.5 text-brand-primary/60" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function StatementsView({ invoices }: { invoices: Invoice[] }) {
  const clients = Array.from(new Set(invoices.map((i) => i.client))).sort();
  const [client, setClient] = useState(clients[0] ?? "");
  const [period, setPeriod] = useState(`${new Date().getFullYear()} — YTD`);

  const clientInvoices = invoices.filter((i) => i.client === client);
  const total = clientInvoices.reduce((s, i) => s + i.amount, 0);
  const paid = clientInvoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const outstanding = total - paid;

  const statementOpts = () => ({
    client,
    period,
    lines: clientInvoices.map((i) => ({
      id: i.id,
      date: i.date,
      description: `Invoice ${i.quoteId ? `(quote ${i.quoteId})` : ""}`.trim(),
      amount: i.amount,
      status: i.status,
    })),
  });

  const generate = () => {
    if (!client) return;
    downloadStatementPDF(statementOpts());
  };

  const view = () => {
    if (!client) return;
    viewStatementPDF(statementOpts());
  };

  const email = () => {
    if (!client) return;
    downloadStatementPDF(statementOpts());
    const to = window.prompt(`Email statement to ${client}:`, "") ?? "";
    const subject = encodeURIComponent(`Statement of Account — ${client}`);
    const body = encodeURIComponent(
      `Dear ${client},\n\nPlease find attached your statement of account for ${period}.\nOutstanding balance: N$${outstanding.toLocaleString()}.\n\n(The PDF has been downloaded — please attach it before sending.)\n\nKind regards,\nTwinkles Events Namibia`,
    );
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-card p-8 border border-brand-primary/5 shadow-sm">
        <h3 className="text-lg font-serif italic mb-6">Generate statement</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="block">
            <span className="text-[10px] uppercase tracking-widest text-brand-primary/50">Client</span>
            <select
              value={client}
              onChange={(e) => setClient(e.target.value)}
              className="mt-1 w-full border border-brand-primary/15 bg-brand-bg px-3 py-2 text-sm focus:outline-none focus:border-brand-accent"
            >
              {clients.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-[10px] uppercase tracking-widest text-brand-primary/50">Period</span>
            <input
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="mt-1 w-full border border-brand-primary/15 bg-brand-bg px-3 py-2 text-sm focus:outline-none focus:border-brand-accent"
            />
          </label>
          <div className="flex items-end gap-2">
            <button
              onClick={view}
              disabled={!client}
              className="flex-1 px-3 py-2.5 border border-brand-primary/20 text-[10px] uppercase tracking-widest font-bold hover:bg-brand-bg transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-1"
              title="View PDF"
            >
              <Eye className="size-3.5" /> View
            </button>
            <button
              onClick={generate}
              disabled={!client}
              className="flex-1 px-3 py-2.5 bg-brand-primary text-primary-foreground text-[10px] uppercase tracking-widest font-bold hover:bg-brand-accent transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-1"
              title="Download PDF"
            >
              <Download className="size-3.5" /> Download
            </button>
            <button
              onClick={email}
              disabled={!client}
              className="flex-1 px-3 py-2.5 border border-brand-primary/20 text-[10px] uppercase tracking-widest font-bold hover:bg-brand-bg transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-1"
              title="Email statement"
            >
              <Mail className="size-3.5" /> Email
            </button>
          </div>
        </div>
      </div>


      <div className="bg-card p-8 border border-brand-primary/5 shadow-sm">
        <div className="flex items-end justify-between mb-6">
          <h3 className="text-lg font-serif italic">{client || "—"} · Preview</h3>
          <div className="flex gap-6 text-xs">
            <div><p className="text-[10px] uppercase tracking-widest text-brand-primary/40">Invoiced</p><p className="font-serif text-lg">N${total.toLocaleString()}</p></div>
            <div><p className="text-[10px] uppercase tracking-widest text-brand-primary/40">Paid</p><p className="font-serif text-lg text-green-700">N${paid.toLocaleString()}</p></div>
            <div><p className="text-[10px] uppercase tracking-widest text-brand-primary/40">Outstanding</p><p className="font-serif text-lg text-brand-accent">N${outstanding.toLocaleString()}</p></div>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-widest text-brand-primary/40 text-left">
              <th className="pb-3 font-medium">Ref</th>
              <th className="pb-3 font-medium">Date</th>
              <th className="pb-3 font-medium">Amount</th>
              <th className="pb-3 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {clientInvoices.map((i) => (
              <tr key={i.id} className="border-t border-brand-primary/5">
                <td className="py-3 font-serif">{i.id}</td>
                <td className="py-3 text-brand-primary/60 text-xs">{i.date}</td>
                <td className="py-3 font-serif">N${i.amount.toLocaleString()}</td>
                <td className="py-3 text-right">
                  <span
                    className={`px-2 py-1 text-[9px] uppercase tracking-widest font-bold ${
                      i.status === "paid"
                        ? "bg-green-50 text-green-700"
                        : i.status === "due"
                        ? "bg-amber-50 text-amber-800"
                        : "bg-brand-soft"
                    }`}
                  >
                    {i.status}
                  </span>
                </td>
              </tr>
            ))}
            {clientInvoices.length === 0 && (
              <tr><td colSpan={4} className="py-6 text-center text-brand-primary/40 text-xs">No invoices for this client.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CalendarView() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [cursor, setCursor] = useState(new Date());
  const [selected, setSelected] = useState<any | null>(null);

  const fetchBookings = async () => {
    const { data } = await supabase
      .from("bookings")
      .select("*, services(name)")
      .order("event_date", { ascending: true });
    setBookings(data ?? []);
  };

  useEffect(() => {
    fetchBookings();
    // Poll for updates instead of using Realtime (bookings contain PII
    // and are no longer published to the realtime channel).
    const interval = setInterval(fetchBookings, 30000);
    return () => clearInterval(interval);
  }, []);


  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Mon-first offset
  const startOffset = (first.getDay() + 6) % 7;
  const monthLabel = cursor.toLocaleString("default", { month: "long", year: "numeric" });

  const statusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-500 text-white";
      case "completed": return "bg-blue-500 text-white";
      case "cancelled": return "bg-red-500 text-white";
      default: return "bg-amber-400 text-black"; // pending / quoted
    }
  };

  const eventsOnDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return bookings.filter((b) => {
      const start = b.event_date;
      const end = b.event_end_date ?? b.event_date;
      return dateStr >= start && dateStr <= end;
    });
  };

  return (
    <div className="bg-card p-8 border border-brand-primary/5 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-serif italic">{monthLabel}</h3>
        <div className="flex gap-2">
          <button onClick={() => setCursor(new Date(year, month - 1, 1))} className="px-3 py-1 text-xs border border-brand-primary/10">‹</button>
          <button onClick={() => setCursor(new Date())} className="px-3 py-1 text-xs border border-brand-primary/10">Today</button>
          <button onClick={() => setCursor(new Date(year, month + 1, 1))} className="px-3 py-1 text-xs border border-brand-primary/10">›</button>
        </div>
      </div>

      <div className="flex gap-4 mb-4 text-[10px] uppercase tracking-widest text-brand-primary/60 flex-wrap">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" />Pending</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" />Confirmed</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" />Completed</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" />Cancelled</span>
      </div>

      <div className="grid grid-cols-7 gap-px bg-brand-primary/5">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="bg-card p-2 text-[10px] uppercase tracking-widest text-brand-primary/40 text-center">
            {d}
          </div>
        ))}
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`pad-${i}`} className="bg-card aspect-square" />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const events = eventsOnDay(day);
          return (
            <div key={day} className="bg-card aspect-square p-1.5 text-xs relative overflow-hidden">
              <span className="text-brand-primary/40">{day}</span>
              <div className="mt-1 space-y-0.5">
                {events.slice(0, 3).map((ev) => {
                  const type = ev.event_type || ev.services?.name || "Event";
                  return (
                    <button
                      key={ev.id}
                      onClick={() => setSelected(ev)}
                      className={`w-full text-left text-[9px] px-1 py-0.5 truncate rounded ${statusColor(ev.status)}`}
                      title={`${ev.client_name} - ${type}`}
                    >
                      {ev.client_name.split(" ")[0]} · {type}
                    </button>
                  );
                })}
                {events.length > 3 && (
                  <span className="text-[9px] text-brand-primary/50">+{events.length - 3}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif italic">
              {selected?.client_name} — {selected?.event_type || selected?.services?.name || "Event"}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <Row label="Client" value={selected.client_name} />
              <Row label="Phone" value={selected.client_phone || "—"} />
              <Row label="Event type" value={selected.event_type || selected.services?.name || "—"} />
              <Row label="Venue" value={selected.venue || "—"} />
              <Row label="Guests" value={String(selected.guest_count ?? 0)} />
              <Row label="Date" value={selected.event_date + (selected.event_end_date ? ` → ${selected.event_end_date}` : "")} />
              <Row label="Status" value={<span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase ${statusColor(selected.status)}`}>{selected.status}</span>} />
              <div>
                <span className="block text-[10px] uppercase tracking-widest text-brand-primary/50 mb-1">Notes</span>
                <p className="text-sm whitespace-pre-wrap">{selected.notes || selected.special_requirements || "—"}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-[10px] uppercase tracking-widest text-brand-primary/50">{label}</span>
      <span className="text-sm text-right">{value}</span>
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

function EventTypesView() {
  type ET = {
    id: string; name: string; slug: string; description: string | null;
    default_service_id: string | null; archived: boolean; sort_order: number;
  };
  type Svc = { id: string; name: string };
  const [items, setItems] = useState<ET[]>([]);
  const [services, setServices] = useState<Svc[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [editing, setEditing] = useState<Partial<ET> | null>(null);
  const [search, setSearch] = useState("");

  async function refresh() {
    const { data } = await supabase.from("event_types").select("*").order("sort_order");
    setItems((data ?? []) as ET[]);
  }
  useEffect(() => {
    refresh();
    supabase.from("services").select("id,name").eq("active", true).order("sort_order").then(({ data }) => {
      setServices((data ?? []) as Svc[]);
    });
  }, []);

  async function save() {
    if (!editing?.name) return;
    const payload = {
      name: editing.name!.trim(),
      slug: (editing.slug || editing.name!).toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      description: editing.description || null,
      default_service_id: editing.default_service_id || null,
      sort_order: editing.sort_order ?? (items.length + 1) * 10,
      archived: editing.archived ?? false,
    };
    const { error } = editing.id
      ? await supabase.from("event_types").update(payload).eq("id", editing.id)
      : await supabase.from("event_types").insert(payload);
    if (error) { alert(error.message); return; }
    setEditing(null);
    refresh();
  }

  async function setArchived(id: string, archived: boolean) {
    const { error } = await supabase.from("event_types").update({ archived }).eq("id", id);
    if (error) { alert(error.message); return; }
    refresh();
  }

  const filtered = items
    .filter((t) => showArchived || !t.archived)
    .filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search event types…"
          className="px-3 py-2 border border-brand-primary/15 text-sm flex-1 min-w-[200px] bg-transparent"
        />
        <label className="flex items-center gap-2 text-xs text-brand-primary/70">
          <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />
          Show archived
        </label>
        <button
          onClick={() => setEditing({ name: "", description: "", archived: false })}
          className="px-4 py-2 bg-brand-primary text-primary-foreground text-[10px] uppercase tracking-widest font-bold hover:bg-brand-accent"
        >
          + Add event type
        </button>
      </div>

      <div className="border border-brand-primary/10 bg-card">
        <div className="grid grid-cols-[1fr_1fr_120px_120px] gap-4 px-4 py-3 text-[10px] uppercase tracking-widest text-brand-primary/60 border-b border-brand-primary/10">
          <span>Name</span>
          <span>Default package</span>
          <span>Status</span>
          <span className="text-right">Actions</span>
        </div>
        {filtered.length === 0 && (
          <div className="px-4 py-8 text-sm text-brand-primary/50">No event types match.</div>
        )}
        {filtered.map((t) => {
          const svc = services.find((s) => s.id === t.default_service_id);
          return (
            <div key={t.id} className="grid grid-cols-[1fr_1fr_120px_120px] gap-4 px-4 py-3 text-sm border-b border-brand-primary/5 items-center">
              <div>
                <p className={t.archived ? "line-through text-brand-primary/50" : ""}>{t.name}</p>
                {t.description && <p className="text-xs text-brand-primary/50 mt-0.5">{t.description}</p>}
              </div>
              <span className="text-brand-primary/70">{svc?.name ?? <span className="text-brand-primary/30">—</span>}</span>
              <span className={`text-[10px] uppercase tracking-widest font-bold ${t.archived ? "text-brand-primary/40" : "text-green-700"}`}>
                {t.archived ? "Archived" : "Active"}
              </span>
              <div className="flex justify-end gap-3 text-xs">
                <button onClick={() => setEditing(t)} className="hover:text-brand-accent underline-offset-4 hover:underline">Edit</button>
                <button onClick={() => setArchived(t.id, !t.archived)} className="hover:text-brand-accent underline-offset-4 hover:underline">
                  {t.archived ? "Restore" : "Archive"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit event type" : "New event type"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <label className="block">
              <span className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Name</span>
              <input
                value={editing?.name ?? ""}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                className="w-full px-3 py-2 border border-brand-primary/15 bg-transparent text-sm"
              />
            </label>
            <label className="block">
              <span className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Description (optional)</span>
              <textarea
                rows={2}
                value={editing?.description ?? ""}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                className="w-full px-3 py-2 border border-brand-primary/15 bg-transparent text-sm"
              />
            </label>
            <label className="block">
              <span className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Default decoration package</span>
              <select
                value={editing?.default_service_id ?? ""}
                onChange={(e) => setEditing({ ...editing, default_service_id: e.target.value || null })}
                className="w-full px-3 py-2 border border-brand-primary/15 bg-transparent text-sm"
              >
                <option value="">— None —</option>
                {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Sort order</span>
              <input
                type="number"
                value={editing?.sort_order ?? 0}
                onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 border border-brand-primary/15 bg-transparent text-sm"
              />
            </label>
          </div>
          <DialogFooter>
            <button onClick={() => setEditing(null)} className="px-4 py-2 text-xs uppercase tracking-widest">Cancel</button>
            <button onClick={save} className="px-4 py-2 bg-brand-primary text-primary-foreground text-xs uppercase tracking-widest font-bold">Save</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ Clients ============

type ClientRow = Client;

function ClientsView() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);

  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("*").order("first_name");
      if (error) throw error;
      return (data ?? []) as ClientRow[];
    },
  });

  const filtered = (clients ?? []).filter((c) => {
    const n = q.trim().toLowerCase();
    if (!n) return true;
    return [fullName(c), c.company_name ?? "", c.email ?? "", c.phone ?? "", c.alt_phone ?? ""]
      .join(" ")
      .toLowerCase()
      .includes(n);
  });

  async function deleteClient(id: string) {
    if (!confirm("Delete this client? Their historical bookings, quotations, and invoices will be kept but unlinked.")) return;
    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (error) { alert(error.message); return; }
    qc.invalidateQueries({ queryKey: ["clients"] });
  }

  return (
    <div className="space-y-6">
      <div className="bg-card p-8 border border-brand-primary/5 shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-serif italic">Client directory</h3>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-primary text-primary-foreground text-[10px] uppercase tracking-widest font-bold hover:bg-brand-accent transition-colors"
          >
            <Plus className="size-3.5" /> Add client
          </button>
        </div>
        <div className="flex items-center gap-2 border border-brand-primary/15 bg-brand-bg px-3 py-2 mb-6 max-w-md">
          <Search className="size-3.5 text-brand-primary/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, phone, email, or company…"
            className="flex-1 bg-transparent text-sm outline-none"
          />
        </div>
        {filtered.length === 0 ? (
          <p className="text-sm text-brand-primary/60 py-8 text-center">
            {clients?.length ? "No clients match your search." : "No clients yet. Add your first client above."}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-brand-primary/40 text-left">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Company</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Phone</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-t border-brand-primary/5">
                  <td className="py-3">
                    <button
                      onClick={() => setProfileId(c.id)}
                      className="font-serif hover:text-brand-accent transition-colors"
                    >
                      {fullName(c) || "—"}
                    </button>
                  </td>
                  <td className="py-3 text-brand-primary/70">{c.company_name || "—"}</td>
                  <td className="py-3 text-brand-primary/70">{c.email || "—"}</td>
                  <td className="py-3 text-brand-primary/70">{c.phone || "—"}</td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setProfileId(c.id)}
                        className="p-1.5 hover:bg-brand-bg rounded transition-colors"
                        title="View profile"
                      >
                        <User className="size-3.5 text-brand-primary/60" />
                      </button>
                      <button
                        onClick={() => deleteClient(c.id)}
                        className="p-1.5 hover:bg-brand-bg rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="size-3.5 text-brand-primary/60" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AddClientDialog open={addOpen} onOpenChange={setAddOpen} onCreated={(c) => setProfileId(c.id)} />
      <ClientProfileDialog clientId={profileId} onOpenChange={(v) => !v && setProfileId(null)} />
    </div>
  );
}

function AddClientDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated?: (c: ClientRow) => void;
}) {
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    first_name: "", last_name: "", company_name: "", phone: "", alt_phone: "",
    email: "", physical_address: "", notes: "",
  });

  useEffect(() => {
    if (open) {
      setForm({ first_name: "", last_name: "", company_name: "", phone: "", alt_phone: "", email: "", physical_address: "", notes: "" });
    }
  }, [open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.first_name.trim()) return;
    setSaving(true);
    const { data, error } = await supabase.from("clients").insert({
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      company_name: form.company_name.trim() || null,
      phone: form.phone.trim() || null,
      alt_phone: form.alt_phone.trim() || null,
      email: form.email.trim() || null,
      physical_address: form.physical_address.trim() || null,
      notes: form.notes.trim() || null,
    }).select("*").single();
    setSaving(false);
    if (error) { alert(error.message); return; }
    qc.invalidateQueries({ queryKey: ["clients"] });
    onCreated?.(data as ClientRow);
    onOpenChange(false);
  }

  const inputCls = "mt-1 w-full border border-brand-primary/15 bg-brand-bg px-3 py-2 text-sm focus:outline-none focus:border-brand-accent";
  const labelCls = "text-[10px] uppercase tracking-widest text-brand-primary/50";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-serif italic">Add client</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label><span className={labelCls}>First name *</span>
            <input required value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} className={inputCls} /></label>
          <label><span className={labelCls}>Last name</span>
            <input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} className={inputCls} /></label>
          <label><span className={labelCls}>Company</span>
            <input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} className={inputCls} /></label>
          <label><span className={labelCls}>Email</span>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} /></label>
          <label><span className={labelCls}>Phone</span>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} /></label>
          <label><span className={labelCls}>Alternative phone</span>
            <input value={form.alt_phone} onChange={(e) => setForm({ ...form, alt_phone: e.target.value })} className={inputCls} /></label>
          <label className="md:col-span-2"><span className={labelCls}>Physical address</span>
            <input value={form.physical_address} onChange={(e) => setForm({ ...form, physical_address: e.target.value })} className={inputCls} /></label>
          <label className="md:col-span-2"><span className={labelCls}>Notes</span>
            <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputCls + " resize-none"} /></label>
          <DialogFooter className="md:col-span-2">
            <button type="submit" disabled={saving} className="px-6 py-3 bg-brand-primary text-primary-foreground text-[10px] uppercase tracking-widest font-bold hover:bg-brand-accent transition-colors disabled:opacity-60">
              {saving ? "Saving…" : "Save client"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ClientProfileDialog({
  clientId,
  onOpenChange,
}: {
  clientId: string | null;
  onOpenChange: (v: boolean) => void;
}) {
  const open = !!clientId;

  const { data: client } = useQuery({
    queryKey: ["client", clientId],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("*").eq("id", clientId!).single();
      if (error) throw error;
      return data as ClientRow;
    },
    enabled: !!clientId,
  });

  const { data: bookings } = useQuery({
    queryKey: ["client-bookings", clientId],
    queryFn: async () => {
      const { data, error } = await supabase.from("bookings").select("*").eq("client_id", clientId!).order("event_date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!clientId,
  });

  const { data: quotations } = useQuery({
    queryKey: ["client-quotations", clientId],
    queryFn: async () => {
      const { data, error } = await supabase.from("quotations").select("*").eq("client_id", clientId!).order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!clientId,
  });

  const { data: invoices } = useQuery({
    queryKey: ["client-invoices", clientId],
    queryFn: async () => {
      const { data, error } = await supabase.from("invoices").select("*").eq("client_id", clientId!).order("issued_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!clientId,
  });

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = (bookings ?? []).filter((b: any) => b.event_date && b.event_date >= today);
  const totalRevenue = (invoices ?? [])
    .filter((i: any) => i.status === "paid")
    .reduce((s: number, i: any) => s + Number(i.amount_paid || i.amount || 0), 0);
  const outstanding = (invoices ?? [])
    .reduce((s: number, i: any) => s + Math.max(0, Number(i.amount || 0) - Number(i.amount_paid || 0)), 0);

  const nad = (n: number) => `N$${Math.round(n).toLocaleString()}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif italic text-2xl">
            {client ? fullName(client) : "Client profile"}
          </DialogTitle>
        </DialogHeader>
        {!client ? (
          <p className="text-sm text-brand-primary/60 py-8 text-center">Loading…</p>
        ) : (
          <div className="space-y-6">
            {/* Contact */}
            <section className="bg-brand-bg p-5 border border-brand-primary/5">
              <p className="eyebrow mb-3">Contact information</p>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <ProfileField label="Company" value={client.company_name} />
                <ProfileField label="Email" value={client.email} />
                <ProfileField label="Phone" value={client.phone} />
                <ProfileField label="Alt. phone" value={client.alt_phone} />
                <ProfileField label="Address" value={client.physical_address} span2 />
                <ProfileField label="Notes" value={client.notes} span2 />
              </div>
            </section>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Kpi label="Bookings" value={String(bookings?.length ?? 0)} />
              <Kpi label="Quotations" value={String(quotations?.length ?? 0)} />
              <Kpi label="Invoices" value={String(invoices?.length ?? 0)} />
              <Kpi label="Total revenue" value={nad(totalRevenue)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Kpi label="Upcoming events" value={String(upcoming.length)} />
              <Kpi label="Outstanding balance" value={nad(outstanding)} tone={outstanding > 0 ? "warn" : undefined} />
            </div>

            {/* Bookings history */}
            <section>
              <h4 className="text-sm font-serif italic mb-2">Bookings history</h4>
              {(bookings?.length ?? 0) === 0 ? (
                <p className="text-xs text-brand-primary/50 py-3">No bookings yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-widest text-brand-primary/40 text-left">
                      <th className="pb-2 font-medium">Event type</th>
                      <th className="pb-2 font-medium">Date</th>
                      <th className="pb-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings!.map((b: any) => (
                      <tr key={b.id} className="border-t border-brand-primary/5">
                        <td className="py-2">{b.event_type || "—"}</td>
                        <td className="py-2 text-brand-primary/70">{b.event_date}</td>
                        <td className="py-2"><StatusPill status={b.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            {/* Quotations history */}
            <section>
              <h4 className="text-sm font-serif italic mb-2">Quotations history</h4>
              {(quotations?.length ?? 0) === 0 ? (
                <p className="text-xs text-brand-primary/50 py-3">No quotations yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-widest text-brand-primary/40 text-left">
                      <th className="pb-2 font-medium">Quote #</th>
                      <th className="pb-2 font-medium">Amount</th>
                      <th className="pb-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotations!.map((q: any) => (
                      <tr key={q.id} className="border-t border-brand-primary/5">
                        <td className="py-2 font-serif">{q.quote_number}</td>
                        <td className="py-2">{nad(Number(q.amount))}</td>
                        <td className="py-2"><StatusPill status={q.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            {/* Invoices history */}
            <section>
              <h4 className="text-sm font-serif italic mb-2">Invoices history</h4>
              {(invoices?.length ?? 0) === 0 ? (
                <p className="text-xs text-brand-primary/50 py-3">No invoices yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-widest text-brand-primary/40 text-left">
                      <th className="pb-2 font-medium">Invoice #</th>
                      <th className="pb-2 font-medium">Amount</th>
                      <th className="pb-2 font-medium">Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices!.map((i: any) => (
                      <tr key={i.id} className="border-t border-brand-primary/5">
                        <td className="py-2 font-serif">{i.invoice_number}</td>
                        <td className="py-2">{nad(Number(i.amount))}</td>
                        <td className="py-2"><StatusPill status={i.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ProfileField({ label, value, span2 }: { label: string; value: string | null | undefined; span2?: boolean }) {
  return (
    <div className={span2 ? "sm:col-span-2" : ""}>
      <p className="text-[10px] uppercase tracking-widest text-brand-primary/50 mb-0.5">{label}</p>
      <p className="text-sm">{value || <span className="text-brand-primary/40">—</span>}</p>
    </div>
  );
}

function Kpi({ label, value, tone }: { label: string; value: string; tone?: "warn" }) {
  return (
    <div className={`p-4 border ${tone === "warn" ? "border-amber-200 bg-amber-50" : "border-brand-primary/10 bg-brand-bg"}`}>
      <p className="text-[10px] uppercase tracking-widest text-brand-primary/50 mb-1">{label}</p>
      <p className="text-xl font-serif italic">{value}</p>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const tone: Record<string, string> = {
    paid: "bg-green-50 text-green-700",
    confirmed: "bg-green-50 text-green-700",
    accepted: "bg-green-50 text-green-700",
    completed: "bg-blue-50 text-blue-700",
    pending: "bg-amber-50 text-amber-800",
    unpaid: "bg-amber-50 text-amber-800",
    sent: "bg-amber-50 text-amber-800",
    draft: "bg-brand-soft text-brand-primary/70",
    cancelled: "bg-red-50 text-red-700",
    overdue: "bg-red-50 text-red-700",
  };
  return (
    <span className={`px-2 py-0.5 text-[9px] uppercase tracking-widest font-bold ${tone[status] || "bg-brand-soft text-brand-primary/70"}`}>
      {status || "—"}
    </span>
  );
}
