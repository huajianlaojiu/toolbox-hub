"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { recordJob } from "@/lib/job-history";
import type { CompressLevel, CompressResult } from "@/lib/pdf-compress";
import {
  PdfDrop,
  PdfMemoryNote,
  PdfMessage,
  PdfRunButton,
  downloadBytes,
  errorMessage,
  formatBytes,
  isPdfFile,
  outputName,
} from "./pdf-job-ui";

function savingsPercent(original: number, next: number): number {
  if (original <= 0 || next >= original) return 0;
  return Math.round((1 - next / original) * 100);
}

export default function CompressPdf() {
  const { t } = useI18n();
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState<CompressLevel>("regular");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState("");
  const [result, setResult] = useState<CompressResult | null>(null);

  const run = async () => {
    if (!file) return;
    if (!isPdfFile(file)) {
      setError(t("Choose a PDF file."));
      return;
    }
    setBusy(true);
    setError("");
    setResult(null);
    setProgress(t("Reading the PDF…"));
    try {
      const { compressPdf } = await import("@/lib/pdf-compress");
      const bytes = new Uint8Array(await file.arrayBuffer());
      const next = await compressPdf(bytes, level, (done, total) => {
        if (total > 0) setProgress(t("Recompressing embedded images…") + ` ${done}/${total}`);
      });
      setResult(next);
      setProgress("");
      downloadBytes(next.bytes, outputName(file.name, "compressed"));
      const saved = savingsPercent(next.originalSize, next.newSize);
      recordJob("compress-pdf", saved > 0 ? `Compressed a PDF by ${saved}%` : "A PDF did not get smaller");
    } catch (caught) {
      setError(errorMessage(caught, t("Could not compress that PDF.")));
      setProgress("");
    } finally {
      setBusy(false);
    }
  };

  const saved = result ? savingsPercent(result.originalSize, result.newSize) : 0;

  return (
    <div className="space-y-4">
      <PdfMemoryNote />
      <p className="text-sm leading-6 text-muted-foreground">
        {t("This recompresses embedded images and can downsample them. It does not rewrite fonts or text streams, so it will not always beat a server-side compressor. Text-only PDFs often barely shrink.")}
      </p>
      <PdfDrop
        label={t("Select a PDF to compress")}
        fileName={file ? `${file.name} · ${formatBytes(file.size)}` : ""}
        onFile={(next) => {
          setFile(next);
          setResult(null);
          setError("");
        }}
      />
      <div className="flex flex-wrap gap-2">
        {(["regular", "strong"] as const).map((id) => (
          <button
            key={id}
            type="button"
            aria-pressed={level === id}
            onClick={() => setLevel(id)}
            className={`tool-btn ${level === id ? "tool-btn-primary" : "tool-btn-secondary"}`}
          >
            {id === "regular" ? t("Regular") : t("Strong")}
          </button>
        ))}
      </div>
      <p className="text-xs leading-5 text-muted-foreground">
        {level === "regular"
          ? t("Regular keeps pictures closer to the original and usually saves less.")
          : t("Strong downsamples pictures and uses a lower JPEG quality, so the file is smaller and the pictures are softer.")}
      </p>
      <PdfRunButton busy={busy} disabled={!file} onClick={run}>
        {t("Compress PDF")}
      </PdfRunButton>
      {progress ? <PdfMessage tone="status">{progress}</PdfMessage> : null}
      {error ? <PdfMessage tone="error">{error}</PdfMessage> : null}
      {result ? (
        <div className="space-y-3">
          <dl className="grid grid-cols-3 gap-3 rounded-xl border bg-muted/40 p-4" data-testid="compress-result">
            <div>
              <dt className="text-xs text-muted-foreground">{t("Original size")}</dt>
              <dd className="mt-1 text-lg font-semibold" data-testid="compress-original">
                {formatBytes(result.originalSize)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">{t("New size")}</dt>
              <dd className="mt-1 text-lg font-semibold" data-testid="compress-new">
                {formatBytes(result.newSize)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">{t("Saved")}</dt>
              <dd className="mt-1 text-lg font-semibold" data-testid="compress-saved">
                {saved}%
              </dd>
            </div>
          </dl>
          <PdfMessage tone="status">
            {saved < 5
              ? t("This file barely shrank. Text-only pages, and pictures that were already compressed, often stay about the same size. The download is the smaller file when one was produced, and the original when it was not. A server-side compressor can sometimes go further.")
              : t("Saved by recompressing embedded images in your browser. A server-side compressor can sometimes shrink the file more by rewriting fonts and streams.")}
            {result.imagesRecompressed > 0 ? ` ${t("Images recompressed")}: ${result.imagesRecompressed}.` : ""}
            {result.imagesAlreadySmall > 0 ? ` ${t("Images left as they were")}: ${result.imagesAlreadySmall}.` : ""}
            {result.imagesSkipped > 0 ? ` ${t("Images skipped")}: ${result.imagesSkipped}.` : ""}
          </PdfMessage>
        </div>
      ) : null}
    </div>
  );
}
