// Dedicated OCR pass for cannabis packaging / lab (COA) labels.
// Runs alongside the strain vision analysis and extracts printed text verbatim,
// plus the structured fields that matter for compliance and dosing.

export interface LabelOcr {
  has_text: boolean;
  raw_text: string;
  brand?: string;
  product_name?: string;
  strain_name?: string;
  batch_number?: string;
  lab_name?: string;
  test_date?: string;
  packaged_date?: string;
  expiry_date?: string;
  net_weight?: string;
  thc_percent?: string;
  cbd_percent?: string;
  total_cannabinoids?: string;
  terpenes?: string[];
  warnings?: string[];
  confidence: number;
}

const OCR_MODELS = ["google/gemini-3.6-flash", "google/gemini-2.5-flash", "google/gemini-2.5-flash-lite"];

const OCR_SYSTEM_PROMPT = `You are an OCR engine for cannabis packaging and lab certificates of analysis (COA).
Your ONLY job is to transcribe printed text and extract structured label fields. You do NOT guess, infer, or use cannabis knowledge.

RULES:
- Transcribe text EXACTLY as printed, preserving line breaks in "raw_text". Include small print, batch codes, QR captions and warnings.
- If a field is not printed on the label, omit it. NEVER invent a value.
- Percentages must be copied verbatim (e.g. "23.4%", "0.08%", "<LOQ").
- If the image contains no readable printed text (e.g. it is bare flower), set has_text=false, raw_text="" and confidence=0.
- "confidence" is 0-100 for how legible the text was, not how sure you are about the product.

Return ONLY this JSON, no markdown:
{
  "has_text": true|false,
  "raw_text": "verbatim transcription with \\n line breaks",
  "brand": "", "product_name": "", "strain_name": "",
  "batch_number": "", "lab_name": "",
  "test_date": "", "packaged_date": "", "expiry_date": "",
  "net_weight": "",
  "thc_percent": "", "cbd_percent": "", "total_cannabinoids": "",
  "terpenes": ["..."],
  "warnings": ["..."],
  "confidence": 0
}`;

export async function runLabelOcr(imageUrl: string, apiKey: string): Promise<LabelOcr | null> {
  for (const model of OCR_MODELS) {
    try {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Lovable-API-Key": apiKey,
          "X-Lovable-AIG-SDK": "supabase-edge-function",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: OCR_SYSTEM_PROMPT },
            {
              role: "user",
              content: [
                { type: "text", text: "Transcribe all printed text on this image and extract the label fields. Return only the JSON object." },
                { type: "image_url", image_url: { url: imageUrl } },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        console.error(`OCR model ${model} failed:`, response.status, body.slice(0, 200));
        if (response.status === 429 || response.status === 402 || response.status === 401) return null;
        continue;
      }

      const data = await response.json();
      const content: string = data.choices?.[0]?.message?.content || "";
      const match = content.match(/\{[\s\S]*\}/);
      if (!match) continue;

      const parsed = JSON.parse(match[0]) as LabelOcr;
      if (!parsed.has_text || !parsed.raw_text?.trim()) return { ...parsed, has_text: false, raw_text: "", confidence: 0 };

      // Strip control characters from the transcription while keeping newlines.
      parsed.raw_text = parsed.raw_text.replace(/[\x00-\x09\x0B-\x1F\x7F]/g, "").slice(0, 4000);
      return parsed;
    } catch (error) {
      console.error(`OCR model ${model} threw:`, error instanceof Error ? error.message : String(error));
    }
  }
  return null;
}
