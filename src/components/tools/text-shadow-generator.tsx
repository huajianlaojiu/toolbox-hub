"use client";
import { useState } from "react";
import CopyButton from "@/components/copy-button";

function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace(/^#/, "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return [parseInt(h.slice(0, 2), 16) || 0, parseInt(h.slice(2, 4), 16) || 0, parseInt(h.slice(4, 6), 16) || 0];
}

export default function TextShadowGenerator() {
  const [x, setX] = useState(2);
  const [y, setY] = useState(2);
  const [blur, setBlur] = useState(4);
  const [color, setColor] = useState("#000000");
  const [opacity, setOpacity] = useState(30);

  const [r, g, b] = hexToRgb(color);
  const rgba = `rgba(${r}, ${g}, ${b}, ${(opacity / 100).toFixed(2)})`;
  const css = `text-shadow: ${x}px ${y}px ${blur}px ${rgba};`;

  const sliders: { label: string; value: number; min: number; max: number; set: (v: number) => void }[] = [
    { label: "Offset X", value: x, min: -30, max: 30, set: setX },
    { label: "Offset Y", value: y, min: -30, max: 30, set: setY },
    { label: "Blur", value: blur, min: 0, max: 50, set: setBlur },
    { label: "Opacity", value: opacity, min: 0, max: 100, set: setOpacity },
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {sliders.map((s) => (
          <label key={s.label} className="flex items-center gap-3 text-sm text-foreground">
            <span className="w-20 shrink-0">{s.label}</span>
            <input
              type="range"
              min={s.min}
              max={s.max}
              value={s.value}
              onChange={(e) => s.set(Number(e.target.value))}
              className="w-full"
            />
            <span className="w-12 shrink-0 tabular-nums">{s.value}</span>
          </label>
        ))}
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground">
        Colour
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="h-10 w-12 cursor-pointer rounded border border-border bg-transparent p-1"
        />
        <input
          className="tool-input tool-input-sm w-32 font-mono"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          spellCheck={false}
        />
      </label>

      <div className="flex items-center justify-center rounded-xl border border-border bg-muted/30 p-10">
        <span className="text-3xl font-semibold text-foreground" style={{ textShadow: `${x}px ${y}px ${blur}px ${rgba}` }}>
          Preview text
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">CSS</span>
        <CopyButton text={css} />
      </div>
      <pre className="tool-result">{css}</pre>
    </div>
  );
}
