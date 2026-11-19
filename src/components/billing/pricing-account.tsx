"use client";

import { useEffect, useState, useSyncExternalStore, type FormEvent } from "react";
import { LICENSE_VERIFY_URL, isHttpsUrl } from "@/lib/billing";
import { exportJobsJson, getJobsServerSnapshot, listJobs, subscribeJobs } from "@/lib/job-history";
import {
  activateLicense,
  clearEntitlement,
  getEntitlementServerSnapshot,
  getEntitlementSnapshot,
  refreshEntitlementIfStale,
  subscribePro,
  type ActivateResult,
} from "@/lib/pro-storage";

function message(result: ActivateResult): string {
  if (result.ok) return "Pro is active on this browser.";
  if (result.reason === "not_configured") {
    return "License checks are not connected yet. Set NEXT_PUBLIC_LICENSE_VERIFY_URL to your verify endpoint and rebuild. Pasting a key does not unlock Pro until that endpoint says the key is active.";
  }
  if (result.reason === "invalid") return "Enter the license key from the receipt email. It should be at least 8 characters.";
  if (result.reason === "network") return "The verify endpoint did not respond. Your files were not sent. Try again when you are online.";
  return "That key was not accepted. Check the receipt email, or use the free tools in the meantime.";
}

export default function PricingAccount() {
  const entitlement = useSyncExternalStore(subscribePro, getEntitlementSnapshot, getEntitlementServerSnapshot);
  const jobs = useSyncExternalStore(subscribeJobs, listJobs, getJobsServerSnapshot);
  const isPro = entitlement != null;
  const [key, setKey] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [exportNote, setExportNote] = useState(false);
  const verifyReady = isHttpsUrl(LICENSE_VERIFY_URL);
  const last4 = entitlement?.licenseKey.slice(-4);

  useEffect(() => {
    void refreshEntitlementIfStale();
  }, []);

  async function onActivate(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setStatus("");
    try {
      const result = await activateLicense(key);
      setStatus(message(result));
      if (result.ok) setKey("");
    } finally {
      setBusy(false);
    }
  }

  function onExport() {
    if (!isPro) {
      setExportNote(true);
      return;
    }
    const blob = new Blob([exportJobsJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "toolbox-hub-jobs.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    setExportNote(false);
  }

  return (
    <div className="space-y-10">
      <section id="activate" className="scroll-mt-24">
        <h2 className="text-xl font-semibold text-foreground">Already subscribed?</h2>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          Paste the license key from the receipt email. The key is checked by the verify endpoint, then a Pro flag is
          saved in this browser only. Tool inputs are not part of that request.
        </p>
        {isPro && (
          <p className="mt-3 text-sm text-foreground" role="status">
            Pro is on for this browser{last4 ? ` (key ending ${last4})` : ""}.
          </p>
        )}
        <form onSubmit={onActivate} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="license-key">
            License key
          </label>
          <input
            id="license-key"
            value={key}
            onChange={(event) => setKey(event.target.value)}
            autoComplete="off"
            spellCheck={false}
            placeholder="License key"
            className="min-h-11 w-full rounded-lg border bg-card px-3 text-base text-foreground"
          />
          <button
            type="submit"
            disabled={busy}
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {busy ? "Checking…" : "Activate"}
          </button>
        </form>
        {!verifyReady && (
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Activation is waiting on <code className="text-foreground">NEXT_PUBLIC_LICENSE_VERIFY_URL</code>. Until that
            HTTPS endpoint is set at build time, this form cannot turn Pro on.
          </p>
        )}
        {status && (
          <p className="mt-3 text-sm leading-7 text-muted-foreground" role="status">
            {status}
          </p>
        )}
        {isPro && (
          <button
            type="button"
            onClick={() => {
              clearEntitlement();
              setStatus("Pro was removed from this browser. The subscription itself is cancelled with the merchant, not here.");
            }}
            className="mt-3 text-sm text-muted-foreground underline underline-offset-4"
          >
            Remove Pro from this browser
          </button>
        )}
      </section>

      <section id="history" className="scroll-mt-24">
        <h2 className="text-xl font-semibold text-foreground">Job list on this browser</h2>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          Batch tools leave a short summary here: tool name, time, and what ran. File names and file contents are not
          stored. The list below is free to read and copy. Downloading the JSON file is part of Pro.
        </p>
        {jobs.length === 0 ? (
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            No jobs yet. Merge a PDF, pack an archive, merge videos, or capture frames, then come back.
          </p>
        ) : (
          <ul className="mt-4 divide-y rounded-lg border">
            {jobs.map((job) => (
              <li key={job.id} className="px-4 py-3 text-sm">
                <span className="font-medium text-foreground">{job.summary}</span>
                <span className="mt-1 block text-muted-foreground">
                  {job.tool} · {job.at}
                </span>
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          onClick={onExport}
          disabled={jobs.length === 0}
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg border px-4 text-sm font-medium text-foreground disabled:opacity-50"
        >
          Download history JSON
        </button>
        {exportNote && (
          <p className="mt-3 text-sm leading-6 text-muted-foreground" role="status">
            The list above stays on this page, so you can select and copy it. The file download is part of Pro.{" "}
            <a href="#plans" className="font-medium text-foreground underline underline-offset-4">
              See the plans
            </a>
            . Single-job tools keep working either way.
          </p>
        )}
      </section>
    </div>
  );
}
