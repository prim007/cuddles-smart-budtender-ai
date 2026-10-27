import { assertEquals } from "jsr:@std/assert@1";
import { imageDailyLimit, scanMonthlyLimit } from "./premium-limits.ts";
Deno.test("free users get 5 images a day, Premium 20", () => { assertEquals(imageDailyLimit(false), 5); assertEquals(imageDailyLimit(true), 20); });
Deno.test("free users get 3 scans a month", () => { assertEquals(scanMonthlyLimit(false), 3); });
