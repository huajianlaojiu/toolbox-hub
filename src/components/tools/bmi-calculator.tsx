"use client";
import { useState } from "react";
import CopyButton from "@/components/copy-button";

const BANDS = [
  { max: 18.5, label: "Underweight" },
  { max: 25, label: "Normal weight" },
  { max: 30, label: "Overweight" },
  { max: Infinity, label: "Obese" },
];

export default function BmiCalculator() {
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [kg, setKg] = useState("70");
  const [cm, setCm] = useState("175");
  const [lb, setLb] = useState("154");
  const [ft, setFt] = useState("5");
  const [inches, setInches] = useState("9");

  const weight = unit === "metric" ? parseFloat(kg) : parseFloat(lb) / 2.20462;
  const height =
    unit === "metric" ? parseFloat(cm) / 100 : (parseFloat(ft) * 12 + parseFloat(inches)) * 0.0254;

  const valid = Number.isFinite(weight) && Number.isFinite(height) && weight > 0 && height > 0;
  const bmi = valid ? weight / (height * height) : null;
  const band = bmi !== null ? BANDS.find((b) => bmi < b.max)?.label ?? "" : "";

  const summary =
    bmi === null
      ? ""
      : `Weight: ${weight.toFixed(1)} kg\nHeight: ${(height * 100).toFixed(1)} cm\nBMI: ${bmi.toFixed(1)}\nCategory: ${band}`;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setUnit("metric")}
          className={`tool-btn ${unit === "metric" ? "tool-btn-primary" : "tool-btn-secondary"}`}
        >
          Metric
        </button>
        <button
          onClick={() => setUnit("imperial")}
          className={`tool-btn ${unit === "imperial" ? "tool-btn-primary" : "tool-btn-secondary"}`}
        >
          Imperial
        </button>
      </div>

      {unit === "metric" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Weight (kg)</label>
            <input
              className="tool-input tool-input-sm"
              type="number"
              value={kg}
              onChange={(e) => setKg(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Height (cm)</label>
            <input
              className="tool-input tool-input-sm"
              type="number"
              value={cm}
              onChange={(e) => setCm(e.target.value)}
            />
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Weight (lb)</label>
            <input
              className="tool-input tool-input-sm"
              type="number"
              value={lb}
              onChange={(e) => setLb(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Height (ft)</label>
            <input
              className="tool-input tool-input-sm"
              type="number"
              value={ft}
              onChange={(e) => setFt(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Height (in)</label>
            <input
              className="tool-input tool-input-sm"
              type="number"
              value={inches}
              onChange={(e) => setInches(e.target.value)}
            />
          </div>
        </div>
      )}

      {bmi === null ? (
        <p className="text-sm text-muted-foreground">Enter a weight and a height greater than zero.</p>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-border p-4">
            <span className="text-sm font-medium text-foreground">Body Mass Index</span>
            <span className="text-3xl font-bold tabular-nums">{bmi.toFixed(1)}</span>
          </div>
          <p className="text-sm text-foreground">
            Category: <span className="font-medium">{band}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Under 18.5 underweight &middot; 18.5 to 24.9 normal &middot; 25 to 29.9 overweight &middot; 30 and above
            obese
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Result</span>
            <CopyButton text={summary} />
          </div>
          <pre className="tool-result">{summary}</pre>
        </div>
      )}
    </div>
  );
}
