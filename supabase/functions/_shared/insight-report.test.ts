import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  countTopics,
  monthWindow,
  PUBLIC_MIN_COHORT,
  roundPublicTotal,
  SHOP_MIN_COHORT,
} from "./insight-report.ts";
import { topicsFor } from "./question-topics.ts";

Deno.test("public report hides a topic asked in fewer than 10 conversations", () => {
  const lists = [...Array(9).fill(["Sleep"]), ...Array(10).fill(["Pain relief"])];
  const result = countTopics(lists, PUBLIC_MIN_COHORT);
  assertEquals(result.map((t) => t.label), ["Pain relief"]);
});

Deno.test("shop report hides a topic asked fewer than 3 times", () => {
  const lists = [["Edibles"], ["Edibles"], ["Vapes"], ["Vapes"], ["Vapes"]];
  assertEquals(countTopics(lists, SHOP_MIN_COHORT).map((t) => t.label), ["Vapes"]);
});

Deno.test("public totals are rounded to the nearest 10", () => {
  assertEquals(roundPublicTotal(149), 150);
  assertEquals(roundPublicTotal(133), 130);
});

Deno.test("future months are refused and the current month is marked incomplete", () => {
  const now = new Date("2026-10-31T06:00:00Z");
  assertEquals(monthWindow("2026-11", now), null);
  assertEquals(monthWindow("2026-10", now)?.complete, false);
  assertEquals(monthWindow("2026-09", now)?.complete, true);
});

Deno.test("a repeated topic in one conversation counts once", () => {
  assertEquals(countTopics([["Sleep", "Sleep"]], 1)[0].count, 1);
});

Deno.test("topics are detected from plain questions", () => {
  assertEquals(topicsFor("Is it legal to grow 4 plants at home?").sort(), ["Growing & seeds", "Law & legal limits"]);
});
