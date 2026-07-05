import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { DispensaryMenu } from "@/data/dispensaryMenus";

interface Props {
  menu: DispensaryMenu;
}

const ChatMenuCard = ({ menu }: Props) => {
  // Group items by category
  const groups = menu.items.reduce<Record<string, typeof menu.items>>((acc, item) => {
    const key = item.category || "Menu";
    (acc[key] ||= []).push(item);
    return acc;
  }, {});

  const downloadPdf = async () => {
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
        const right = `${menu.currency}${it.price}`;
        doc.text(left, 40, y);
        doc.text(right, pageW - 40, y, { align: "right" });
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
      <div className="flex items-center justify-between gap-2 px-3 py-2 bg-muted/60">
        <p className="text-sm font-semibold text-foreground truncate">📋 {menu.label}</p>
        <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={downloadPdf}>
          <Download className="w-3 h-3 mr-1" /> PDF
        </Button>
      </div>

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
                  <span className="font-semibold text-foreground shrink-0">
                    {menu.currency}{it.price}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatMenuCard;
