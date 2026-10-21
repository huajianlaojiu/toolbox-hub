"use client";
import { useState } from "react";
import CopyButton from "@/components/copy-button";

const BASES = [
  { id: "auto", label: "Auto" },
  { id: "2", label: "Binary (2)" },
  { id: "8", label: "Octal (8)" },
  { id: "10", label: "Decimal (10)" },
  { id: "16", label: "Hex (16)" },
] as const;

const DIGITS: Record<string, RegExp> = {
  "2": /^[01]+$/,
  "8": /^[0-7]+$/,
  "10": /^-?\d+$/,
  "16": /^[0-9a-fA-F]+$/,
};

function detect(raw: string): { base: string; body: string } | null {
  const s = raw.trim().replace(/[\s_,]/g, "");
  if (!s) return null;
  const lower = s.toLowerCase();
  const sign = lower.startsWith("-") ? "-" : "";
  if (/^-?0x[0-9a-f]+$/.test(lower)) return { base: "16", body: sign + lower.replace(/^-?0x/, "") };
  if (/^-?0b[01]+$/.test(lower)) return { base: "2", body: sign + lower.replace(/^-?0b/, "") };
  if (/^-?0o[0-7]+$/.test(lower)) return { base: "8", body: sign + lower.replace(/^-?0o/, "") };
  for (const b of ["16", "10", "8", "2"]) {
    if (DIGITS[b].test(s)) return { base: b, body: s };
  }
  return null;
}

function group(value: string, size: number) {
  return value.replace(new RegExp(`(.{${size}})(?=.)`, "g"), "$1 ");
}

export default function NumberBaseConverter() {
  const [input, setInput] = useState("255");
  const [base, setBase] = useState<string>("auto");

  const trimmed = input.trim();
  const detected = detect(trimmed);
  const chosen = base === "auto" ? detected?.base ?? null : base;
  const body = base === "auto" ? detected?.body ?? null : trimmed.replace(/[\s_,]/g, "");

  let value: bigint | null = null;
  let error = "";

  if (trimmed && chosen && body !== null) {
    if (DIGITS[chosen] && !DIGITS[chosen].test(body.replace(/^-/, ""))) {
      error = `That value is not valid in base ${chosen}.`;
    } else {
      try {
        const prefix = chosen === "2" ? "0b" : chosen === "8" ? "0o" : chosen === "16" ? "0x" : "";
        value = BigInt(prefix + body);
      } catch {
        error = "Could not parse that value.";
      }
    }
  }

  const negative = value !== null && value < BigInt(0);
  const abs = value !== null ? (negative ? -value : value) : null;

  const out =
    abs === null
      ? ""
      : [
          `Decimal: ${negative ? "-" : ""}${abs.toString(10)}`,
          `Binary: ${negative ? "-" : ""}${group(abs.toString(2), 4)}`,
          `Octal: ${negative ? "-" : ""}${abs.toString(8)}`,
          `Hex: ${negative ? "-" : ""}${abs.toString(16).toUpperCase()}`,
        ].join("\n");

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Value</label>
        <input
          className="tool-input tool-input-sm font-mono"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="255, 0xFF, 1111 1111"
          spellCheck={false}
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Leave the base on Auto and the converter reads <code>0x</code>, <code>0b</code> and <code>0o</code> prefixes for
          you. Pick a base to force one.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {BASES.map((b) => (
          <button
            key={b.id}
            onClick={() => setBase(b.id)}
            className={`tool-btn ${base === b.id ? "tool-btn-primary" : "tool-btn-secondary"}`}
          >
            {b.label}
          </button>
        ))}
      </div>

      {error ? (
        <p className="text-sm text-muted-foreground">{error}</p>
      ) : value === null ? (
        <p className="text-sm text-muted-foreground">Enter a value in any base to see all four at once.</p>
      ) : (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: "Decimal", text: `${negative ? "-" : ""}${abs!.toString(10)}` },
              { label: "Hexadecimal", text: `${negative ? "-" : ""}${abs!.toString(16).toUpperCase()}` },
              { label: "Binary", text: `${negative ? "-" : ""}${group(abs!.toString(2), 4)}` },
              { label: "Octal", text: `${negative ? "-" : ""}${abs!.toString(8)}` },
            ].map((row) => (
              <div key={row.label} className="rounded-xl border border-border p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">{row.label}</p>
                  <CopyButton text={row.text.replace(/ /g, "")} />
                </div>
                <p className="mt-1 break-all font-mono text-sm text-foreground">{row.text}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Result</span>
            <CopyButton text={out} />
          </div>
          <pre className="tool-result max-h-96 overflow-auto">{out}</pre>
        </div>
      )}
    </div>
  );
}
