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

function rgbToHsl(rgb: Rgb): [number, number, number] {
  const [r0, g0, b0] = rgb.map((v) => v / 255) as [number, number, number];
  const max = Math.max(r0, g0, b0);
  const min = Math.min(r0, g0, b0);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return [0, 0, l];
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === r0) h = ((g0 - b0) / d + (g0 < b0 ? 6 : 0)) / 6;
  else if (max === g0) h = ((b0 - r0) / d + 2) / 6;
  else h = ((r0 - g0) / d + 4) / 6;
  return [h, s, l];
}

function hueToRgb(p: number, q: number, t: number): number {
  let x = t;
  if (x < 0) x += 1;
  if (x > 1) x -= 1;
  if (x < 1 / 6) return p + (q - p) * 6 * x;
  if (x < 1 / 2) return q;
  if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6;
  return p;
}

function hslToHex(h: number, s: number, l: number): string {
  const hh = ((h % 1) + 1) % 1;
  if (s === 0) {
    const v = Math.round(l * 255);
    return toHex([v, v, v]);
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return toHex([
    Math.round(hueToRgb(p, q, hh + 1 / 3) * 255),
    Math.round(hueToRgb(p, q, hh) * 255),
    Math.round(hueToRgb(p, q, hh - 1 / 3) * 255),
  ]);
}

function toHex(rgb: Rgb): string {
  return "#" + rgb.map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0")).join("");
}

function shift(hsl: [number, number, number], dh: number, ds = 0, dl = 0): string {
  return hslToHex(hsl[0] + dh / 360, Math.max(0, Math.min(1, hsl[1] + ds)), Math.max(0, Math.min(1, hsl[2] + dl)));
}

export default function ColorPalette() {
  const [base, setBase] = useState("#4ECDC4");

  const rgb = hexToRgb(base);
  const hsl = rgb ? rgbToHsl(rgb) : null;

  const schemes = hsl
    ? [
        { name: "Complementary", colors: [toHex(rgb!), shift(hsl, 180)] },
        { name: "Analogous", colors: [shift(hsl, -30), toHex(rgb!), shift(hsl, 30)] },
        { name: "Triadic", colors: [toHex(rgb!), shift(hsl, 120), shift(hsl, 240)] },
        { name: "Split complementary", colors: [toHex(rgb!), shift(hsl, 150), shift(hsl, 210)] },
        { name: "Tetradic", colors: [toHex(rgb!), shift(hsl, 90), shift(hsl, 180), shift(hsl, 270)] },
      ]
    : [];

  const tints = hsl ? [0.85, 0.7, 0.55, 0.4, 0.25].map((l) => hslToHex(hsl[0], hsl[1], l)) : [];
  const shades = hsl ? [0.35, 0.28, 0.21, 0.14, 0.07].map((l) => hslToHex(hsl[0], hsl[1], l)) : [];
  const all = hsl ? Array.from(new Set(schemes.flatMap((s) => s.colors).concat(tints, shades))) : [];
  const summary = all.join("\n");

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Base colour</label>
        <div className="flex gap-2">
          <input
            type="color"
            value={rgb ? (base.startsWith("#") ? base : "#" + base) : "#000000"}
            onChange={(e) => setBase(e.target.value)}
            className="h-10 w-12 cursor-pointer rounded border border-border bg-transparent p-1"
          />
          <input
            className="tool-input tool-input-sm font-mono"
            value={base}
            onChange={(e) => setBase(e.target.value)}
            placeholder="#4ECDC4"
            spellCheck={false}
          />
        </div>
        {!rgb && (
          <p className="mt-2 text-sm text-muted-foreground">
            Enter a hex colour such as 4ECDC4 or #4ECDC4. Three-digit shorthand such as f0a works too.
          </p>
        )}
      </div>

      {hsl && (
        <>
          <div className="space-y-4">
            {schemes.map((s) => (
              <div key={s.name}>
                <p className="mb-2 text-sm font-medium text-foreground">{s.name}</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {s.colors.map((c) => (
                    <div key={c} className="overflow-hidden rounded-lg border border-border">
                      <div className="h-14 w-full" style={{ backgroundColor: c }} />
                      <p className="px-2 py-1 text-center font-mono text-xs text-muted-foreground">{c}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Tints (towards white)</p>
              <div className="grid grid-cols-5 gap-2">
                {tints.map((c) => (
                  <div key={c} className="overflow-hidden rounded-lg border border-border">
                    <div className="h-12 w-full" style={{ backgroundColor: c }} />
                    <p className="py-1 text-center font-mono text-[10px] text-muted-foreground">{c.replace("#", "")}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Shades (towards black)</p>
              <div className="grid grid-cols-5 gap-2">
                {shades.map((c) => (
                  <div key={c} className="overflow-hidden rounded-lg border border-border">
                    <div className="h-12 w-full" style={{ backgroundColor: c }} />
                    <p className="py-1 text-center font-mono text-[10px] text-muted-foreground">{c.replace("#", "")}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">All values ({all.length})</span>
            <CopyButton text={summary} />
          </div>
          <pre className="tool-result max-h-64 overflow-auto">{summary}</pre>
        </>
      )}
    </div>
  );
}
