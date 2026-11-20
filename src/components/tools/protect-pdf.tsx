"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { recordJob } from "@/lib/job-history";
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

export default function ProtectPdf() {
  const { t } = useI18n();
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const run = async () => {
    if (!file) return;
    if (!password) {
      setError(t("Enter a password."));
      return;
    }
    if (password !== confirm) {
      setError(t("The two passwords do not match."));
      return;
    }
    setBusy(true);
    setError("");
    setStatus("");
    try {
      const { protectPdf } = await import("@/lib/pdf-protect");
      const bytes = await protectPdf(new Uint8Array(await file.arrayBuffer()), password);
      downloadBytes(bytes, outputName(file.name, "protected"));
      setStatus(t("The PDF now asks for this password before it opens. Keep a copy of the password. This page cannot recover it, and it cannot unlock a PDF."));
      recordJob("protect-pdf", "Password-protected a PDF");
    } catch (caught) {
      setError(errorMessage(caught, t("Could not protect that PDF.")));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <PdfMemoryNote />
      <p className="text-sm leading-6 text-muted-foreground">
        {t("This applies standard PDF password protection, so a normal viewer asks for the password before opening the file. It is not a guarantee against a determined attacker, and this page does not unlock PDFs. Use letters, numbers, and symbols. Only the first 32 characters are stored, and accented characters or emoji may not match in every reader.")}
      </p>
      <PdfDrop
        label={t("Select a PDF to protect")}
        fileName={file ? `${file.name} · ${formatBytes(file.size)}` : ""}
        onFile={(next) => {
          setStatus("");
          setError(next && !isPdfFile(next) ? t("Choose a PDF file.") : "");
          setFile(next && isPdfFile(next) ? next : null);
        }}
      />
      <PdfField label={t("Password")} htmlFor="protect-password">
        <input
          id="protect-password"
          type={show ? "text" : "password"}
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="tool-input tool-input-sm"
        />
      </PdfField>
      <PdfField label={t("Confirm password")} htmlFor="protect-confirm">
        <input
          id="protect-confirm"
          type={show ? "text" : "password"}
          autoComplete="new-password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          className="tool-input tool-input-sm"
        />
      </PdfField>
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input type="checkbox" checked={show} onChange={(event) => setShow(event.target.checked)} />
        {t("Show password")}
      </label>
      {password.length > 0 && password.length < 8 ? (
        <PdfMessage tone="status">{t("A short password is easy to guess. You can still use it, but a longer one is safer.")}</PdfMessage>
      ) : null}
      <PdfRunButton busy={busy} disabled={!file || !password || password !== confirm} onClick={run}>
        {t("Protect PDF")}
      </PdfRunButton>
      {status ? <PdfMessage tone="status">{status}</PdfMessage> : null}
      {error ? <PdfMessage tone="error">{error}</PdfMessage> : null}
    </div>
  );
}
