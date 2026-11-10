import { posts } from "@/lib/posts";
import { tools } from "@/lib/tools-data";

/**
 * Reverse internal-link index for the blog guides.
 *
 * Each guide links to tools with the `[[tool-slug|Title]]` marker. This module
 * inverts that relationship so an English tool page can point back to the
 * guides that actually discuss it. The index is built once at module load
 * (i.e. at build time for the static export), so there is no runtime cost.
 *
 * Scope: English tool pages only. The nine in-depth guides are English-only
 * and are deliberately not machine-translated; showing English cards on a
 * localised tool page would mix languages and dilute those pages.
 */

export interface RelatedGuide {
  slug: string;
  title: string;
  description: string;
  date: string;
}

const LINK_PATTERN = /\[\[([a-z0-9-]+)\|/g;

function linksInBlock(block: {
  h?: string;
  p?: string;
  l?: string[];
  b?: string;
  s?: string;
}): string[] {
  const texts = [block.h, block.p, block.b, block.s, ...(block.l ?? [])].filter(
    (value): value is string => typeof value === "string" && value.length > 0,
  );
  const found = new Set<string>();
  for (const text of texts) {
    LINK_PATTERN.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = LINK_PATTERN.exec(text))) found.add(match[1]);
  }
  return [...found];
}

// Redirect tools render a standalone redirect page and never show this module.
const eligibleToolSlugs = new Set(
  tools.filter((tool) => !tool.redirect).map((tool) => tool.slug),
);

const index = new Map<string, RelatedGuide[]>();

for (const post of posts) {
  const guide: RelatedGuide = {
    slug: post.slug,
    title: post.title,
    description: post.description,
    date: post.date,
  };

  const linkedTools = new Set<string>();
  for (const block of post.blocks) {
    for (const toolSlug of linksInBlock(block)) {
      // Silently drop stale markers so a guide can never emit a dead link.
      if (eligibleToolSlugs.has(toolSlug)) linkedTools.add(toolSlug);
    }
  }

  for (const toolSlug of linkedTools) {
    const list = index.get(toolSlug) ?? [];
    list.push(guide);
    index.set(toolSlug, list);
  }
}

// Newest (in-depth) guides first; Array#sort is stable, so same-day guides
// keep their order in posts.ts.
for (const list of index.values()) {
  list.sort((a, b) => b.date.localeCompare(a.date));
}

export function getRelatedGuides(toolSlug: string, limit = 3): RelatedGuide[] {
  return (index.get(toolSlug) ?? []).slice(0, limit);
}
