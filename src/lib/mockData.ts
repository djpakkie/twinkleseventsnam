import wedding from "@/assets/pkg-wedding.jpg";
import corporate from "@/assets/pkg-corporate.jpg";
import privateEvt from "@/assets/pkg-private.jpg";

export const CURRENCY = "N$";
export const fmt = (n: number) => `${CURRENCY}${n.toLocaleString()}`;

export type Package = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  guests: string;
  image: string;
  includes: string[];
};

export const packages: Package[] = [
  {
    id: "garden-wedding",
    name: "The Garden Wedding",
    tagline: "Romantic · Outdoor",
    description:
      "Florals, draping, and arch styling for an intimate-to-mid garden ceremony with editorial finish.",
    price: 75000,
    guests: "Up to 150 guests",
    image: wedding,
    includes: ["Floral arch", "Aisle styling", "Ceremony chairs", "Lead coordinator"],
  },
  {
    id: "corporate-gala",
    name: "The Corporate Gala",
    tagline: "Architectural · Brand-forward",
    description:
      "Stage design, architectural lighting, and tablescapes for product launches, galas, and brand activations.",
    price: 152000,
    guests: "Up to 300 guests",
    image: corporate,
    includes: ["Stage design", "Architectural lighting", "AV & sound", "Branded signage"],
  },
  {
    id: "private-soiree",
    name: "The Private Soirée",
    tagline: "Intimate · Lantern-lit",
    description:
      "Lantern installations and curated tablescapes for milestone birthdays, anniversaries, and salon dinners.",
    price: 50000,
    guests: "Up to 60 guests",
    image: privateEvt,
    includes: ["Lantern install", "Tablescapes", "Florals", "On-site stylist"],
  },
];

export type Lead = {
  id: string;
  client: string;
  type: string;
  guests: number;
  status: "new" | "quoted" | "deposit" | "confirmed";
  estimate: number;
  date: string;
};

export const leads: Lead[] = [
  { id: "L-2401", client: "Isabella Rossi", type: "Garden Wedding", guests: 150, status: "new", estimate: 75000, date: "2026-09-14" },
  { id: "L-2402", client: "Namib Mining Co.", type: "Product Launch", guests: 45, status: "deposit", estimate: 224000, date: "2026-07-22" },
  { id: "L-2403", client: "Adeyemi Family", type: "Anniversary", guests: 80, status: "quoted", estimate: 113000, date: "2026-08-03" },
  { id: "L-2404", client: "Hexley Corp.", type: "Gala", guests: 220, status: "confirmed", estimate: 339000, date: "2026-10-11" },
  { id: "L-2405", client: "Aria & Theo", type: "Engagement", guests: 60, status: "new", estimate: 61000, date: "2026-09-28" },
];

export const inventory = [
  { name: "Chiavari Chairs (Gold)", total: 400, booked: 280 },
  { name: "Round Tables (60in)", total: 60, booked: 42 },
  { name: "Sailcloth Tent (40x60)", total: 3, booked: 2 },
  { name: "Festoon Lighting (50ft)", total: 24, booked: 18 },
  { name: "Louis Ghost Chairs", total: 120, booked: 130 },
  { name: "Linen Runners (Sage)", total: 80, booked: 31 },
];

export const payments = [
  { id: "INV-3201", client: "Hexley Corp.", amount: 169000, status: "paid", date: "2026-05-12" },
  { id: "INV-3202", client: "Namib Mining Co.", amount: 112000, status: "paid", date: "2026-05-18" },
  { id: "INV-3203", client: "Adeyemi Family", amount: 56000, status: "due", date: "2026-06-15" },
  { id: "INV-3204", client: "Isabella Rossi", amount: 37500, status: "pending", date: "2026-06-22" },
];

export const upcomingEvent = {
  name: "The Solstice Gala",
  date: "September 14, 2026",
  location: "Swakopmund, Namibia",
  progress: 65,
  steps: [
    { label: "Inquiry", done: true },
    { label: "Quote", done: true },
    { label: "Booking", done: true },
    { label: "Design Review", done: false },
    { label: "Event Day", done: false },
  ],
  messages: [
    { from: "Elena (Coordinator)", text: "Loved the moodboard you uploaded — pulling sage linens for review.", time: "2h ago" },
    { from: "You", text: "Can we add taper candles in the brass holders?", time: "1d ago" },
  ],
};

