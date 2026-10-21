"use client";
import { useState } from "react";
import { Dices, RotateCcw } from "lucide-react";
import CopyButton from "@/components/copy-button";

const SIDES = [4, 6, 8, 10, 12, 20, 100];

const PIP_LAYOUT: Record<number, number[][]> = {
  1: [[4]],
  2: [[0], [8]],
  3: [[0], [4], [8]],
  4: [[0, 2], [6, 8]],
  5: [[0, 2], [4], [6, 8]],
  6: [[0, 2], [3, 5], [6, 8]],
};

function Face({ value, sides }: { value: number; sides: number }) {
  if (sides === 6) {
    return (
      <div className="grid h-14 w-14 grid-cols-3 grid-rows-3 gap-1 rounded-xl border border-border bg-card p-2">
        {Array.from({ length: 9 }).map((_, i) => (
          <span
            key={i}
            className={
              PIP_LAYOUT[value].flat().includes(i)
                ? "h-2 w-2 rounded-full bg-foreground self-center justify-self-center"
                : "h-2 w-2 self-center justify-self-center"
            }
          />
        ))}
      </div>
    );
  }
  return (
    <div className="flex h-14 min-w-14 items-center justify-center rounded-xl border border-border bg-card px-3">
      <span className="text-lg font-bold tabular-nums text-foreground">{value}</span>
    </div>
  );
}

export default function DiceRoller() {
  const [sides, setSides] = useState(6);
  const [count, setCount] = useState(2);
  const [rolls, setRolls] = useState<number[]>([]);
  const [history, setHistory] = useState<{ sides: number; values: number[]; total: number }[]>([]);

  const roll = () => {
    const values = Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1);
    const total = values.reduce((a, b) => a + b, 0);
    setRolls(values);
    setHistory((h) => [{ sides, values, total }, ...h].slice(0, 10));
  };

  const total = rolls.reduce((a, b) => a + b, 0);
  const summary = rolls.length
    ? `${count}d${sides}: ${rolls.join(", ")}\nTotal: ${total}`
    : "";

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Dice type</label>
          <div className="flex flex-wrap gap-2">
            {SIDES.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSides(s);
                  setRolls([]);
                }}
                className={`tool-btn ${sides === s ? "tool-btn-primary" : "tool-btn-secondary"}`}
              >
                d{s}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Number of dice</label>
          <input
            className="tool-input tool-input-sm"
            type="number"
            min="1"
            max="20"
            value={count}
            onChange={(e) => setCount(Math.min(20, Math.max(1, parseInt(e.target.value, 10) || 1)))}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={roll} className="tool-btn tool-btn-primary">
          <Dices className="h-4 w-4" />
          Roll {count}d{sides}
        </button>
        <button
          onClick={() => {
            setRolls([]);
            setHistory([]);
          }}
          className="tool-btn tool-btn-secondary"
        >
          <RotateCcw className="h-4 w-4" />
          Clear
        </button>
      </div>

      {rolls.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {rolls.map((v, i) => (
              <Face key={i} value={v} sides={sides} />
            ))}
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border p-4">
            <span className="text-sm font-medium text-foreground">Total</span>
            <span className="text-3xl font-bold tabular-nums">{total}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Result</span>
            <CopyButton text={summary} />
          </div>
          <pre className="tool-result">{summary}</pre>
        </div>
      )}

      {history.length > 1 && (
        <div>
          <p className="text-sm font-medium text-foreground mb-2">Recent rolls</p>
          <div className="space-y-1">
            {history.slice(1).map((h, i) => (
              <p key={i} className="text-xs text-muted-foreground">
                {h.values.length}d{h.sides}: {h.values.join(", ")} = {h.total}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
