import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { pickLocalizedToolContent } from "./pick-content.ts";
import { contentOverrides, getGenericTemplate, getToolContent, type ToolContent } from "../lib/tool-content.ts";
import { licenseActivationAvailable, purchaseAvailable } from "../lib/billing.ts";

function localized(lang: string, slug: string): ToolContent {
  const data = JSON.parse(readFileSync(new URL(`./content/${lang}.json`, import.meta.url), "utf8")) as {
    generic?: ToolContent;
    overrides?: Record<string, ToolContent>;
  };
  return pickLocalizedToolContent(getToolContent(slug), slug in contentOverrides, data.overrides?.[slug], data.generic);
}

const generic = getGenericTemplate();

test("a specific english page is not replaced by generic filler", () => {
  const english: ToolContent = {
    intro: "Compress the images inside a PDF.",
    howTo: [{ step: "Choose a PDF", detail: "Drop one file." }],
    faq: [],
  };
  const chosen = pickLocalizedToolContent(english, true, undefined, generic);
  assert.equal(chosen, english);
});

test("a real translation wins over the english source", () => {
  const english: ToolContent = { intro: "English", howTo: [], faq: [] };
  const spanish: ToolContent = { intro: "Español específico", howTo: [], faq: [] };
  assert.equal(pickLocalizedToolContent(english, true, spanish, generic), spanish);
});

test("a tool that is generic in english can use the translated generic template", () => {
  const chosen = pickLocalizedToolContent(generic, false, undefined, {
    ...generic,
    intro: "Plantilla genérica",
  });
  assert.equal(chosen.intro, "Plantilla genérica");
});

test("missing file-tool translations fall back to the english compressor copy", () => {
  for (const lang of ["es", "fr", "de", "zh", "pt", "ja"]) {
    const content = localized(lang, "compress-pdf");
    const blob = [content.intro, ...content.howTo.map((step) => `${step.step} ${step.detail}`)].join("\n");
    assert.match(blob, /recompress/i, lang);
    assert.match(blob, /Choose a PDF/, lang);
    assert.doesNotMatch(blob, /Introduce tus datos|Enter your data|hoja de cálculo|spreadsheet|ticket|输入您的数据|データを入力/i, lang);
  }
});

test("spanish rotate, organize, and crop pages are not the paste template", () => {
  for (const slug of ["rotate-pdf", "organize-pdf", "watermark-pdf", "image-cropper", "add-subtitles", "video-cropper"]) {
    const content = localized("es", slug);
    const steps = content.howTo.map((step) => step.step).join(" ");
    assert.equal(content.intro.includes("herramienta gratuita basada en navegador"), false, slug);
    assert.doesNotMatch(steps, /Introduce tus datos/, slug);
  }
});

test("an accurate spanish override is kept", () => {
  const content = localized("es", "loan-calculator");
  assert.match(content.intro, /préstamo|prestamo/i);
  assert.doesNotMatch(content.howTo[0]?.step ?? "", /Enter the loan/);
});

test("a stale or short translation is not treated as indexable", async () => {
  const { toolTranslationIndexable, localePathIndexable } = await import("../lib/locale-index.ts");
  assert.equal(toolTranslationIndexable("es", "word-counter"), false);
  assert.equal(toolTranslationIndexable("es", "image-compressor"), false);
  assert.equal(toolTranslationIndexable("es", "compress-pdf"), false);
  assert.equal(toolTranslationIndexable("zh", "word-counter"), false);
  assert.equal(toolTranslationIndexable("es", "loan-calculator"), true);
  assert.equal(localePathIndexable("es", "/about/"), false);
  assert.equal(localePathIndexable("es", "/pdf/"), false);
  assert.equal(localePathIndexable("es", "/privacy/"), false);
  assert.equal(localePathIndexable("en", "/about/"), true);
  assert.equal(localePathIndexable("de", "/tools/loan-calculator/"), true);
});

test("purchase and license activation stay off until urls exist", () => {
  assert.equal(purchaseAvailable(), false);
  assert.equal(licenseActivationAvailable(), false);
});

test("the script studio embed is english and the pricing page hides internal names", () => {
  const studio = readFileSync(new URL("../../public/embed/viral-video-studio.html", import.meta.url), "utf8");
  assert.match(studio, /lang="en"/);
  assert.match(studio, /<h1>Viral Video Script Studio<\/h1>/);
  assert.equal(/[\u4e00-\u9fff]/.test(studio), false);
  const pricing = readFileSync(new URL("../app/(public)/pricing/page.tsx", import.meta.url), "utf8");
  const account = readFileSync(new URL("../components/billing/pricing-account.tsx", import.meta.url), "utf8");
  for (const source of [pricing, account]) {
    assert.equal(source.includes("NEXT_PUBLIC"), false);
    assert.equal(source.includes("pro-billing"), false);
  }
});
