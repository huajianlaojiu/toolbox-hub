"use client";
import { useState } from "react";
import CopyButton from "@/components/copy-button";

export default function BorderRadiusGenerator() {
  const [tl, setTl] = useState(12);
  const [tr, setTr] = useState(12);
  const [br, setBr] = useState(12);
  const [bl, setBl] = useState(12);
  const [linked, setLinked] = useState(true);

  const setAll = (v: number) => {
    setTl(v);
    setTr(v);
    setBr(v);
    setBl(v);
  };

  const css =
    tl === tr && tr === br && br === bl
      ? `border-radius: ${tl}px;`
      : `border-radius: ${tl}px ${tr}px ${br}px ${bl}px;`;

  const corners: { label: string; value: number; set: (v: number) => void }[] = [
    { label: "Top left", value: tl, set: (v) => (linked ? setAll(v) : setTl(v)) },
    { label: "Top right", value: tr, set: (v) => (linked ? setAll(v) : setTr(v)) },
    { label: "Bottom right", value: br, set: (v) => (linked ? setAll(v) : setBr(v)) },
    { label: "Bottom left", value: bl, set: (v) => (linked ? setAll(v) : setBl(v)) },
  ];

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" checked={linked} onChange={(e) => setLinked(e.target.checked)} />
        Link all four corners
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        {corners.map((c) => (
          <label key={c.label} className="flex items-center gap-3 text-sm text-foreground">
            <span className="w-28 shrink-0">{c.label}</span>
            <input
              type="range"
              min={0}
              max={150}
              value={c.value}
              onChange={(e) => c.set(Number(e.target.value))}
              className="w-full"
            />
            <span className="w-12 shrink-0 tabular-nums">{c.value}px</span>
          </label>
        ))}
      </div>

      <div className="flex items-center justify-center rounded-xl border border-border bg-muted/30 p-10">
        <div
          className="h-32 w-48 bg-primary/80"
          style={{ borderRadius: `${tl}px ${tr}px ${br}px ${bl}px` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">CSS</span>
        <CopyButton text={css} />
      </div>
      <pre className="tool-result">{css}</pre>
    </div>
  );
}
