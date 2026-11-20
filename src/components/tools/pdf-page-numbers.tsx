"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { recordJob } from "@/lib/job-history";
import type { PageNumberInput } from "@/lib/pdf-edit";
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

const POSITIONS: { id: PageNumberInput["anchor"]; label: string }[] = [
  { id: "bottom-center", label: "Bottom center" },
  { id: "bottom-left", label: "Bottom left" },
  { id: "bottom-right", label: "Bottom right" },
  { id: "top-center", label: "Top center" },
  { id: "top-left", label: "Top left" },
  { id: "top-right", label: "Top right" },
];

export default function PdfPageNumbers() {
  const { t } = useI18n();
  const [file, setFile] = useState<File | null>(null);
  const [anchor, setAnchor] = useState<PageNumberInput["anchor"]>("bottom-center");
  const [font, setFont] = useState<PageNumberInput["font"]>("helvetica");
  const [fontSize, setFontSize] = useState(12);
  const [start, setStart] = useState(1);
  const [format, setFormat] = useState<PageNumberInput["format"]>("n");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const run = async () => {
    if (!file) return;
    setBusy(true);
    setError("");
    setStatus("");
    try {
      const { numberPdf } = await import("@/lib/pdf-edit");
      const bytes = await numberPdf(new Uint8Array(await file.arrayBuffer()), {
        anchor,
        font,
        fontSize,
        start,
        format,
      });
      downloadBytes(bytes, outputName(file.name, "numbered"));
      setStatus(t("Page numbers were added. The new PDF has downloaded."));
      recordJob("pdf-page-numbers", `Numbered a PDF from ${start}`);
    } catch (caught) {
      setError(errorMessage(caught, t("Could not number that PDF.")));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <PdfMemoryNote />
      <p className="text-sm leading-6 text-muted-foreground">
        {t("Add a page number to every page. You can set where it sits, the type size, the typeface, and the number the first page uses.")}
      </p>
      <PdfDrop
        label={t("Select a PDF to number")}
        fileName={file ? `${file.name} · ${formatBytes(file.size)}` : ""}
        onFile={(next) => {
          setStatus("");
          setError(next && !isPdfFile(next) ? t("Choose a PDF file.") : "");
          setFile(next && isPdfFile(next) ? next : null);
        }}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <PdfField label={t("Position")} htmlFor="number-position">
          <select id="number-position" value={anchor} onChange={(event) => setAnchor(event.target.value as PageNumberInput["anchor"])} className="tool-input tool-input-sm">
            {POSITIONS.map((item) => (
              <option key={item.id} value={item.id}>
                {t(item.label)}
              </option>
            ))}
          </select>
        </PdfField>
        <PdfField label={t("Typeface")} htmlFor="number-font">
          <select id="number-font" value={font} onChange={(event) => setFont(event.target.value as PageNumberInput["font"])} className="tool-input tool-input-sm">
            <option value="helvetica">Helvetica</option>
            <option value="times">Times</option>
            <option value="courier">Courier</option>
          </select>
        </PdfField>
      </div>
      <PdfField label={`${t("Font size")}: ${fontSize}`} htmlFor="number-size">
        <input id="number-size" type="range" min={8} max={36} value={fontSize} onChange={(event) => setFontSize(Number(event.target.value))} className="w-full" />
      </PdfField>
      <div className="grid gap-3 sm:grid-cols-2">
        <PdfField label={t("Start at")} htmlFor="number-start">
          <input id="number-start" type="number" min={0} max={99999} value={start} onChange={(event) => setStart(Number(event.target.value))} className="tool-input tool-input-sm" />
        </PdfField>
        <PdfField label={t("Format")} htmlFor="number-format">
          <select id="number-format" value={format} onChange={(event) => setFormat(event.target.value as PageNumberInput["format"])} className="tool-input tool-input-sm">
            <option value="n">{t("Number only")}</option>
            <option value="page">{t("Page 1")}</option>
            <option value="of">{t("1 of 4")}</option>
          </select>
        </PdfField>
      </div>
      <PdfRunButton busy={busy} disabled={!file} onClick={run}>
        {t("Add page numbers")}
      </PdfRunButton>
      {status ? <PdfMessage tone="status">{status}</PdfMessage> : null}
      {error ? <PdfMessage tone="error">{error}</PdfMessage> : null}
    </div>
  );
}
