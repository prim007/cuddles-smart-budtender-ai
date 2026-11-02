import { assertEquals } from "jsr:@std/assert@1";
import { compactPageText, validatePublicUrl } from "./web-tools.ts";

Deno.test("public shop pages are accepted", () => {
  assertEquals(validatePublicUrl("https://www.oneplant.ca/strathroy/products/?categories=772")?.hostname, "www.oneplant.ca");
  assertEquals(validatePublicUrl("oneplant.ca/strathroy")?.hostname, "oneplant.ca");
});

Deno.test("local and private addresses are refused", () => {
  for (const bad of ["http://localhost:8080", "http://127.0.0.1/x", "http://192.168.1.4", "http://10.0.0.1", "http://169.254.169.254/latest", "ftp://example.com", "https://user:pw@example.com", "http://[::1]/"]) {
    assertEquals(validatePublicUrl(bad), null, bad);
  }
});

Deno.test("page text is capped at the limit", () => {
  const out = compactPageText("a".repeat(20000), 9000);
  assertEquals(out.startsWith("a".repeat(9000)), true);
  assertEquals(out.length < 9100, true);
});

Deno.test("images are dropped and links keep their text and path", () => {
  const out = compactPageText("![x](https://cdn.x/a.jpg)[Terple Cart](https://www.oneplant.ca/strathroy/product/terple-8484/)");
  assertEquals(out, "Terple Cart (/strathroy/product/terple-8484/)");
});
