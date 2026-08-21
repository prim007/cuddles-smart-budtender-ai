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
  addText(`Tripple444  |  ${new Date().toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })}`, 10, { color: [100, 100, 100] });
  addDivider();

  addText("1. Executive Overview", 13, { bold: true, color: [15, 23, 42] });
  addText(
    "Cuddles AI is a plant expert first and an AI cannabis budtender second. It combines AI-powered plant and cannabis education, strain discovery, OCR label scanning, and B2B embeddable widgets for dispensaries. All IP, trademarks, models, and software are wholly owned by Tripple444.",
    10
  );

  addText("2. Consumer Pricing", 13, { bold: true, color: [15, 23, 42] });
  addText(
    "• Free Tier – Plant care, chat, strain discovery and reviews for personal, non-commercial use.\n" +
    "• Cuddles Premium – R99/month ZAR: journal, tolerance-break coach, seedling monitor, AI memory.\n" +
    "• Membership Gold Box – R249 once-off joining fee plus R99/month.",
    10
  );

  addText("3. Renting Cuddles: B2B Licence Pricing", 13, { bold: true, color: [15, 23, 42] });
  addText(
    "Dispensaries rent Cuddles on a monthly, cancel-anytime licence, benchmarked below the cost of one part-time budtender in South Africa (R6,000–R9,000/month). All prices exclude VAT and include a 14-day free trial.",
    10
  );
  addText(
    "• Starter – R1,899/month (~$100 USD): 1 location, embeddable widget, 1,000 AI chats/month.\n" +
    "• Growth – R5,300/month (~$285 USD): up to 3 locations, POS sync, 5,000 AI chats/month.\n" +
    "• Pro – R27,750/month (~$1,500 USD): unlimited locations, white-label, advanced analytics and API access.\n" +
    "• Enterprise – custom annual contracts for chains, resellers and white-label partners.\n" +
    "Blended target ARPA: ~R4,800/month per tenant at an estimated ~82% gross margin after AI and infrastructure costs.",
    10
  );

  addText("4. Licence Scope & Key Restrictions", 13, { bold: true, color: [15, 23, 42] });
  addText(
    "Licensed dispensaries receive a non-exclusive, tenant-scoped licence to embed the Cuddles widget (widget.js) and access related APIs. Embed keys are confidential. Tenants retain responsibility for catalog data, local compliance, and customer-facing claims. No reverse engineering, scraping, bulk-exporting, competing-AI training, or removal of proprietary notices. Violations result in immediate licence termination.",
    10
  );

  addText("5. Market & Investor Highlights", 13, { bold: true, color: [15, 23, 42] });
  addText(
    "• Global cannabis market ~$39.1B USD (R723B+) in 2024, projected 14.5% CAGR to 2033.\n" +
    "• Target market: South Africa first, with expansion pilots in Ghana, Malawi and Zimbabwe.\n" +
    "• ~5,000 addressable dispensaries and cannabis retailers across target markets.\n" +
    "• Shipped: consumer app, OCR strain scanner, RAG knowledge base, embeddable widget, POS connector framework, ~2,800 mapped dispensary listings.\n" +
    "• 12-month target: 50 paying tenants (~R2.9m ARR at blended ARPA).\n" +
    "• Raising: R3m seed round for dispensary onboarding, AI depth, and regional expansion.",
    10
  );

  addDivider();
  addText(
    "Forward-looking note: target figures above are objectives, not audited results. Cuddles is pre-revenue at scale and uplift benchmarks will be reported per tenant once POS baselines are measured. General plant and cannabis education only – not medical advice.",
    8,
    { color: [120, 120, 120] }
  );
  addText("For licensing calls, custom enterprise deals, or investor enquiries:", 10, { color: [100, 100, 100] });
  addText("Email: admin@cuddles-ai.com  |  Website: cuddles-ai.com", 10, { bold: true, color: [15, 23, 42] });


  doc.save("Cuddles-AI_Investor-Summary.pdf");
};
