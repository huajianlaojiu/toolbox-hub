export { default } from "../../(public)/tools/page";
import type { Metadata } from "next";
import { LOCALES } from "@/lib/locales";
import { langPageMeta } from "@/lib/lang-meta";
import { visibleTools } from "@/lib/tools-data";

export function generateStaticParams() {
  return LOCALES.filter((l) => l.code !== "en").map((l) => ({ lang: l.code }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  // 工具数不能写进翻译 key：以前每次增减一个工具，15 语言译文就集体失效。
  // 改成稳定模板 + 变量，langPageMeta 会先按模板查字典、再做数字归一化兼容历史译文。
  const count = String(visibleTools.length);
  return langPageMeta(
    lang,
    "/tools/",
    "All Tools — {count} Free Browser-Based Tools",
    "The full Toolbox Hub directory: {count} free tools grouped by what they do — developer, text, design, image, video, audio, unit converters, calculators, web, math and everyday utilities. No sign-up; most tools run locally in your browser.",
    { count }
  );
}
