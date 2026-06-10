"use client";
import { useState } from "react";
import { Pipette } from "lucide-react";
import CopyButton from "@/components/copy-button";

function hexToRgb(hex: string) { const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex); return r ? { r: parseInt(r[1], 16), g: parseInt(r[2], 16), b: parseInt(r[3], 16) } : null; }
function rgbToHex(r: number, g: number, b: number) { return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join(""); }
function rgbToHsl(r: number, g: number, b: number) { r /= 255; g /= 255; b /= 255; const max = Math.max(r, g, b), min = Math.min(r, g, b); let h = 0, s: number; const l = (max + min) / 2; if (max === min) { h = s = 0; } else { const d = max - min; s = l > 0.5 ? d / (2 - max - min) : d / (max + min); switch (max) { case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break; case g: h = ((b - r) / d + 2) / 6; break; case b: h = ((r - g) / d + 4) / 6; break; } } return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }; }

export default function ColorConverter() {
  const [color, setColor] = useState("#2563eb");
  const rgb = hexToRgb(color);
  const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer rounded-lg border px-3 py-2 hover:border-primary transition-colors">
            <div className="h-6 w-6 rounded" style={{ backgroundColor: color }} />
            <span className="text-sm font-medium text-foreground">{color}</span>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="sr-only" />
          </label>
        </div>
        <input className="tool-input tool-input-sm font-mono w-28" value={color} onChange={(e) => setColor(e.target.value)} placeholder="#2563eb" />
        <CopyButton text={color} />
      </div>
      {rgb ? (
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "HEX", value: color },
            { label: "RGB", value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
            { label: "HSL", value: hsl ? `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` : "" },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border bg-muted/30 p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-foreground">{item.label}</span>
                <CopyButton text={item.value} />
              </div>
              <p className="font-mono text-sm text-muted-foreground">{item.value}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-red-500">Invalid color format. Use #RRGGBB.</p>
      )}
    </div>
  );
}