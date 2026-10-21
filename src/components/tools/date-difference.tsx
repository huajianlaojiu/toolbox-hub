"use client";
import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import CopyButton from "@/components/copy-button";

const today = () => new Date().toISOString().slice(0, 10);

function parseDate(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return Number.isNaN(d.getTime()) ? null : d;
}

function calendarBreakdown(start: Date, end: Date) {
  let years = end.getUTCFullYear() - start.getUTCFullYear();
  let months = end.getUTCMonth() - start.getUTCMonth();
  let days = end.getUTCDate() - start.getUTCDate();
  if (days < 0) {
    months -= 1;
    days += new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 0)).getUTCDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { years, months, days };
}

function weekdaysBetween(start: Date, end: Date) {
  let count = 0;
  const cursor = new Date(start);
  while (cursor < end) {
    const day = cursor.getUTCDay();
    if (day !== 0 && day !== 6) count += 1;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return count;
}

export default function DateDifference() {
  const [from, setFrom] = useState("2026-01-01");
  const [to, setTo] = useState(today());
  const [inclusive, setInclusive] = useState(false);

  const start = parseDate(from);
  const end = parseDate(to);

  if (!start || !end) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Start date</label>
            <input className="tool-input tool-input-sm" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">End date</label>
            <input className="tool-input tool-input-sm" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Pick a start date and an end date.</p>
      </div>
    );
  }

  const lo = start <= end ? start : end;
  const hi = start <= end ? end : start;
  const ms = hi.getTime() - lo.getTime();
  const days = Math.floor(ms / 86400000) + (inclusive ? 1 : 0);
  const parts = calendarBreakdown(lo, hi);
  const weekdays = weekdaysBetween(lo, inclusive ? new Date(hi.getTime() + 86400000) : hi);

  const summary = [
    `From: ${from}`,
    `To: ${to}`,
    `Calendar: ${parts.years} years, ${parts.months} months, ${parts.days} days`,
    `Days: ${days}`,
    `Weeks: ${(days / 7).toFixed(1)}`,
    `Weekdays: ${weekdays}`,
    `Hours: ${Math.floor(days * 24)}`,
  ].join("\n");

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Start date</label>
          <input className="tool-input tool-input-sm" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">End date</label>
          <input className="tool-input tool-input-sm" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setTo(today())} className="tool-btn tool-btn-secondary">
          End date = today
        </button>
        <button
          onClick={() => {
            setFrom(to);
            setTo(from);
          }}
          className="tool-btn tool-btn-secondary"
        >
          <ArrowLeftRight className="h-4 w-4" />
          Swap
        </button>
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" checked={inclusive} onChange={(e) => setInclusive(e.target.checked)} className="h-4 w-4" />
        Count the end date too (inclusive)
      </label>

      <div className="flex items-center justify-between rounded-xl border border-border p-4">
        <span className="text-sm font-medium text-foreground">Days between</span>
        <span className="text-3xl font-bold tabular-nums">{days.toLocaleString()}</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Calendar</p>
          <p className="text-sm font-semibold">
            {parts.years}y {parts.months}m {parts.days}d
          </p>
        </div>
        <div className="rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Weeks</p>
          <p className="text-sm font-semibold tabular-nums">{(days / 7).toFixed(1)}</p>
        </div>
        <div className="rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Weekdays</p>
          <p className="text-sm font-semibold tabular-nums">{weekdays.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Result</span>
        <CopyButton text={summary} />
      </div>
      <pre className="tool-result">{summary}</pre>
    </div>
  );
}
