import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Phone, FileText, ChevronDown, ChevronUp } from "lucide-react";
import type { DispensaryMenu } from "@/data/dispensaryMenus";

interface Props {
  menu: DispensaryMenu;
}

const ChatMenuCard = ({ menu }: Props) => {
  const [showPdf, setShowPdf] = useState(true);

  // Group items by category
  const groups = menu.items.reduce<Record<string, typeof menu.items>>((acc, item) => {
    const key = item.category || "Menu";
    (acc[key] ||= []).push(item);
    return acc;
  }, {});

  const priceLabel = (price?: number) => {
    if (menu.hidePrices || typeof price !== "number") return menu.priceNote ?? "On request";
    return `${menu.currency}${price}`;
  };

  const downloadPdf = async () => {
    // Partner-supplied catalogue: hand over the original document.
    if (menu.pdfUrl) {
      window.open(menu.pdfUrl, "_blank", "noopener,noreferrer");
      return;
    }

    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    let y = 48;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(menu.label, 40, y);
    y += 22;

    if (menu.contact) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(90);
      doc.text(menu.contact, 40, y);
      y += 18;
    }
    doc.setTextColor(0);

    Object.entries(groups).forEach(([cat, items]) => {
      if (y > 760) { doc.addPage(); y = 48; }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(cat, 40, y);
      y += 14;
      doc.setDrawColor(220);
      doc.line(40, y, pageW - 40, y);
      y += 10;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      items.forEach((it) => {
        if (y > 780) { doc.addPage(); y = 48; }
        const left = `${it.name}${it.size ? "  ·  " + it.size : ""}`;
        doc.text(left, 40, y);
        doc.text(priceLabel(it.price), pageW - 40, y, { align: "right" });
        if (it.notes) {
          y += 12;
          doc.setTextColor(120);
          doc.text(it.notes, 48, y);
          doc.setTextColor(0);
        }
        y += 16;
      });
      y += 8;
    });

    if (menu.disclaimer) {
      if (y > 760) { doc.addPage(); y = 48; }
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text(menu.disclaimer, 40, y);
    }

    doc.save(`${menu.id}-menu.pdf`);
  };

  return (
    <div className="mt-3 rounded-xl overflow-hidden border border-border bg-background/70 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-muted/60">
        <p className="text-sm font-semibold text-foreground min-w-0 truncate">📋 {menu.label}</p>
        <div className="flex items-center gap-1.5">
          {menu.pdfUrl && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs"
              onClick={() => setShowPdf((v) => !v)}
              aria-expanded={showPdf}
            >
              <FileText className="w-3 h-3 mr-1" />
              Catalogue
              {showPdf ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
            </Button>
          )}
          <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={downloadPdf}>
            <Download className="w-3 h-3 mr-1" /> PDF
          </Button>
        </div>
      </div>

      {menu.pdfUrl && showPdf && (
        <div className="border-b border-border bg-muted/30">
          {/* Phones and tablets rarely render inline PDFs — show the cover instead. */}
          {menu.coverUrl && (
            <a
              href={menu.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block sm:hidden p-3"
            >
              <img
                src={menu.coverUrl}
                alt={`${menu.label} front page`}
                loading="lazy"
                className="w-full rounded-lg border border-border"
              />
              <span className="mt-2 block text-center text-xs text-primary underline">
                Open the full catalogue
              </span>
            </a>
          )}
          <object
            data={menu.pdfUrl}
            type="application/pdf"
            className="hidden sm:block w-full h-[460px]"
            aria-label={`${menu.label} catalogue`}
          >
            <div className="p-4 text-sm text-muted-foreground">
              Your device can't show the catalogue here.{" "}
              <a href={menu.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                Open the catalogue
              </a>
              .
            </div>
          </object>
        </div>
      )}


      {menu.orderPhone && (
        <div className="px-3 py-2.5 border-b border-border bg-background/60">
          <Button asChild size="sm" className="w-full">
            <a href={`tel:${menu.orderPhone}`} aria-label={`Call ${menu.label} to order`}>
              <Phone className="w-4 h-4 mr-2" /> Order now · {menu.contact?.match(/0\d{2}\s?\d{3}\s?\d{4}/)?.[0] ?? menu.orderPhone}
            </a>
          </Button>
          {menu.hidePrices && (
            <p className="mt-1.5 text-[11px] text-muted-foreground text-center">
              Pricing, volume breaks and COAs shared on the call.
            </p>
          )}
        </div>
      )}

      <div className="p-3 max-h-[420px] overflow-y-auto text-sm">
        {Object.entries(groups).map(([cat, items]) => (
          <div key={cat} className="mb-3 last:mb-0">
            <p className="font-semibold text-foreground text-xs uppercase tracking-wide mb-1 text-primary">
              {cat}
            </p>
            <ul className="divide-y divide-border/60">
              {items.map((it, i) => (
                <li key={i} className="flex items-baseline justify-between gap-3 py-1.5">
                  <div className="min-w-0">
                    <span className="font-medium text-foreground">{it.name}</span>
                    {it.size && <span className="text-muted-foreground"> · {it.size}</span>}
                    {it.notes && (
                      <div className="text-xs text-muted-foreground">{it.notes}</div>
                    )}
                  </div>
                  <span className="font-semibold text-foreground shrink-0 text-xs">
                    {priceLabel(it.price)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {menu.disclaimer && (
        <p className="px-3 pb-3 text-[11px] text-muted-foreground">{menu.disclaimer}</p>
      )}
    </div>
  );
};

export default ChatMenuCard;
