import wedding from "@/assets/pkg-wedding.jpg";
import corporate from "@/assets/pkg-corporate.jpg";
import privateEvt from "@/assets/pkg-private.jpg";

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
    price: 4200,
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
    price: 8500,
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
    price: 2800,
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
  { id: "L-2401", client: "Isabella Rossi", type: "Garden Wedding", guests: 150, status: "new", estimate: 4200, date: "2026-09-14" },
  { id: "L-2402", client: "The Mercer Studio", type: "Product Launch", guests: 45, status: "deposit", estimate: 12500, date: "2026-07-22" },
  { id: "L-2403", client: "Adeyemi Family", type: "Anniversary", guests: 80, status: "quoted", estimate: 6300, date: "2026-08-03" },
  { id: "L-2404", client: "Hexley Corp.", type: "Gala", guests: 220, status: "confirmed", estimate: 18900, date: "2026-10-11" },
  { id: "L-2405", client: "Aria & Theo", type: "Engagement", guests: 60, status: "new", estimate: 3400, date: "2026-09-28" },
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
  { id: "INV-3201", client: "Hexley Corp.", amount: 9450, status: "paid", date: "2026-05-12" },
  { id: "INV-3202", client: "The Mercer Studio", amount: 6250, status: "paid", date: "2026-05-18" },
  { id: "INV-3203", client: "Adeyemi Family", amount: 3150, status: "due", date: "2026-06-15" },
  { id: "INV-3204", client: "Isabella Rossi", amount: 2100, status: "pending", date: "2026-06-22" },
];

export const upcomingEvent = {
  name: "The Solstice Gala",
  date: "September 14, 2026",
  location: "Cotswolds, UK",
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