// ─── Phase 2 ──────────────────────────────────────────────

export const staff = [
  { name: "Elena Shikongo", role: "Lead Coordinator", assigned: "Solstice Gala", shift: "Sep 14 · 08:00–23:00", status: "confirmed" },
  { name: "Tomas Nghipandwa", role: "Floral Lead", assigned: "Solstice Gala", shift: "Sep 14 · 06:00–14:00", status: "confirmed" },
  { name: "Anna Iyambo", role: "Stylist", assigned: "Hexley Gala", shift: "Oct 11 · 10:00–24:00", status: "pending" },
  { name: "Petrus Haufiku", role: "AV Tech", assigned: "Namib Launch", shift: "Jul 22 · 12:00–22:00", status: "confirmed" },
  { name: "Selma Amupolo", role: "On-site Stylist", assigned: "Adeyemi Anniv.", shift: "Aug 03 · 14:00–23:00", status: "requested" },
];

export const notifications = [
  { id: "N-01", type: "lead", text: "New inquiry from Aria & Theo — Engagement, 60 guests", time: "12m ago", unread: true },
  { id: "N-02", type: "payment", text: "Deposit received: Namib Mining Co. — N$112,000", time: "2h ago", unread: true },
  { id: "N-03", type: "inventory", text: "Louis Ghost Chairs over-booked for Oct 11", time: "5h ago", unread: true },
  { id: "N-04", type: "review", text: "★★★★★ review posted by Hexley Corp.", time: "1d ago", unread: false },
  { id: "N-05", type: "staff", text: "Selma Amupolo requested swap on Aug 03 shift", time: "1d ago", unread: false },
];

// ─── Phase 3 ──────────────────────────────────────────────

export const onlinePayments = [
  { method: "Visa / Mastercard", processor: "Stripe", enabled: true, fee: "2.9% + N$3" },
  { method: "EFT / Bank Transfer", processor: "Standard Bank NAM", enabled: true, fee: "N$0" },
  { method: "PayToday", processor: "PayToday Namibia", enabled: true, fee: "1.8%" },
  { method: "Apple / Google Pay", processor: "Stripe", enabled: false, fee: "2.9% + N$3" },
];

export const aiQuoteSuggestions = [
  {
    lead: "Isabella Rossi · Garden Wedding · 150 guests",
    suggestion: "Suggested N$78,400 — +4% above base. 90% confidence based on 12 comparable outdoor weddings (Swakopmund region, 2025–26).",
    upsell: "Add festoon lighting package (+N$8,500) — 73% of similar clients accepted.",
  },
  {
    lead: "Aria & Theo · Engagement · 60 guests",
    suggestion: "Suggested N$58,200 — within budget signal. 84% confidence.",
    upsell: "Bundle lantern walkway (+N$4,200) — high attach rate for engagements.",
  },
];

export const followUps = [
  { client: "Adeyemi Family", trigger: "Quote sent 5 days ago, no response", action: "Auto-email scheduled", when: "Tomorrow 09:00", status: "scheduled" },
  { client: "Isabella Rossi", trigger: "Inquiry received, awaiting quote", action: "Quote draft prepared", when: "Today 16:00", status: "pending" },
  { client: "Hexley Corp.", trigger: "Event in 14 days", action: "Final walkthrough reminder", when: "Sep 27", status: "scheduled" },
  { client: "Past clients (Q4 2025)", trigger: "Anniversary milestone", action: "Re-engagement campaign", when: "Nov 01", status: "draft" },
];

export const vendors = [
  { name: "Wild Stem Florals", category: "Florist", rating: 4.9, jobs: 38, status: "preferred" },
  { name: "Coastal Catering Co.", category: "Catering", rating: 4.7, jobs: 22, status: "preferred" },
  { name: "Lumière AV Namibia", category: "Lighting & AV", rating: 4.8, jobs: 31, status: "preferred" },
  { name: "Desert Linens", category: "Linens & Rentals", rating: 4.5, jobs: 17, status: "active" },
  { name: "Brass & Bloom Calligraphy", category: "Stationery", rating: 5.0, jobs: 9, status: "trial" },
];
