"use client";

import { useI18n } from "@/lib/i18n";

/** 英文标题补上预览稿里的句号；已有译文的语言保持原句，不加英文句点。 */
export default function HeroTitle({ text }: { text: string }) {
  const { t } = useI18n();
  const line = t(text);
  return <>{line === text ? `${line}.` : line}</>;
}
