import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { format, differenceInDays, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, startOfWeek, endOfWeek } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  Receipt,
  FileText,
  Package,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Bell,
  ChevronLeft,
  ChevronRight,
  Eye,
  Send,
  ArrowRightCircle,
  PieChart as PieIcon,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Twinkles Events Namibia" },
      { name: "description", content: "Real-time business operations overview." },
    ],
  }),
  component: DashboardPage,
});

const REFETCH_MS = 60_000;

function useDashboardData() {
  const inventory = useQuery({
    queryKey: ["dash-inventory"],
    queryFn: async () => {
      const { data, error } = await supabase.from("inventory").select("*");
      if (error) throw error;
      return data;
    },
    refetchInterval: REFETCH_MS,
  });
  const invoices = useQuery({
    queryKey: ["dash-invoices"],
    queryFn: async () => {
      const { data, error } = await supabase.from("invoices").select("*").order("due_date", { ascending: true });
      if (error) throw error;
      return data;
    },
    refetchInterval: REFETCH_MS,
  });
  const quotations = useQuery({
    queryKey: ["dash-quotations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("quotations").select("*").order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    refetchInterval: REFETCH_MS,
  });
  const bookings = useQuery({
    queryKey: ["dash-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("bookings").select("*").order("event_date", { ascending: true });
      if (error) throw error;
      return data;
    },
    refetchInterval: REFETCH_MS,
  });
  const activity = useQuery({
    queryKey: ["dash-activity"],
    queryFn: async () => {
      const { data, error } = await supabase.from("activity_log").select("*").order("created_at", { ascending: false }).limit(15);
      if (error) throw error;
      return data ?? [];
    },
    refetchInterval: REFETCH_MS,
  });
  return { inventory, invoices, quotations, bookings, activity };
}

const currency = (n: number) =>
  new Intl.NumberFormat("en-NA", { style: "currency", currency: "NAD", maximumFractionDigits: 0 }).format(n || 0);

function DashboardPage() {
  const { inventory, invoices, quotations, bookings, activity } = useDashboardData();

  const today = new Date();
  const in30 = addDays(today, 30);
  const in3 = addDays(today, 3);

  const lowStock = useMemo(
    () =>
      (inventory.data ?? [])
        .filter((i) => i.current_quantity <= i.minimum_quantity)
        .sort((a, b) => a.current_quantity / Math.max(a.minimum_quantity, 1) - b.current_quantity / Math.max(b.minimum_quantity, 1)),
    [inventory.data],
  );

  const outstandingInvoices = useMemo(
    () =>
      (invoices.data ?? [])
        .filter((i) => i.status === "unpaid" || i.status === "overdue" || i.status === "partial")
        .map((i) => {
          const due = i.due_date ? new Date(i.due_date) : null;
          const daysOverdue = due ? differenceInDays(today, due) : 0;
          return { ...i, daysOverdue, amountDue: Number(i.amount) - Number(i.amount_paid) };
        }),
    [invoices.data, today],
  );

  const pendingQuotes = useMemo(
    () =>
      (quotations.data ?? [])
        .filter((q) => q.status === "pending" || q.status === "sent")
        .map((q) => ({
          ...q,
          daysSinceSent: differenceInDays(today, new Date(q.sent_at ?? q.created_at)),
        })),
    [quotations.data, today],
  );

  const upcomingEvents = useMemo(
    () =>
      (bookings.data ?? [])
        .filter((b) => {
          const d = new Date(b.event_date);
          return d >= today && d <= in30 && b.status !== "cancelled";
        })
        .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()),
    [bookings.data, today, in30],
  );

  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const confirmedThisMonth = (bookings.data ?? []).filter((b) => {
    const d = new Date(b.event_date);
    return d >= monthStart && d <= monthEnd && b.status === "confirmed";
  });
  const revenueThisMonth = (invoices.data ?? [])
    .filter((i) => i.paid_at && new Date(i.paid_at) >= monthStart && new Date(i.paid_at) <= monthEnd)
    .reduce((sum, i) => sum + Number(i.amount_paid || 0), 0);

  const alerts: { tone: "danger" | "warning" | "info"; text: string }[] = [];
  if (lowStock.length) alerts.push({ tone: "warning", text: `${lowStock.length} inventory item${lowStock.length > 1 ? "s" : ""} low on stock` });
  const overdue = outstandingInvoices.filter((i) => i.daysOverdue > 0);
  if (overdue.length) alerts.push({ tone: "danger", text: `${overdue.length} overdue invoice${overdue.length > 1 ? "s" : ""}` });
  const staleQuotes = pendingQuotes.filter((q) => q.daysSinceSent > 7);
  if (staleQuotes.length) alerts.push({ tone: "warning", text: `${staleQuotes.length} quotation${staleQuotes.length > 1 ? "s" : ""} older than 7 days` });
  const soonEvents = upcomingEvents.filter((b) => new Date(b.event_date) <= in3);
  if (soonEvents.length) alerts.push({ tone: "info", text: `${soonEvents.length} event${soonEvents.length > 1 ? "s" : ""} within 3 days` });

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="mx-auto max-w-7xl px-6 py-10 space-y-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Admin</p>
            <h1 className="text-4xl font-serif tracking-tight">Business dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Live overview · refreshes every minute</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline"><Link to="/admin">Full admin</Link></Button>
          </div>
        </header>

        {alerts.length > 0 && (
          <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {alerts.map((a, i) => (
              <div
                key={i}
                className={`rounded-lg border p-3 flex items-start gap-2 text-sm ${
                  a.tone === "danger"
                    ? "border-red-300 bg-red-50 text-red-900"
                    : a.tone === "warning"
                      ? "border-amber-300 bg-amber-50 text-amber-900"
                      : "border-blue-300 bg-blue-50 text-blue-900"
                }`}
              >
                {a.tone === "danger" ? <AlertTriangle className="w-4 h-4 mt-0.5" /> : <Bell className="w-4 h-4 mt-0.5" />}
                <span>{a.text}</span>
              </div>
            ))}
          </section>
        )}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <Kpi icon={CalendarDays} label="Upcoming events" value={upcomingEvents.length} hint="next 30 days" />
          <Kpi icon={Receipt} label="Outstanding invoices" value={outstandingInvoices.length} hint={`${currency(outstandingInvoices.reduce((s, i) => s + i.amountDue, 0))} due`} />
          <Kpi icon={FileText} label="Pending quotations" value={pendingQuotes.length} />
          <Kpi icon={Package} label="Low stock items" value={lowStock.length} tone={lowStock.length ? "danger" : "default"} />
          <Kpi icon={TrendingUp} label="Revenue this month" value={currency(revenueThisMonth)} />
          <Kpi icon={CheckCircle2} label="Confirmed this month" value={confirmedThisMonth.length} />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Package className="w-4 h-4" /> Low stock inventory</CardTitle>
              <Badge variant="secondary">{lowStock.length}</Badge>
            </CardHeader>
            <CardContent>
              {inventory.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : lowStock.length === 0 ? (
                <p className="text-sm text-muted-foreground">All inventory is healthy.</p>
              ) : (
                <ul className="divide-y">
                  {lowStock.map((it) => {
                    const critical = it.current_quantity === 0 || it.current_quantity < it.minimum_quantity * 0.5;
                    return (
                      <li key={it.id} className="py-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium">{it.name}</p>
                          <p className="text-xs text-muted-foreground">{it.category}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-sm ${critical ? "text-red-600 font-semibold" : ""}`}>
                            {it.current_quantity} / {it.minimum_quantity} {it.unit}
                          </span>
                          <Badge variant={critical ? "destructive" : "secondary"}>Restock</Badge>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Receipt className="w-4 h-4" /> Outstanding invoices</CardTitle>
              <Badge variant="secondary">{outstandingInvoices.length}</Badge>
            </CardHeader>
            <CardContent>
              {outstandingInvoices.length === 0 ? (
                <p className="text-sm text-muted-foreground">No outstanding invoices.</p>
              ) : (
                <ul className="divide-y">
                  {outstandingInvoices.slice(0, 6).map((inv) => (
                    <li key={inv.id} className="py-3 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-medium">{inv.client_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {inv.invoice_number} · due {inv.due_date ? format(new Date(inv.due_date), "dd MMM yyyy") : "—"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${inv.daysOverdue > 0 ? "text-red-600" : ""}`}>
                          {currency(inv.amountDue)}
                        </span>
                        {inv.daysOverdue > 0 && <Badge variant="destructive">{inv.daysOverdue}d overdue</Badge>}
                        <Button size="sm" variant="ghost"><Eye className="w-3.5 h-3.5" /></Button>
                        <Button size="sm" variant="outline"><Send className="w-3.5 h-3.5 mr-1" />Remind</Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><FileText className="w-4 h-4" /> Quotation follow-ups</CardTitle>
              <Badge variant="secondary">{pendingQuotes.length}</Badge>
            </CardHeader>
            <CardContent>
              {pendingQuotes.length === 0 ? (
                <p className="text-sm text-muted-foreground">No pending quotations.</p>
              ) : (
                <ul className="divide-y">
                  {pendingQuotes.slice(0, 6).map((q) => (
                    <li key={q.id} className="py-3 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-medium">{q.client_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {q.quote_number} · {currency(Number(q.amount))} · sent {format(new Date(q.sent_at ?? q.created_at), "dd MMM")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {q.daysSinceSent > 7 && <Badge variant="destructive">{q.daysSinceSent}d</Badge>}
                        <Button size="sm" variant="outline"><Send className="w-3.5 h-3.5 mr-1" />Follow up</Button>
                        <Button size="sm"><ArrowRightCircle className="w-3.5 h-3.5 mr-1" />Convert</Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><CalendarDays className="w-4 h-4" /> Upcoming events</CardTitle>
              <Badge variant="secondary">{upcomingEvents.length}</Badge>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No events scheduled within 30 days.</p>
              ) : (
                <ul className="divide-y">
                  {upcomingEvents.slice(0, 6).map((b) => (
                    <li key={b.id} className="py-3 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-medium">{b.client_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(b.event_date), "EEE dd MMM yyyy")} · {b.venue ?? "—"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={b.status} />
                        <Button size="sm" variant="ghost"><Eye className="w-3.5 h-3.5" /></Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CalendarDays className="w-4 h-4" /> Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <MiniCalendar bookings={bookings.data ?? []} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Bell className="w-4 h-4" /> Recent activity</CardTitle>
            </CardHeader>
            <CardContent>
              {(activity.data ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">No activity yet.</p>
              ) : (
                <ul className="space-y-3 max-h-[420px] overflow-auto">
                  {(activity.data ?? []).map((a) => (
                    <li key={a.id} className="text-sm">
                      <div className="flex justify-between gap-2">
                        <span className="font-medium">{a.action}</span>
                        <span className="text-xs text-muted-foreground">{format(new Date(a.created_at), "dd MMM HH:mm")}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {a.actor_name ?? "System"} · {a.description ?? a.entity_type}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  hint,
  tone = "default",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: "default" | "danger";
}) {
  return (
    <Card className={tone === "danger" ? "border-red-300" : ""}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
          <Icon className={`w-4 h-4 ${tone === "danger" ? "text-red-600" : "text-muted-foreground"}`} />
        </div>
        <p className="text-2xl font-semibold mt-2">{value}</p>
        {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    confirmed: "bg-green-100 text-green-800 border-green-200",
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    completed: "bg-blue-100 text-blue-800 border-blue-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
    quoted: "bg-purple-100 text-purple-800 border-purple-200",
  };
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded border ${map[status] ?? "bg-muted text-foreground"}`}>
      {status}
    </span>
  );
}

function MiniCalendar({ bookings }: { bookings: any[] }) {
  const [cursor, setCursor] = useState(new Date());
  const monthStart = startOfMonth(cursor);
  const monthEnd = endOfMonth(cursor);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const colorFor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-500";
      case "pending":
      case "quoted": return "bg-amber-500";
      case "completed": return "bg-blue-500";
      case "cancelled": return "bg-red-500";
      default: return "bg-muted-foreground";
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <Button size="icon" variant="ghost" onClick={() => setCursor(addDays(monthStart, -1))}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <p className="font-medium">{format(cursor, "MMMM yyyy")}</p>
        <Button size="icon" variant="ghost" onClick={() => setCursor(addDays(monthEnd, 1))}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 text-xs text-muted-foreground mb-1">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
          <div key={d} className="text-center py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => {
          const dayBookings = bookings.filter((b) => isSameDay(new Date(b.event_date), d));
          const inMonth = isSameMonth(d, cursor);
          return (
            <div
              key={d.toISOString()}
              className={`min-h-[64px] rounded border p-1 text-xs ${inMonth ? "bg-background" : "bg-muted/40 text-muted-foreground"}`}
            >
              <div className="flex justify-between items-center">
                <span>{format(d, "d")}</span>
                {dayBookings.length > 0 && (
                  <span className="text-[10px] text-muted-foreground">{dayBookings.length}</span>
                )}
              </div>
              <div className="mt-1 flex flex-col gap-0.5">
                {dayBookings.slice(0, 2).map((b) => (
                  <div key={b.id} className="flex items-center gap-1 truncate">
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${colorFor(b.status)}`} />
                    <span className="truncate">{b.client_name}</span>
                  </div>
                ))}
                {dayBookings.length > 2 && (
                  <span className="text-[10px] text-muted-foreground">+{dayBookings.length - 2}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-3 mt-3 text-xs text-muted-foreground flex-wrap">
        <Legend color="bg-green-500" label="Confirmed" />
        <Legend color="bg-amber-500" label="Pending" />
        <Legend color="bg-blue-500" label="Completed" />
        <Legend color="bg-red-500" label="Cancelled" />
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`inline-block w-2 h-2 rounded-full ${color}`} />
      <span>{label}</span>
    </div>
  );
}
