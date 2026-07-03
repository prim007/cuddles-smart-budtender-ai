import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { DISPENSARY_MENUS } from "../../../data/dispensaryMenus";

export default defineTool({
  name: "list_dispensary_menus",
  title: "List dispensary menus",
  description: "List the partner dispensaries whose menus are available on Cuddles AI.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const summary = DISPENSARY_MENUS.map((m) => ({
      id: m.id,
      label: m.label,
      currency: m.currency,
      contact: m.contact ?? null,
      item_count: m.items.length,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(summary, null, 2) }],
      structuredContent: { dispensaries: summary },
    };
  },
});
