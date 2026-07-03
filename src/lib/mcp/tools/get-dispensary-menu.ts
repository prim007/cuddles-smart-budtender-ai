import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { DISPENSARY_MENUS } from "../../../data/dispensaryMenus";

export default defineTool({
  name: "get_dispensary_menu",
  title: "Get dispensary menu",
  description:
    "Get the full product menu (items, prices, categories) for a partner dispensary by id or name alias (e.g. 'tripple444', 'lef labs', 'dirty vapes').",
  inputSchema: {
    dispensary: z
      .string()
      .min(1)
      .describe("Dispensary id or a name alias, e.g. 'tripple444', 'lef labs'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ dispensary }) => {
    const q = dispensary.toLowerCase().trim();
    const match = DISPENSARY_MENUS.find(
      (m) => m.id === q || m.aliases.some((a) => a === q || q.includes(a) || a.includes(q)),
    );
    if (!match) {
      return {
        content: [
          {
            type: "text",
            text: `No dispensary matched "${dispensary}". Use list_dispensary_menus to see available options.`,
          },
        ],
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(match, null, 2) }],
      structuredContent: { menu: match },
    };
  },
});
