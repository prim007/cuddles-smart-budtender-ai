export interface RagSourceDocument {
  category: string;
  title: string;
  content: string;
  tags: string[];
  source: string;
}

interface Article {
  title: string;
  slug: string;
  content: string;
  tags: string[];
  published_at: string;
}

// Stay below the embedding helper's 6,000-character input ceiling.
export function articleKnowledge(post: Article): RagSourceDocument[] {
  const warning = `Published ${post.published_at}. Dated editorial source, not proof of current law. The 750 g and five-plant figures in the February 2026 draft are proposals, not confirmed enacted limits. Verify current official law before legal conclusions. Education only; not medical or legal advice.`;
  const chunks: string[] = [];
  let remaining = post.content.trim();
  while (remaining.length) {
    let end = Math.min(4200, remaining.length);
    if (end < remaining.length) {
      const boundary = remaining.lastIndexOf("\n", end);
      if (boundary > 2000) end = boundary;
    }
    chunks.push(remaining.slice(0, end));
    remaining = remaining.slice(end).trimStart();
  }
  return chunks.map((chunk, index) => ({
    category: "blog",
    title: `${post.title} — passage ${index + 1}`,
    content: `${warning}\n\n${chunk}`,
    tags: post.tags,
    source: `https://cuddles-ai.com/blog/${post.slug}#rag-${index + 1}`,
  }));
}

export function lefStrainKnowledge(items: { name: string; category?: string; notes?: string }[]): RagSourceDocument[] {
  return items.filter(item => /Tier [IV]+$/.test(item.category ?? "")).map((item, index) => ({
    category: "strain",
    title: `LëF Labs catalogue: ${item.name} (${item.category})`,
    content: `LëF Labs September 2026 catalogue notes. Strain: ${item.name}. Range: ${item.category}. Descriptive notes: ${(item.notes ?? "").replace(/Back in supply\s*·\s*/gi, "")}. These are catalogue descriptions, not independently verified batch lab results or guaranteed effects. This dated catalogue does not confirm current stock, prices, delivery or legal purchase eligibility. Pricing and COAs are on request from the provider. Education only; not medical advice.`,
    tags: ["LëF Labs", "September 2026", item.name, item.category ?? "Flower"],
    source: `https://cuddles-ai.com/menus/leflabs-september-2026-catalogue.pdf#rag-strain-${index + 1}`,
  }));
}