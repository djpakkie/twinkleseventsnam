import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { packages } from "@/lib/mockData";

export const Route = createFileRoute("/packages")({
  head: () => ({
    meta: [
      { title: "Packages — Aurum & Olive" },
      { name: "description", content: "Browse curated event decor packages: garden weddings, corporate galas, and intimate soirées." },
    ],
  }),
  component: Packages,
});

function Packages() {
  return (
    <div className="min-h-screen bg-brand-bg">
      <SiteNav />
      <main className="px-6 md:px-10 py-16 max-w-7xl mx-auto">
        <p className="eyebrow mb-4">Collections</p>
        <h1 className="text-5xl md:text-6xl font-serif italic mb-4">Our packages</h1>
        <p className="text-brand-primary/60 max-w-2xl mb-16">
          Each collection is a starting point. We tailor every element — florals, lighting, seating —
          to your venue and vision.
        </p>

        <div className="space-y-24">
          {packages.map((p, i) => (
            <div
              key={p.id}
              className={`grid md:grid-cols-2 gap-12 items-center ${
                i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
              }`}
            >
              <img
                src={p.image}
                alt={p.name}
                width={800}
                height={1024}
                loading="lazy"
                className="w-full aspect-[4/5] object-cover rounded-sm"
              />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-brand-accent mb-3">{p.tagline}</p>
                <h2 className="text-4xl font-serif mb-4">{p.name}</h2>
                <p className="text-brand-primary/70 mb-6 leading-relaxed">{p.description}</p>
                <div className="grid grid-cols-2 gap-4 mb-8 py-6 border-y border-brand-primary/10">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-brand-primary/40 mb-1">Starting at</p>
                    <p className="text-xl font-serif">${p.price.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-brand-primary/40 mb-1">Capacity</p>
                    <p className="text-xl font-serif">{p.guests}</p>
                  </div>
                </div>
                <p className="eyebrow mb-3">Includes</p>
                <ul className="space-y-2 mb-8">
                  {p.includes.map((inc) => (
                    <li key={inc} className="flex items-start gap-3 text-sm text-brand-primary/70">
                      <span className="w-3 h-px bg-brand-accent mt-2.5" />
                      {inc}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/quote"
                  search={{ pkg: p.id }}
                  className="inline-block px-8 py-4 bg-brand-primary text-primary-foreground text-xs uppercase tracking-[0.2em] font-bold hover:bg-brand-accent transition-all"
                >
                  Request this package
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
