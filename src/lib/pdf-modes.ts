/**
 * PDF 工具包里的五个真实操作。首页、分类页和 pdf-toolkit 共用这些 id，
 * 深链是 /tools/pdf-toolkit/#<id>。不要在这里加入尚未实现的操作（例如压缩）。
 */
export const PDF_MODE_IDS = ["merge", "split", "img2pdf", "pdf2img", "pdf2text"] as const;

export type PdfModeId = (typeof PDF_MODE_IDS)[number];

export function isPdfModeId(value: string): value is PdfModeId {
  return (PDF_MODE_IDS as readonly string[]).includes(value);
}
