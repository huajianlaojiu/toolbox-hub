"use client";
import { useI18n } from "@/lib/i18n";

/** 服务端组件里需要渲染一段可翻译 UI 文案时用它（在 I18nProvider 内） */
export function I18nText({ id, vars }: { id: string; vars?: Record<string, string> }) {
  const { tl, t } = useI18n();
  return <>{vars ? tl(id, vars) : t(id)}</>;
}

/** 阅读时长：数据是 "12 min read"，数字保留、单位走翻译，避免中英混杂 */
export function ReadingTime({ value }: { value: string }) {
  const { t } = useI18n();
  const m = value.match(/^(\d+)/);
  if (!m) return <>{value}</>;
  return (
    <>
      {m[1]} {t("min read")}
    </>
  );
}
