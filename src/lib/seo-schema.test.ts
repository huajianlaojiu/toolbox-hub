import assert from "node:assert/strict";
import test from "node:test";
import { visibleTools } from "./tools-data.ts";
import { breadcrumbJsonLd, faqPageJsonLd, siteFaqItems, siteJsonLd } from "./site-meta.ts";

test("website schema does not advertise a search URL", () => {
  const schema = siteJsonLd("en");
  assert.equal(schema["@type"], "WebSite");
  assert.equal(schema.url, "https://toolbox-hub.io/");
  assert.equal("potentialAction" in schema, false);
  assert.equal(JSON.stringify(schema).includes("SearchAction"), false);
  assert.equal(JSON.stringify(schema).includes("search_term_string"), false);
});

test("site FAQ uses Question and acceptedAnswer", () => {
  const items = siteFaqItems();
  assert.equal(items.length, 5);
  const page = faqPageJsonLd(items);
  assert.equal(page["@type"], "FAQPage");
  for (const entity of page.mainEntity) {
    assert.equal(entity["@type"], "Question");
    assert.equal(typeof entity.name, "string");
    assert.ok(entity.name.length > 0);
    assert.equal(entity.acceptedAnswer["@type"], "Answer");
    assert.equal(entity.acceptedAnswer.text.length > 0, true);
    assert.equal("question" in entity, false);
    assert.equal("answer" in entity, false);
  }
  const visible = items.map((item) => `${item.q} ${item.a}`).join("\n");
  const marked = page.mainEntity.map((entity) => `${entity.name} ${entity.acceptedAnswer.text}`).join("\n");
  assert.equal(marked, visible);
});

test("breadcrumb items all have a name and a URL", () => {
  const list = breadcrumbJsonLd([
    { name: "Home", url: "https://toolbox-hub.io/" },
    { name: "All Tools", url: "https://toolbox-hub.io/tools/" },
  ]);
  assert.equal(list.itemListElement.length, 2);
  for (const [index, item] of list.itemListElement.entries()) {
    assert.equal(item.position, index + 1);
    assert.ok(item.name);
    assert.equal(item.item.name, item.name);
    assert.equal(item.item.url, item.item["@id"]);
    assert.match(item.item.url, /^https:\/\/toolbox-hub\.io\/.*/);
  }
});

test("every public English tool can be listed, and merge is not its own URL", () => {
  const slugs = visibleTools.map((tool) => tool.slug);
  assert.ok(slugs.includes("compress-pdf"));
  assert.ok(slugs.includes("pdf-toolkit"));
  assert.equal(slugs.includes("merge-pdf"), false);
  assert.equal(slugs.includes("json-formatter"), false);
  assert.equal(new Set(slugs).size, slugs.length);
});
