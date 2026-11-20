"use client";

import type { ReactNode } from "react";
import { Loader2, Upload } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function formatBytes(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
}

export function outputName(original: string, suffix: string): string {
  const base = original.replace(/\.pdf$/i, "") || "document";
  return `${base}-${suffix}.pdf`;
}

export function isPdfFile(file: File): boolean {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

export function downloadBytes(bytes: Uint8Array, name: string): void {
  const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function PdfMemoryNote() {
  const { t } = useI18n();
  return (
    <p className="text-sm leading-6 text-muted-foreground">
      {t("The file stays in this browser and is not uploaded. A very large PDF can run out of memory on a phone. If the tab stalls, try a desktop browser or a smaller file.")}
    </p>
  );
}

export function PdfDrop({
  label,
  fileName,
  onFile,
}: {
  label: string;
  fileName: string;
  onFile: (file: File | null) => void;
}) {
  return (
    <label className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed p-8 transition-all hover:border-primary hover:bg-muted/30">
      <Upload className="h-8 w-8 text-muted-foreground" />
      <p className="text-center text-sm text-muted-foreground">{label}</p>
      <input
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        data-testid="pdf-file"
        onChange={(event) => onFile(event.target.files?.[0] ?? null)}
      />
      {fileName ? <p className="max-w-full truncate text-xs text-muted-foreground">{fileName}</p> : null}
    </label>
  );
}

export function PdfField({ label, htmlFor, children }: { label: string; htmlFor?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-xs text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

export function PdfRunButton({
  busy,
  disabled,
  onClick,
  children,
}: {
  busy: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  const { t } = useI18n();
  return (
    <button type="button" disabled={busy || disabled} onClick={onClick} data-testid="pdf-run" className="tool-btn tool-btn-primary">
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {busy ? t("Working…") : children}
    </button>
  );
}

export function PdfMessage({ tone, children }: { tone: "error" | "status"; children: ReactNode }) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      data-testid={tone === "error" ? "pdf-error" : "pdf-status"}
      className={`text-sm leading-6 ${tone === "error" ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}
    >
      {children}
    </p>
  );
}
