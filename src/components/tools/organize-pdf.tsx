"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { recordJob } from "@/lib/job-history";
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

type Card = { sourceIndex: number; url: string | null };

async function loadPdfjs() {
  const mod = await import("pdfjs-dist");
  mod.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  return mod;
}

export default function OrganizePdf() {
  const { t } = useI18n();
  const [file, setFile] = useState<File | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [preparing, setPreparing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const previewUrls = useRef<string[]>([]);
  const requestId = useRef(0);

  useEffect(() => {
    const urls = previewUrls;
    return () => {
      urls.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const prepare = async (next: File) => {
    const id = ++requestId.current;
    previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
    previewUrls.current = [];
    setPreparing(true);
    setCards([]);
    setError("");
    setStatus("");
    try {
      const pdfjs = await loadPdfjs();
      const doc = await pdfjs.getDocument({ data: new Uint8Array(await next.arrayBuffer()) }).promise;
      const built: Card[] = [];
      for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
        if (requestId.current !== id) return;
        setStatus(`${t("Preparing page thumbnails…")} ${pageNumber}/${doc.numPages}`);
        const page = await doc.getPage(pageNumber);
        const base = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({ scale: Math.min(0.35, 160 / base.width) });
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.floor(viewport.width));
        canvas.height = Math.max(1, Math.floor(viewport.height));
        await page.render({ canvas, viewport }).promise;
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob((value) => resolve(value), "image/jpeg", 0.7));
        page.cleanup();
        const url = blob ? URL.createObjectURL(blob) : null;
        if (url) previewUrls.current.push(url);
        built.push({ sourceIndex: pageNumber - 1, url });
      }
      if (requestId.current === id) {
        setCards(built);
        setStatus("");
      }
    } catch (caught) {
      if (requestId.current !== id) return;
      const message = errorMessage(caught, t("Could not read that PDF."));
      setError(/password/i.test(message) ? t("This PDF is already password-protected. These tools do not unlock PDFs.") : message);
    } finally {
      if (requestId.current === id) setPreparing(false);
    }
  };

  const move = (index: number, direction: -1 | 1) => {
    setCards((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next;
    });
  };

  const remove = (index: number) => {
    setCards((current) => (current.length < 2 ? current : current.filter((_, item) => item !== index)));
  };

  const run = async () => {
    if (!file || cards.length === 0) return;
    setBusy(true);
    setError("");
    setStatus("");
    try {
      const { organizePdf } = await import("@/lib/pdf-edit");
      const bytes = await organizePdf(
        new Uint8Array(await file.arrayBuffer()),
        cards.map((card) => card.sourceIndex),
      );
      downloadBytes(bytes, outputName(file.name, "organized"));
      setStatus(t("The new page order has downloaded."));
      recordJob("organize-pdf", `Organized a PDF into ${cards.length} page(s)`);
    } catch (caught) {
      setError(errorMessage(caught, t("Could not organize that PDF.")));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <PdfMemoryNote />
      <p className="text-sm leading-6 text-muted-foreground">
        {t("Move pages up or down, or remove a page, then download the new document. The buttons are sized for a thumb.")}
      </p>
      <PdfDrop
        label={t("Select a PDF to organize")}
        fileName={file ? `${file.name} · ${formatBytes(file.size)}` : ""}
        onFile={(next) => {
          if (!next) {
            requestId.current += 1;
            setFile(null);
            setCards([]);
            setPreparing(false);
            return;
          }
          if (!isPdfFile(next)) {
            setError(t("Choose a PDF file."));
            return;
          }
          setFile(next);
          void prepare(next);
        }}
      />
      {preparing ? <PdfMessage tone="status">{t("Preparing page thumbnails…")}</PdfMessage> : null}
      {cards.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {cards.map((card, index) => (
            <li key={card.sourceIndex} className="rounded-xl border bg-card p-2">
              <div className="flex aspect-[3/4] items-center justify-center overflow-hidden rounded-md bg-muted">
                {card.url ? (
                  // Local object URL from a canvas preview. next/image cannot optimize it.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={card.url} alt="" className="max-h-full max-w-full object-contain" />
                ) : (
                  <span className="text-xs text-muted-foreground">{t("No preview")}</span>
                )}
              </div>
              <p className="mt-2 text-center text-sm font-medium">
                {t("Page")} {index + 1}
                {card.sourceIndex !== index ? <span className="block text-xs font-normal text-muted-foreground">{t("Was page")} {card.sourceIndex + 1}</span> : null}
              </p>
              <div className="mt-2 grid grid-cols-3 gap-1">
                <button type="button" disabled={index === 0} onClick={() => move(index, -1)} className="tool-btn tool-btn-secondary min-h-11 justify-center px-1 text-xs">
                  {t("Up")}
                </button>
                <button type="button" disabled={index === cards.length - 1} onClick={() => move(index, 1)} className="tool-btn tool-btn-secondary min-h-11 justify-center px-1 text-xs">
                  {t("Down")}
                </button>
                <button type="button" disabled={cards.length < 2} onClick={() => remove(index)} className="tool-btn tool-btn-danger min-h-11 justify-center px-1 text-xs">
                  {t("Remove")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
      <PdfRunButton busy={busy} disabled={!file || cards.length === 0 || preparing} onClick={run}>
        {t("Download PDF")}
      </PdfRunButton>
      {status ? <PdfMessage tone="status">{status}</PdfMessage> : null}
      {error ? <PdfMessage tone="error">{error}</PdfMessage> : null}
    </div>
  );
}
