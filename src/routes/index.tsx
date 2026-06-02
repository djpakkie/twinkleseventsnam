import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { packages } from "@/lib/mockData";
import heroTable from "@/assets/hero-table.jpg";
import studio from "@/assets/studio.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Twinkles Events Namibia — Event Design & Decor" },
      { name: "description", content: "Editorial event design, decor, and full-service planning across Namibia. Browse packages, request quotes, and track your event in one place." },
      { property: "og:title", content: "Twinkles Events Namibia — Event Design & Decor" },
      { property: "og:description", content: "Editorial event design, decor, and full-service planning across Namibia." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-brand-bg text-brand-primary">
      <SiteNav />

      {/* Hero */}
      <main className="px-6 md:px-10 pt-12 md:pt-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          <div className="max-w-xl">
            <p className="eyebrow mb-6">Est. 2018 · Worldwide</p>
            <h1 className="text-5xl md:text-7xl font-serif leading-[1.05] mb-6">
              Curating <span className="italic">Atmospheres</span> for Life's Milestones
            </h1>
            <p className="text-lg text-brand-primary/70 mb-10 leading-relaxed">
              From intimate gatherings to grand celebrations, we blend architectural
              precision with organic elegance to design unforgettable spaces.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/packages"
                className="px-8 py-4 border border-brand-primary/20 hover:bg-brand-primary hover:text-primary-foreground transition-all text-xs uppercase tracking-[0.2em] font-bold"
              >
                Explore Packages
              </Link>
              <Link
                to="/quote"
                className="px-8 py-4 bg-brand-accent text-accent-foreground hover:brightness-110 transition-all text-xs uppercase tracking-[0.2em] font-bold"
              >
                Get a Quote
              </Link>
            </div>
          </div>
          <div className="relative">
            <img
              src={heroTable}
              alt="Editorial wedding tablescape"
              width={1024}
              height={1280}
              className="w-full aspect-[4/5] object-cover rounded-sm"
            />
            <div className="absolute -bottom-6 -left-6 bg-card p-6 shadow-xl max-w-[240px]">
              <p className="text-xs font-serif italic text-brand-accent mb-2">Featured Design</p>
              <p className="text-sm font-medium">The Solstice Gala</p>
              <p className="text-[10px] text-brand-primary/50 uppercase tracking-tighter mt-1">
                Swakopmund, Namibia · 2026
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Process */}
      <section className="px-6 md:px-10 py-24 md:py-32 max-w-7xl mx-auto">
        <p className="eyebrow mb-3">The Process</p>
        <h2 className="text-3xl md:text-4xl font-serif italic mb-16">From inquiry to ovation.</h2>
        <div className="grid md:grid-cols-4 gap-10">
          {[
            { n: "01", t: "Inquire", d: "Share your vision, date, and guest count." },
            { n: "02", t: "Quote", d: "Receive an itemized digital proposal in 48 hours." },
            { n: "03", t: "Book", d: "Confirm with a deposit and unlock your portal." },
            { n: "04", t: "Celebrate", d: "We install, manage, and strike. You enjoy." },
          ].map((s) => (
            <div key={s.n}>
              <p className="text-xs font-serif italic text-brand-accent mb-3">{s.n}</p>
              <h3 className="text-2xl mb-2">{s.t}</h3>
              <p className="text-sm text-brand-primary/60 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Packages */}
      <section className="px-6 md:px-10 py-24 bg-card/50 border-y border-brand-primary/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <p className="eyebrow mb-3">Collections</p>
              <h2 className="text-3xl md:text-4xl font-serif italic">Featured packages</h2>
            </div>
            <Link to="/packages" className="hidden md:inline text-xs uppercase tracking-[0.2em] font-bold border-b border-brand-primary pb-1 hover:text-brand-accent hover:border-brand-accent transition-colors">
              View all →
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {packages.map((p) => (
              <Link key={p.id} to="/packages" className="group">
                <div className="aspect-[3/4] overflow-hidden mb-4">
                  <img
                    src={p.image}
                    alt={p.name}
                    width={800}
                    height={1024}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <p className="text-[10px] uppercase tracking-widest text-brand-accent mb-1">{p.tagline}</p>
                <h3 className="text-2xl mb-1">{p.name}</h3>
                <p className="text-xs font-serif italic text-brand-primary/60">From N${p.price.toLocaleString()}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Client portal teaser */}
      <section className="px-6 md:px-10 py-24 md:py-32 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <img
            src={studio}
            alt="Designer studio"
            width={1280}
            height={832}
            loading="lazy"
            className="w-full aspect-video object-cover rounded-sm"
          />
          <div>
            <p className="eyebrow mb-3">Client Portal</p>
            <h3 className="text-4xl font-serif mb-6">
              Track every detail <br />
              <span className="italic">in real-time.</span>
            </h3>
            <ul className="space-y-4 text-brand-primary/70 mb-10">
              {[
                "Visual moodboard & inspiration photo uploads",
                "Direct messaging with your lead coordinator",
                "Dynamic quote adjustment and online payments",
                "Live event progress and design milestones",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="w-3 h-px bg-brand-accent mt-3" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/portal"
              className="text-xs uppercase font-bold tracking-[0.25em] border-b border-brand-primary pb-1 hover:text-brand-accent hover:border-brand-accent transition-colors"
            >
              Enter the Portal
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
