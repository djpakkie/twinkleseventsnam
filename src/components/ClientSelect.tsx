import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Search, Plus, X } from "lucide-react";

export type Client = {
  id: string;
  first_name: string;
  last_name: string;
  company_name: string | null;
  phone: string | null;
  alt_phone: string | null;
  email: string | null;
  physical_address: string | null;
  notes: string | null;
};

export function fullName(c: Pick<Client, "first_name" | "last_name">) {
  return `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim();
}

type Props = {
  value: string | null;
  onChange: (client: Client | null) => void;
  required?: boolean;
  placeholder?: string;
};

export function ClientSelect({ value, onChange, required, placeholder = "Search clients…" }: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("first_name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Client[];
    },
  });

  const selected = useMemo(
    () => clients?.find((c) => c.id === value) ?? null,
    [clients, value],
  );

  const filtered = useMemo(() => {
    if (!clients) return [];
    const needle = q.trim().toLowerCase();
    if (!needle) return clients.slice(0, 25);
    return clients.filter((c) => {
      const hay = [
        fullName(c),
        c.company_name ?? "",
        c.email ?? "",
        c.phone ?? "",
        c.alt_phone ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [clients, q]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <>
      <div className="relative" ref={ref}>
        {selected ? (
          <div className="flex items-center justify-between gap-2 w-full border border-brand-primary/15 bg-brand-bg px-3 py-2 text-sm">
            <div className="min-w-0">
              <div className="font-medium truncate">{fullName(selected)}</div>
              <div className="text-[11px] text-brand-primary/60 truncate">
                {[selected.company_name, selected.email, selected.phone].filter(Boolean).join(" · ")}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="p-1 hover:bg-brand-primary/10 rounded transition-colors shrink-0"
              aria-label="Clear client"
            >
              <X className="size-3.5 text-brand-primary/60" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 border border-brand-primary/15 bg-brand-bg px-3 py-2 focus-within:border-brand-accent transition-colors">
            <Search className="size-3.5 text-brand-primary/40 shrink-0" />
            <input
              value={q}
              onFocus={() => setOpen(true)}
              onChange={(e) => {
                setQ(e.target.value);
                setOpen(true);
              }}
              placeholder={placeholder}
              required={required && !selected}
              className="flex-1 bg-transparent text-sm outline-none min-w-0"
            />
          </div>
        )}

        {open && !selected && (
          <div className="absolute z-50 mt-1 w-full max-h-72 overflow-auto bg-card border border-brand-primary/15 shadow-lg">
            {filtered.length === 0 && (
              <div className="px-3 py-4 text-xs text-brand-primary/60">No matches for "{q}".</div>
            )}
            {filtered.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  onChange(c);
                  setOpen(false);
                  setQ("");
                }}
                className="w-full text-left px-3 py-2 hover:bg-brand-bg border-b border-brand-primary/5 last:border-b-0"
              >
                <div className="text-sm font-medium">{fullName(c)}</div>
                <div className="text-[11px] text-brand-primary/60 truncate">
                  {[c.company_name, c.email, c.phone].filter(Boolean).join(" · ") || "—"}
                </div>
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setAddOpen(true);
              }}
              className="w-full flex items-center gap-2 px-3 py-2.5 bg-brand-primary/5 hover:bg-brand-primary/10 border-t border-brand-primary/10 text-xs uppercase tracking-widest font-bold text-brand-accent"
            >
              <Plus className="size-3.5" /> Add new client
            </button>
          </div>
        )}
      </div>

      <QuickAddClient
        open={addOpen}
        onOpenChange={setAddOpen}
        initialName={q}
        onCreated={(c) => {
          onChange(c);
          setQ("");
        }}
      />
    </>
  );
}

function QuickAddClient({
  open,
  onOpenChange,
  initialName,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialName?: string;
  onCreated: (c: Client) => void;
}) {
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    company_name: "",
    phone: "",
    alt_phone: "",
    email: "",
    physical_address: "",
    notes: "",
  });

  useEffect(() => {
    if (!open) return;
    const parts = (initialName ?? "").trim().split(/\s+/);
    setForm({
      first_name: parts[0] ?? "",
      last_name: parts.slice(1).join(" "),
      company_name: "",
      phone: "",
      alt_phone: "",
      email: "",
      physical_address: "",
      notes: "",
    });
  }, [open, initialName]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.first_name.trim()) {
      toast.error("First name is required.");
      return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from("clients")
      .insert({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        company_name: form.company_name.trim() || null,
        phone: form.phone.trim() || null,
        alt_phone: form.alt_phone.trim() || null,
        email: form.email.trim() || null,
        physical_address: form.physical_address.trim() || null,
        notes: form.notes.trim() || null,
      })
      .select("*")
      .single();
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Client added.");
    qc.invalidateQueries({ queryKey: ["clients"] });
    onCreated(data as Client);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-serif italic">Add new client</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="First name *">
            <input required value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} className="cinput" />
          </Field>
          <Field label="Last name">
            <input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} className="cinput" />
          </Field>
          <Field label="Company">
            <input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} className="cinput" />
          </Field>
          <Field label="Email">
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="cinput" />
          </Field>
          <Field label="Phone">
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="cinput" />
          </Field>
          <Field label="Alternative phone">
            <input value={form.alt_phone} onChange={(e) => setForm({ ...form, alt_phone: e.target.value })} className="cinput" />
          </Field>
          <Field label="Physical address" span2>
            <input value={form.physical_address} onChange={(e) => setForm({ ...form, physical_address: e.target.value })} className="cinput" />
          </Field>
          <Field label="Notes" span2>
            <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="cinput resize-none" />
          </Field>
          <DialogFooter className="md:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-brand-primary text-primary-foreground text-[10px] uppercase tracking-widest font-bold hover:bg-brand-accent transition-colors disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save client"}
            </button>
          </DialogFooter>
        </form>
        <style>{`
          .cinput { width: 100%; padding: .55rem .75rem; background: transparent;
            border: 1px solid color-mix(in oklab, var(--brand-primary) 15%, transparent);
            font-size: .875rem; color: var(--brand-primary); transition: border-color .2s; }
          .cinput:focus { outline: none; border-color: var(--brand-accent); }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, span2, children }: { label: string; span2?: boolean; children: React.ReactNode }) {
  return (
    <label className={`block ${span2 ? "md:col-span-2" : ""}`}>
      <span className="block text-[10px] uppercase tracking-widest font-semibold text-brand-primary/60 mb-1.5">{label}</span>
      {children}
    </label>
  );
}
