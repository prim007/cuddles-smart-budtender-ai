import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listDispensaryMenus from "./tools/list-dispensary-menus";
import getDispensaryMenu from "./tools/get-dispensary-menu";
import searchStrains from "./tools/search-strains";

// Build the OAuth issuer from the project ref (Vite inlines this at build time, so
// the entry stays import-safe with no runtime env reads).
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "cuddles-ai-mcp",
  title: "Cuddles AI",
  version: "0.1.0",
  instructions:
    "Cuddles AI tools for cannabis education and South African dispensary menus. Use list_dispensary_menus and get_dispensary_menu to look up partner dispensary menus (Tripple444, Lëf Labs, Dirty Vapes). Use search_strains to browse the public cannabis strain catalog by effect category (sleep, energy, creativity, stress, pain, social) or name. Educational information only — not medical advice.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listDispensaryMenus, getDispensaryMenu, searchStrains],
});
