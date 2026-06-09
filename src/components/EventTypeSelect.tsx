import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type EventType = {
  id: string;
  name: string;
  slug: string;
  default_service_id: string | null;
  archived: boolean;
  sort_order: number;
};

export function useEventTypes(includeArchived = false) {
  return useQuery({
    queryKey: ["event-types", includeArchived],
    queryFn: async () => {
      let q = supabase.from("event_types").select("*").order("sort_order");
      if (!includeArchived) q = q.eq("archived", false);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as EventType[];
    },
    staleTime: 60_000,
  });
}

/** Searchable dropdown bound to the centralized event_types catalog. */
export function EventTypeSelect({
  value,
  onChange,
  placeholder = "Search event type…",
  className = "",
  required,
}: {
  value: string | null;
  onChange: (type: EventType | null) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}) {
  const { data: types = [] } = useEventTypes();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const selected = useMemo(() => types.find((t) => t.id === value) ?? null, [types, value]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return types;
    return types.filter((t) => t.name.toLowerCase().includes(q));
  }, [types, query]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left px-4 py-3 border border-brand-primary/10 bg-transparent text-sm focus:outline-none focus:border-brand-accent transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {selected ? selected.name : <span className="text-brand-primary/40">{placeholder}</span>}
        <span className="float-right text-brand-primary/40 text-xs">▾</span>
      </button>
      {required && !selected && <input tabIndex={-1} aria-hidden required value="" onChange={() => {}} className="sr-only" />}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-card border border-brand-primary/10 shadow-lg max-h-72 overflow-hidden flex flex-col">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="px-3 py-2 border-b border-brand-primary/10 text-sm bg-transparent focus:outline-none"
          />
          <ul role="listbox" className="overflow-y-auto">
            {filtered.length === 0 && (
              <li className="px-3 py-3 text-xs text-brand-primary/50">No event types match "{query}"</li>
            )}
            {filtered.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(t);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-brand-bg transition-colors ${
                    t.id === value ? "bg-brand-bg font-medium" : ""
                  }`}
                >
                  {t.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
