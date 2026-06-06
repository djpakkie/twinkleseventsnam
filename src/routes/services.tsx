import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Twinkles Events Namibia" },
      { name: "description", content: "Wedding décor, corporate events, birthday parties, baby showers, and custom packages designed across Namibia." },
      { property: "og:title", content: "Services — Twinkles Events Namibia" },
      { property: "og:description", content: "Wedding décor, corporate events, birthdays, baby showers, and custom packages." },
    ],
  }),
  component: Services,
});

type Service = {
  id: string; slug: string; name: string; tagline: string | null;
  description: string | null; base_price: number; per_guest_price: number;
  min_guests: number | null; max_guests: number | null; features: string[];
};

function Services() {
  const { data: services, isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services").select("*").eq("active", true).order("sort_order");
      if (error) throw error;
      return data as unknown as Service[];
    },
  });

  return (
    <div className="min-h-screen bg-brand-bg">
      <SiteNav />
      <main className="px-6 md:px-10 py-16 max-w-7xl mx-auto">
        <p className="eyebrow mb-4">What we do</p>
        <h1 className="text-5xl md:text-6xl font-serif italic mb-4">Our services</h1>
        <p className="text-brand-primary/60 max-w-2xl mb-16">
          Five core offerings, infinitely tailored. Pricing below is a starting point —
          a final quotation is generated from your event details on the booking page.
        </p>

        {isLoading && <p className="text-brand-primary/50">Loading…</p>}

        <div className="grid md:grid-cols-2 gap-8">
          {services?.map((s) => (
            <article key={s.id} className="bg-card border border-brand-primary/5 p-8 md:p-10 shadow-sm flex flex-col">
              <p className="text-[10px] uppercase tracking-widest text-brand-accent mb-3">{s.tagline}</p>
              <h2 className="text-3xl font-serif mb-4">{s.name}</h2>
              <p className="text-brand-primary/70 mb-6 leading-relaxed flex-1">{s.description}</p>

              <div className="grid grid-cols-2 gap-4 py-5 border-y border-brand-primary/10 mb-6">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-brand-primary/40 mb-1">From</p>
                  <p className="text-xl font-serif">N${Number(s.base_price).toLocaleString()}</p>
                  <p className="text-[11px] text-brand-primary/50 mt-1">+ N${Number(s.per_guest_price)}/guest</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-brand-primary/40 mb-1">Capacity</p>
                  <p className="text-xl font-serif">{s.min_guests}–{s.max_guests}</p>
                  <p className="text-[11px] text-brand-primary/50 mt-1">guests</p>
                </div>
              </div>

              <ul className="space-y-2 mb-8">
                {(s.features || []).map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-brand-primary/70">
                    <span className="w-3 h-px bg-brand-accent mt-2.5" />{f}
                  </li>
                ))}
              </ul>

              <Link
                to="/quote"
                search={{ pkg: s.slug }}
                className="inline-block self-start px-7 py-3 bg-brand-primary text-primary-foreground text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-brand-accent transition-all"
              >
                Book this service
              </Link>
            </article>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
