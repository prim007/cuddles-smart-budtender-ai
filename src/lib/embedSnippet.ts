// Single source for the website chat install code, shared by shop setup and the docs page,
// so the address shops paste always points at the live widget.
export const WIDGET_SCRIPT_URL = "https://cuddles-ai.com/widget.js";
export const MCP_SERVER_URL = "https://vfcoctqnohlljuxualwl.supabase.co/functions/v1/mcp";

export type WidgetPosition = "right" | "left";

export function buildEmbedSnippet(opts: { key: string; color?: string; position?: WidgetPosition }): string {
  const lines = [`<script`, `  src="${WIDGET_SCRIPT_URL}"`, `  data-key="${opts.key}"`];
  if (opts.color) lines.push(`  data-color="${opts.color}"`);
  if (opts.position && opts.position !== "right") lines.push(`  data-position="${opts.position}"`);
  lines.push(`></script>`);
  return lines.join("\n");
}
