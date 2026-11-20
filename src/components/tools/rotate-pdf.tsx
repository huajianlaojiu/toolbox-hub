"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { recordJob } from "@/lib/job-history";
import { parsePageSelection } from "@/lib/pdf-edit";
import {
  PdfDrop,
  PdfField,
  PdfMemoryNote,
  PdfMessage,
  PdfRunButton,
  downloadBytes,
  errorMessage,
  formatBytes,
  isPdfFile,
  outputName,
} from "./pdf-job-ui";

const TURNS = [90, 180, 270] as const;

export default function RotatePdf() {
  const { t } = useI18n();
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [turn, setTurn] = useState<(typeof TURNS)[number]>(90);
  const [allPages, setAllPages] = useState(true);
  const [picked, setPicked] = useState<number[]>([]);
  const [range, setRange] = useState("1");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const loadCount = async (next: File) => {
    setPageCount(0);
    setPicked([]);
    try {
      const { loadPdf } = await import("@/lib/pdf-load");
      const doc = await loadPdf(new Uint8Array(await next.arrayBuffer()));
      const count = doc.getPageCount();
      setPageCount(count);
      setPicked(count > 0 ? [1] : []);
      setRange("1");
    } catch (caught) {
      setError(errorMessage(caught, t("Could not read that PDF.")));
    }
  };

  const togglePage = (page: number) => {
    setPicked((current) => (current.includes(page) ? current.filter((item) => item !== page) : [...current, page].sort((a, b) => a - b)));
  };

  const run = async () => {
    if (!file) return;
    setBusy(true);
    setError("");
    setStatus("");
    try {
      const pages = allPages ? "all" : pageCount > 40 ? parsePageSelection(range, pageCount) : picked;
      const { rotatePdf } = await import("@/lib/pdf-edit");
      const bytes = await rotatePdf(new Uint8Array(await file.arrayBuffer()), turn, pages);
      downloadBytes(bytes, outputName(file.name, "rotated"));
      const count = pages === "all" ? pageCount : pages.length;
      setStatus(t("Rotated the selected pages. The new PDF has downloaded."));
      recordJob("rotate-pdf", `Rotated ${count} page(s) by ${turn}°`);
    } catch (caught) {
      setError(errorMessage(caught, t("Could not rotate that PDF.")));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <PdfMemoryNote />
      <p className="text-sm leading-6 text-muted-foreground">
        {t("Turn every page, or only the pages you pick, by a right angle. The turn is added to any rotation already stored in the file.")}
      </p>
      <PdfDrop
        label={t("Select a PDF to rotate")}
        fileName={file ? `${file.name} · ${formatBytes(file.size)}${pageCount ? ` · ${pageCount} ${t("pages")}` : ""}` : ""}
        onFile={(next) => {
          setFile(next);
          setError("");
          setStatus("");
          setAllPages(true);
          if (next && isPdfFile(next)) void loadCount(next);
          else if (next) setError(t("Choose a PDF file."));
        }}
      />
      <div className="flex flex-wrap gap-2">
        {TURNS.map((degrees) => (
          <button
            key={degrees}
            type="button"
            aria-pressed={turn === degrees}
            onClick={() => setTurn(degrees)}
            className={`tool-btn min-h-11 ${turn === degrees ? "tool-btn-primary" : "tool-btn-secondary"}`}
          >
            {degrees}°
          </button>
        ))}
      </div>
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input type="checkbox" checked={allPages} onChange={(event) => setAllPages(event.target.checked)} />
        {t("All pages")}
      </label>
      {!allPages && pageCount > 0 && pageCount <= 40 ? (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => {
            const on = picked.includes(page);
            return (
              <button
                key={page}
                type="button"
                aria-pressed={on}
                onClick={() => togglePage(page)}
                className={`inline-flex h-11 min-w-11 items-center justify-center rounded-lg border text-sm font-medium ${on ? "border-primary bg-primary text-primary-foreground" : "bg-card"}`}
              >
                {page}
              </button>
            );
          })}
        </div>
      ) : null}
      {!allPages && pageCount > 40 ? (
        <PdfField label={t("Pages to rotate, such as 1-3, 5")} htmlFor="rotate-range">
          <input id="rotate-range" value={range} onChange={(event) => setRange(event.target.value)} className="tool-input tool-input-sm" />
        </PdfField>
      ) : null}
      <PdfRunButton busy={busy} disabled={!file || pageCount < 1} onClick={run}>
        {t("Rotate PDF")}
      </PdfRunButton>
      {status ? <PdfMessage tone="status">{status}</PdfMessage> : null}
      {error ? <PdfMessage tone="error">{error}</PdfMessage> : null}
    </div>
  );
}
