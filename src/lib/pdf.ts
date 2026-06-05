import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const BRAND = "Twinkles Events Namibia";
const SUB = "Event Design & Decor";
const CONTACT = "Windhoek & Swakopmund, Namibia · djpakkie@gmail.com";
const GOLD: [number, number, number] = [197, 160, 101];
const INK: [number, number, number] = [44, 44, 44];

function header(doc: jsPDF, title: string, docNo: string) {
  doc.setTextColor(...INK);
  doc.setFont("times", "italic");
  doc.setFontSize(22);
  doc.text(BRAND, 105, 22, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text(SUB.toUpperCase(), 105, 28, { align: "center" });
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.6);
  doc.line(20, 33, 190, 33);

  doc.setFont("times", "italic");
  doc.setFontSize(16);
  doc.setTextColor(...INK);
  doc.text(title, 20, 45);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`No. ${docNo}`, 190, 45, { align: "right" });
  doc.text(`Issued: ${new Date().toLocaleDateString()}`, 190, 50, { align: "right" });
}

function footer(doc: jsPDF, note?: string) {
  const h = doc.internal.pageSize.getHeight();
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.4);
  doc.line(20, h - 22, 190, h - 22);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(140);
  doc.text(CONTACT, 105, h - 16, { align: "center" });
  if (note) doc.text(note, 105, h - 11, { align: "center" });
}

function infoRows(doc: jsPDF, y: number, rows: [string, string][]) {
  autoTable(doc, {
    startY: y,
    body: rows,
    theme: "plain",
    styles: { fontSize: 10, cellPadding: 3, textColor: INK },
    columnStyles: {
      0: { textColor: [110, 110, 110], fontStyle: "bold", cellWidth: 50 },
      1: { halign: "right" },
    },
  });
  // @ts-ignore
  return (doc as any).lastAutoTable.finalY as number;
}

function totalLine(doc: jsPDF, y: number, label: string, amount: string) {
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.6);
  doc.line(20, y + 4, 190, y + 4);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text(label.toUpperCase(), 20, y + 14);
  doc.setFont("times", "italic");
  doc.setFontSize(16);
  doc.text(amount, 190, y + 14, { align: "right" });
}

export type QuotationPDF = {
  id: string;
  client: string;
  type: string;
  guests: number;
  amount: number;
  date: string;
  status: string;
};

export function downloadQuotationPDF(q: QuotationPDF) {
  const doc = new jsPDF();
  header(doc, "Quotation", q.id);
  let y = infoRows(doc, 58, [
    ["Client", q.client],
    ["Event Type", q.type || "—"],
    ["Guests", String(q.guests)],
    ["Event Date", q.date || "—"],
    ["Status", q.status.toUpperCase()],
  ]);
  totalLine(doc, y + 4, "Total Estimate", `N$${q.amount.toLocaleString()}`);
  footer(doc, "Valid for 14 days from date of issue.");
  doc.save(`${q.id}_quotation.pdf`);
}

export type InvoicePDF = {
  id: string;
  client: string;
  amount: number;
  date: string;
  status: string;
  quoteId?: string;
};

export function downloadInvoicePDF(inv: InvoicePDF) {
  const doc = new jsPDF();
  header(doc, "Invoice", inv.id);
  let y = infoRows(doc, 58, [
    ["Billed To", inv.client],
    ["Invoice Date", inv.date || "—"],
    ["Linked Quotation", inv.quoteId || "—"],
    ["Status", inv.status.toUpperCase()],
  ]);
  autoTable(doc, {
    startY: y + 6,
    head: [["Description", "Amount"]],
    body: [[`Event services — ref ${inv.quoteId ?? inv.id}`, `N$${inv.amount.toLocaleString()}`]],
    theme: "striped",
    headStyles: { fillColor: INK, textColor: 255, fontSize: 9 },
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: { 1: { halign: "right", cellWidth: 50 } },
  });
  // @ts-ignore
  y = (doc as any).lastAutoTable.finalY;
  totalLine(doc, y + 4, "Total Due", `N$${inv.amount.toLocaleString()}`);
  footer(doc, "Payable within 14 days. Bank details on request.");
  doc.save(`${inv.id}_invoice.pdf`);
}

export type StatementLine = {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: string;
};

export function downloadStatementPDF(opts: {
  client: string;
  period: string;
  lines: StatementLine[];
}) {
  const doc = new jsPDF();
  const stmtNo = `STMT-${Date.now().toString().slice(-6)}`;
  header(doc, "Statement of Account", stmtNo);
  let y = infoRows(doc, 58, [
    ["Account", opts.client],
    ["Period", opts.period],
  ]);
  autoTable(doc, {
    startY: y + 6,
    head: [["Ref", "Date", "Description", "Status", "Amount (N$)"]],
    body: opts.lines.map((l) => [
      l.id,
      l.date,
      l.description,
      l.status.toUpperCase(),
      l.amount.toLocaleString(),
    ]),
    theme: "striped",
    headStyles: { fillColor: INK, textColor: 255, fontSize: 9 },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: { 4: { halign: "right" } },
  });
  // @ts-ignore
  y = (doc as any).lastAutoTable.finalY;
  const total = opts.lines.reduce((s, l) => s + l.amount, 0);
  const paid = opts.lines.filter((l) => l.status === "paid").reduce((s, l) => s + l.amount, 0);
  const outstanding = total - paid;
  totalLine(doc, y + 4, "Outstanding Balance", `N$${outstanding.toLocaleString()}`);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Invoiced: N$${total.toLocaleString()}   ·   Paid: N$${paid.toLocaleString()}`, 20, y + 24);
  footer(doc, "Please settle outstanding balances at your earliest convenience.");
  doc.save(`${stmtNo}_${opts.client.replace(/\s+/g, "_")}.pdf`);
}
