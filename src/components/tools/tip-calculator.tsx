"use client";
import { useState } from "react";
import CopyButton from "@/components/copy-button";

const PRESETS = [10, 15, 18, 20, 25];

export default function TipCalculator() {
  const [bill, setBill] = useState("50");
  const [tipPct, setTipPct] = useState("15");
  const [people, setPeople] = useState("2");
  const [roundUp, setRoundUp] = useState(false);

  const amount = parseFloat(bill);
  const pct = parseFloat(tipPct);
  const heads = Math.max(1, Math.floor(parseInt(people, 10) || 1));

  const valid = Number.isFinite(amount) && amount >= 0 && Number.isFinite(pct) && pct >= 0;
  const tipAmount = valid ? amount * (pct / 100) : 0;
  const rawTotal = valid ? amount + tipAmount : 0;
  const total = roundUp ? Math.ceil(rawTotal) : rawTotal;
  const perHead = total / heads;

  const summary = valid
    ? `Bill: $${amount.toFixed(2)}\nTip (${pct}%): $${tipAmount.toFixed(2)}\nTotal: $${total.toFixed(2)}\nSplit ${heads} way${heads > 1 ? "s" : ""}: $${perHead.toFixed(2)} each`
    : "";

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Bill amount</label>
          <input
            className="tool-input tool-input-sm"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={bill}
            onChange={(e) => setBill(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Tip (%)</label>
          <input
            className="tool-input tool-input-sm"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.5"
            value={tipPct}
            onChange={(e) => setTipPct(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Split between</label>
          <input
            className="tool-input tool-input-sm"
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            value={people}
            onChange={(e) => setPeople(e.target.value)}
          />
        </div>
      </div>

      <div>
        <span className="block text-sm font-medium text-foreground mb-2">Common tip rates</span>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => setTipPct(String(p))}
              className={`tool-btn ${tipPct === String(p) ? "tool-btn-primary" : "tool-btn-secondary"}`}
            >
              {p}%
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" checked={roundUp} onChange={(e) => setRoundUp(e.target.checked)} className="h-4 w-4" />
        Round the total up to the next whole dollar
      </label>

      {!valid ? (
        <p className="text-sm text-muted-foreground">Enter a bill amount and a tip percentage.</p>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-border p-4">
            <span className="text-sm font-medium text-foreground">Tip</span>
            <span className="text-3xl font-bold tabular-nums">${tipAmount.toFixed(2)}</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border p-4">
              <p className="text-xs text-muted-foreground">Total to pay</p>
              <p className="text-xl font-semibold tabular-nums">${total.toFixed(2)}</p>
            </div>
            <div className="rounded-xl border border-border p-4">
              <p className="text-xs text-muted-foreground">
                Each of {heads} {heads > 1 ? "people" : "person"}
              </p>
              <p className="text-xl font-semibold tabular-nums">${perHead.toFixed(2)}</p>
            </div>
          </div>
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
