import type { ToolContent } from "@/lib/tool-content";

/**
 * 某语言没有这篇工具自己的译文时，选哪一份正文。
 * 英文已经是专用说明（压缩 PDF、裁剪图片等）时，不能套通用的「粘贴数据 / 复制结果」模板，
 * 那套模板描述的是另一种工具。缺译文就显示英文。
 */
export function pickLocalizedToolContent(
  english: ToolContent,
  hasSpecificEnglish: boolean,
  localizedOverride: ToolContent | undefined,
  localizedGeneric: ToolContent | undefined,
): ToolContent {
  if (localizedOverride) return localizedOverride;
  if (hasSpecificEnglish || !localizedGeneric) return english;
  return localizedGeneric;
}
