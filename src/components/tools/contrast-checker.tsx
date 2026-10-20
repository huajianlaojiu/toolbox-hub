"use client";
import { useState } from "react";
import CopyButton from "@/components/copy-button";

type Rgb = [number, number, number];

function hexToRgb(hex: string): Rgb | null {
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function luminance(rgb: Rgb): number {
  const a = rgb.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

function contrast(a: Rgb, b: Rgb): number {
  const l1 = luminance(a);
  const l2 = luminance(b);
  const hi = Math.max(l1, l2);
  const lo = Math.min(l1, l2);
  return (hi + 0.05) / (lo + 0.05);
}

function verdict(r: number) {
  const pass = (x: number) => (r >= x ? "Pass" : "Fail");
  return [
    { label: "Normal text (AA)", need: "4.5:1", ok: pass(4.5) },
    { label: "Normal text (AAA)", need: "7:1", ok: pass(7) },
    { label: "Large text 18pt+ (AA)", need: "3:1", ok: pass(3) },
    { label: "Large text 18pt+ (AAA)", need: "4.5:1", ok: pass(4.5) },
    { label: "UI components and graphics (AA)", need: "3:1", ok: pass(3) },
  ];
}

export default function ContrastChecker() {
  const [fg, setFg] = useState("#1a1a1a");
  const [bg, setBg] = useState("#ffffff");

  const f = hexToRgb(fg);
  const b = hexToRgb(bg);
  const r = f && b ? contrast(f, b) : null;
  const rows = r !== null ? verdict(r) : [];
  const summary =
    r === null
      ? ""
      : `Text: ${fg}\nBackground: ${bg}\nContrast ratio: ${r.toFixed(2)}:1\n\n${rows
          .map((x) => `${x.label} (needs ${x.need}): ${x.ok}`)
          .join("\n")}`;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Text colour</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={f ? fg : "#000000"}
              onChange={(e) => setFg(e.target.value)}
              className="h-10 w-12 cursor-pointer rounded border border-border bg-transparent p-1"
            />
            <input
              className="tool-input tool-input-sm font-mono"
              value={fg}
              onChange={(e) => setFg(e.target.value)}
              placeholder="#1a1a1a"
              spellCheck={false}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Background colour</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={b ? bg : "#ffffff"}
              onChange={(e) => setBg(e.target.value)}
              className="h-10 w-12 cursor-pointer rounded border border-border bg-transparent p-1"
            />
            <input
              className="tool-input tool-input-sm font-mono"
              value={bg}
              onChange={(e) => setBg(e.target.value)}
              placeholder="#ffffff"
              spellCheck={false}
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border p-6 text-center">
        <p className="text-2xl font-semibold" style={{ color: f ? fg : undefined, backgroundColor: b ? bg : undefined }}>
          The quick brown fox
        </p>
        <p className="mt-2 text-sm" style={{ color: f ? fg : undefined, backgroundColor: b ? bg : undefined }}>
          Small body text at 14px
        </p>
      </div>

      {r === null ? (
        <p className="text-sm text-muted-foreground">
          Enter two hex colours, for example 1a1a1a and ffffff. Three-digit hex such as f0a is also accepted.
        </p>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Contrast ratio</span>
            <span className="text-2xl font-bold tabular-nums">{r.toFixed(2)}:1</span>
          </div>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 text-foreground">{row.label}</td>
                    <td className="px-3 py-2 text-muted-foreground">needs {row.need}</td>
                    <td
                      className={`px-3 py-2 text-right font-medium ${
                        row.ok === "Pass" ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"
                      }`}
                    >
                      {row.ok}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Result</span>
            <CopyButton text={summary} />
          </div>
          <pre className="tool-result max-h-64 overflow-auto">{summary}</pre>
        </div>
      )}
    </div>
  );
}
