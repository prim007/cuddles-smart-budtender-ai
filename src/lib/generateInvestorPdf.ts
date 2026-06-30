import { jsPDF } from "jspdf";

export const generateInvestorPdf = () => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  const addText = (text: string, fontSize: number, opts?: { bold?: boolean; color?: [number, number, number] }) => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", opts?.bold ? "bold" : "normal");
    if (opts?.color) doc.setTextColor(opts.color[0], opts.color[1], opts.color[2]);
    else doc.setTextColor(33, 33, 33);
    const lines = doc.splitTextToSize(text, contentWidth);
    doc.text(lines, margin, y);
    y += lines.length * fontSize * 0.45 + 2;
  };

  const addDivider = () => {
    y += 2;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 4;
  };

  // Header
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, pageWidth, 12, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("CONFIDENTIAL – FOR INVESTORS", margin, 8);

  y = 22;

  addText("Cuddles AI – Licensing & Business Summary", 18, { bold: true, color: [15, 23, 42] });
  addText("Tripple444  |  June 30, 2026", 10, { color: [100, 100, 100] });
  addDivider();

  addText("1. Executive Overview", 13, { bold: true, color: [15, 23, 42] });
  addText(
    "Cuddles AI is a smart cannabis budtender platform built by Tripple444. It combines AI-powered education, strain discovery, and B2B embeddable widgets for dispensaries. All IP, trademarks, models, and software are wholly owned by Tripple444.",
    10
  );

  addText("2. Monetisation Tiers", 13, { bold: true, color: [15, 23, 42] });
  addText(
    "• Free Tier – Personal, non-commercial use for cannabis education and lifestyle.\n" +
    "• Premium – R99/month ZAR per user. Personal/single-business licence with enhanced features.\n" +
    "• Pro – R27,750/month ZAR (~$1,500 USD). Advanced analytics, multi-location support, and white-label options.\n" +
    "All subscriptions are billed via Stripe and cancel anytime; licences terminate with the subscription.",
    10
  );

  addText("3. B2B Licensing (Dispensary Widget & API)", 13, { bold: true, color: [15, 23, 42] });
  addText(
    "Licensed dispensaries receive a non-exclusive, tenant-scoped licence to embed the Cuddles widget (widget.js) and access related APIs. Embed keys are confidential. Tenants retain responsibility for catalog data, local compliance, and customer-facing claims.",
    10
  );

  addText("4. Key Restrictions", 13, { bold: true, color: [15, 23, 42] });
  addText(
    "No reverse engineering, scraping, bulk-exporting, competing-AI training, or removal of proprietary notices. All use must comply with applicable law. Violations result in immediate licence termination.",
    10
  );

  addText("5. Investor Highlights", 13, { bold: true, color: [15, 23, 42] });
  addText(
    "• Target market: South Africa with expansion into Ghana, Malawi, and Zimbabwe.\n" +
    "• Global cannabis market valued at ~$39.1B USD (R723B+).\n" +
    "• Recurring-revenue SaaS model with 14-day free B2B trials.\n" +
    "• Plug-and-play POS integration (Weedmaps, Dutchie, Flowhub).\n" +
    "• White-label and reseller opportunities available under custom enterprise licences.",
    10
  );

  addDivider();
  addText("For licensing calls, custom enterprise deals, or investor enquiries:", 10, { color: [100, 100, 100] });
  addText("Email: admin@cuddles-ai.com  |  Website: cuddles-ai.com", 10, { bold: true, color: [15, 23, 42] });

  doc.save("Cuddles-AI_Investor-Summary.pdf");
};
