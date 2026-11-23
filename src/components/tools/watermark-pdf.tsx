"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { recordJob } from "@/lib/job-history";
import type { WatermarkInput } from "@/lib/pdf-edit";
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

const ANCHORS: WatermarkInput["anchor"][] = ["center", "top-left", "top-right", "bottom-left", "bottom-right"];

const ANCHOR_LABELS: Record<WatermarkInput["anchor"], string> = {
  center: "Center",
  "top-left": "Top left",
  "top-right": "Top right",
  "bottom-left": "Bottom left",
  "bottom-right": "Bottom right",
};

function imageKind(file: File): "png" | "jpg" | null {
  const name = file.name.toLowerCase();
  if (file.type === "image/png" || name.endsWith(".png")) return "png";
  if (file.type === "image/jpeg" || name.endsWith(".jpg") || name.endsWith(".jpeg")) return "jpg";
  return null;
}

export default function WatermarkPdf() {
  const { t } = useI18n();
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("DRAFT");
  const [image, setImage] = useState<File | null>(null);
  const [anchor, setAnchor] = useState<WatermarkInput["anchor"]>("center");
  const [opacity, setOpacity] = useState(0.35);
  const [rotation, setRotation] = useState(45);
  const [fontSize, setFontSize] = useState(48);
  const [imageWidth, setImageWidth] = useState(30);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const run = async () => {
    if (!file) return;
    setBusy(true);
    setError("");
    setStatus("");
    try {
      const kind = image ? imageKind(image) : null;
      if (image && !kind) throw new Error(t("The watermark image needs to be a PNG or JPG."));
      const { watermarkPdf } = await import("@/lib/pdf-edit");
      const bytes = await watermarkPdf(new Uint8Array(await file.arrayBuffer()), {
        text,
        imageBytes: image ? new Uint8Array(await image.arrayBuffer()) : undefined,
        imageKind: kind ?? undefined,
        anchor,
        opacity,
        rotation,
        fontSize,
        imageWidthRatio: imageWidth / 100,
      });
      downloadBytes(bytes, outputName(file.name, "watermarked"));
      setStatus(t("The watermarked PDF has downloaded."));
      recordJob("watermark-pdf", image ? "Stamped text and an image on a PDF" : "Stamped text on a PDF");
    } catch (caught) {
      setError(errorMessage(caught, t("Could not watermark that PDF.")));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <PdfMemoryNote />
      <p className="text-sm leading-6 text-muted-foreground">
        {t("Stamp text, a PNG or JPG, or both, on every page. Position, opacity, rotation, and size are applied to the downloaded file.")}
      </p>
      <PdfDrop
        label={t("Select a PDF to watermark")}
        fileName={file ? `${file.name} · ${formatBytes(file.size)}` : ""}
        onFile={(next) => {
          setStatus("");
          setError(next && !isPdfFile(next) ? t("Choose a PDF file.") : "");
          setFile(next && isPdfFile(next) ? next : null);
        }}
      />
      <PdfField label={t("Watermark text")} htmlFor="watermark-text">
        <input id="watermark-text" value={text} onChange={(event) => setText(event.target.value)} className="tool-input tool-input-sm" />
      </PdfField>
      <PdfField label={t("Image, optional PNG or JPG")} htmlFor="watermark-image">
        <input
          id="watermark-image"
          type="file"
          accept="image/png,image/jpeg,.png,.jpg,.jpeg"
          className="block w-full cursor-pointer text-sm text-foreground file:mr-3 file:inline-flex file:min-h-11 file:cursor-pointer file:items-center file:rounded-lg file:border file:border-border file:bg-muted file:px-3 file:py-2 file:text-sm file:font-medium file:text-foreground"
          onChange={(event) => setImage(event.target.files?.[0] ?? null)}
        />
      </PdfField>
      <PdfField label={t("Position")} htmlFor="watermark-position">
        <select id="watermark-position" value={anchor} onChange={(event) => setAnchor(event.target.value as WatermarkInput["anchor"])} className="tool-input tool-input-sm">
          {ANCHORS.map((id) => (
            <option key={id} value={id}>
              {t(ANCHOR_LABELS[id])}
            </option>
          ))}
        </select>
      </PdfField>
      <PdfField label={`${t("Opacity")}: ${Math.round(opacity * 100)}%`} htmlFor="watermark-opacity">
        <input id="watermark-opacity" type="range" min={5} max={100} value={Math.round(opacity * 100)} onChange={(event) => setOpacity(Number(event.target.value) / 100)} className="w-full" />
      </PdfField>
      <PdfField label={`${t("Rotation")}: ${rotation}°`} htmlFor="watermark-rotation">
        <input id="watermark-rotation" type="range" min={-180} max={180} step={5} value={rotation} onChange={(event) => setRotation(Number(event.target.value))} className="w-full" />
      </PdfField>
      <PdfField label={`${t("Text size")}: ${fontSize}`} htmlFor="watermark-size">
        <input id="watermark-size" type="range" min={12} max={120} value={fontSize} onChange={(event) => setFontSize(Number(event.target.value))} className="w-full" />
      </PdfField>
      {image ? (
        <PdfField label={`${t("Image width")}: ${imageWidth}%`} htmlFor="watermark-width">
          <input id="watermark-width" type="range" min={10} max={80} value={imageWidth} onChange={(event) => setImageWidth(Number(event.target.value))} className="w-full" />
        </PdfField>
      ) : null}
      <PdfRunButton busy={busy} disabled={!file || (!text.trim() && !image)} onClick={run}>
        {t("Stamp PDF")}
      </PdfRunButton>
      {status ? <PdfMessage tone="status">{status}</PdfMessage> : null}
      {error ? <PdfMessage tone="error">{error}</PdfMessage> : null}
    </div>
  );
}
