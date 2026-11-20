"use client";

import {
  ENTITLEMENT_REFRESH_MS,
  LICENSE_VERIFY_URL,
  PRO_STORAGE_KEY,
  entitlementActive,
  isHttpsUrl,
  parseVerifyResponse,
} from "@/lib/billing";

export type StoredEntitlement = {
  plan: "pro";
  licenseKey: string;
  expiresAt: string | null;
  checkedAt: string;
};

function emit() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("tbh-pro-change"));
}

function setProClass(on: boolean) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("tbh-pro", on);
}

export function readEntitlement(): StoredEntitlement | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const parsed = JSON.parse(localStorage.getItem(PRO_STORAGE_KEY) || "null") as StoredEntitlement | null;
    if (!parsed || parsed.plan !== "pro" || typeof parsed.licenseKey !== "string") return null;
    if (!entitlementActive(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeEntitlement(value: StoredEntitlement) {
  localStorage.setItem(PRO_STORAGE_KEY, JSON.stringify(value));
  setProClass(true);
  emit();
}

export function clearEntitlement() {
  localStorage.removeItem(PRO_STORAGE_KEY);
  setProClass(false);
  emit();
}

let snapshot = false;
let snapshotRaw: string | null = null;
let entitlementSnapshot: StoredEntitlement | null = null;

export function getProSnapshot(): boolean {
  const raw = localStorage.getItem(PRO_STORAGE_KEY);
  if (raw === snapshotRaw) return snapshot;
  snapshotRaw = raw;
  try {
    const parsed = raw ? (JSON.parse(raw) as StoredEntitlement) : null;
    snapshot = entitlementActive(parsed);
    entitlementSnapshot = snapshot ? parsed : null;
  } catch {
    snapshot = false;
    entitlementSnapshot = null;
  }
  return snapshot;
}

export function getProServerSnapshot(): boolean {
  return false;
}

export function getEntitlementSnapshot(): StoredEntitlement | null {
  const raw = localStorage.getItem(PRO_STORAGE_KEY);
  if (raw === snapshotRaw) return entitlementSnapshot;
  getProSnapshot();
  return entitlementSnapshot;
}

export function getEntitlementServerSnapshot(): StoredEntitlement | null {
  return null;
}

export function subscribePro(onChange: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === PRO_STORAGE_KEY) onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener("tbh-pro-change", onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("tbh-pro-change", onChange);
  };
}

export type ActivateResult =
  | { ok: true }
  | { ok: false; reason: "not_configured" | "invalid" | "rejected" | "network" };

export async function activateLicense(licenseKey: string): Promise<ActivateResult> {
  const key = licenseKey.trim();
  if (key.length < 8 || key.length > 200) return { ok: false, reason: "invalid" };
  if (!isHttpsUrl(LICENSE_VERIFY_URL)) return { ok: false, reason: "not_configured" };
  try {
    const response = await fetch(LICENSE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ licenseKey: key }),
    });
    if (!response.ok) return { ok: false, reason: "rejected" };
    const parsed = parseVerifyResponse(await response.json());
    if (!parsed?.active) return { ok: false, reason: "rejected" };
    writeEntitlement({
      plan: "pro",
      licenseKey: key,
      expiresAt: parsed.expiresAt,
      checkedAt: new Date().toISOString(),
    });
    return { ok: true };
  } catch {
    return { ok: false, reason: "network" };
  }
}

/** 只在定价页调用。工具页不发校验请求。 */
export async function refreshEntitlementIfStale(): Promise<void> {
  const stored = readEntitlement();
  if (!stored || !isHttpsUrl(LICENSE_VERIFY_URL)) return;
  const checked = Date.parse(stored.checkedAt);
  if (Number.isFinite(checked) && Date.now() - checked < ENTITLEMENT_REFRESH_MS) return;
  const result = await activateLicense(stored.licenseKey);
  if (!result.ok && result.reason === "rejected") clearEntitlement();
}
