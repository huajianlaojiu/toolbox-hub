"use client";
import { useState } from "react";
import CopyButton from "@/components/copy-button";

export default function GradientGenerator() {
  const [from, setFrom] = useState("#667eea");
  const [to, setTo] = useState("#764ba2");
  const [angle, setAngle] = useState(135);
  const [type, setType] = useState<"linear" | "radial">("linear");

  const css =
    type === "linear"
      ? `background: linear-gradient(${angle}deg, ${from} 0%, ${to} 100%);`
      : `background: radial-gradient(circle, ${from} 0%, ${to} 100%);`;

  const background =
    type === "linear"
      ? `linear-gradient(${angle}deg, ${from} 0%, ${to} 100%)`
      : `radial-gradient(circle, ${from} 0%, ${to} 100%)`;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Start colour</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="h-10 w-12 cursor-pointer rounded border border-border bg-transparent p-1"
            />
            <input
              className="tool-input tool-input-sm font-mono"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              spellCheck={false}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">End colour</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="h-10 w-12 cursor-pointer rounded border border-border bg-transparent p-1"
            />
            <input
              className="tool-input tool-input-sm font-mono"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              spellCheck={false}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setType("linear")}
            className={`tool-btn ${type === "linear" ? "tool-btn-primary" : "tool-btn-secondary"}`}
          >
            Linear
          </button>
          <button
            onClick={() => setType("radial")}
            className={`tool-btn ${type === "radial" ? "tool-btn-primary" : "tool-btn-secondary"}`}
          >
            Radial
          </button>
        </div>
        {type === "linear" && (
          <label className="flex items-center gap-3 text-sm text-foreground">
            Angle
            <input
              type="range"
              min={0}
              max={360}
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
              className="w-48"
            />
            <span className="w-12 tabular-nums">{angle}&deg;</span>
          </label>
        )}
      </div>

      <div className="h-40 w-full rounded-xl border border-border" style={{ background }} />

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">CSS</span>
        <CopyButton text={css} />
      </div>
      <pre className="tool-result">{css}</pre>
    </div>
  );
}
