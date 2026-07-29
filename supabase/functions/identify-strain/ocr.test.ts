// Live OCR test: sends a real cannabis label image through the OCR pass and
// asserts the printed fields come back verbatim.
// Requires LOVABLE_API_KEY in the environment and a label fixture at
// ./__fixtures__/label.b64 (base64 JPEG, no data: prefix).
import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { runLabelOcr } from "./ocr.ts";

const apiKey = Deno.env.get("LOVABLE_API_KEY");

Deno.test({
  name: "runLabelOcr extracts printed label fields verbatim",
  ignore: !apiKey,
  fn: async () => {
    const b64 = await Deno.readTextFile(
      new URL("./__fixtures__/label.b64", import.meta.url),
    );
    const result = await runLabelOcr(`data:image/jpeg;base64,${b64.trim()}`, apiKey!);

    assert(result, "OCR returned null");
    assertEquals(result!.has_text, true);
    assert(result!.confidence > 50, `low legibility confidence: ${result!.confidence}`);

    const raw = result!.raw_text.toLowerCase();
    for (const token of ["blue dream", "22.4", "tf-2291-a", "greenleaf"]) {
      assert(raw.includes(token), `raw_text missing "${token}":\n${result!.raw_text}`);
    }

    assertEquals(result!.thc_percent?.replace("%", ""), "22.4");
    assertEquals(result!.batch_number, "TF-2291-A");
    assert(result!.terpenes?.some((t) => t.toLowerCase().includes("myrcene")));
  },
});

Deno.test({
  name: "runLabelOcr reports no text for an image without printing",
  ignore: !apiKey,
  fn: async () => {
    // 1x1 white pixel — nothing to transcribe.
    const blank =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
    const result = await runLabelOcr(blank, apiKey!);
    if (result) assertEquals(result.has_text, false);
  },
});
