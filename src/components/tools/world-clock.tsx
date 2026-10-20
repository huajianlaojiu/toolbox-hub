"use client";
import { useEffect, useState } from "react";

interface City {
  name: string;
  zone: string;
}

const CITIES: City[] = [
  { name: "Your local time", zone: "" },
  { name: "UTC", zone: "UTC" },
  { name: "New York", zone: "America/New_York" },
  { name: "London", zone: "Europe/London" },
  { name: "Paris", zone: "Europe/Paris" },
  { name: "Berlin", zone: "Europe/Berlin" },
  { name: "Dubai", zone: "Asia/Dubai" },
  { name: "Beijing", zone: "Asia/Shanghai" },
  { name: "Tokyo", zone: "Asia/Tokyo" },
  { name: "Singapore", zone: "Asia/Singapore" },
  { name: "Sydney", zone: "Australia/Sydney" },
  { name: "Los Angeles", zone: "America/Los_Angeles" },
  { name: "Sao Paulo", zone: "America/Sao_Paulo" },
];

function timeIn(zone: string, now: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: zone || undefined,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(now);
}

function dateIn(zone: string, now: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: zone || undefined,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function offsetLabel(zone: string, now: Date): string {
  if (!zone) {
    const mins = -now.getTimezoneOffset();
    const sign = mins >= 0 ? "+" : "-";
    const abs = Math.abs(mins);
    return `UTC${sign}${String(Math.floor(abs / 60)).padStart(2, "0")}:${String(abs % 60).padStart(2, "0")}`;
  }
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: zone, timeZoneName: "shortOffset" }).formatToParts(now);
  const tz = parts.find((p) => p.type === "timeZoneName")?.value ?? "";
  return tz.replace("GMT", "UTC");
}

export default function WorldClock() {
  const [now, setNow] = useState<Date | null>(null);
  const [hidden, setHidden] = useState<string[]>([]);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const toggle = (name: string) => {
    setHidden((h) => (h.includes(name) ? h.filter((x) => x !== name) : [...h, name]));
  };

  const visible = CITIES.filter((c) => !hidden.includes(c.name));

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Times update every second and use your browser&apos;s timezone database, so daylight saving is applied
        automatically. Click a city to hide or show it.
      </p>

      <div className="flex flex-wrap gap-2">
        {CITIES.map((c) => (
          <button
            key={c.name}
            onClick={() => toggle(c.name)}
            className={`tool-btn text-xs ${hidden.includes(c.name) ? "tool-btn-secondary" : "tool-btn-primary"}`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((c) => (
          <div key={c.name} className="rounded-xl border border-border p-4">
            <p className="text-sm font-medium text-foreground">{c.name}</p>
            <p className="mt-1 text-3xl font-bold tabular-nums">
              {now ? timeIn(c.zone, now) : "--:--:--"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {now ? dateIn(c.zone, now) : ""} &middot; {now ? offsetLabel(c.zone, now) : ""}
            </p>
          </div>
        ))}
      </div>

      {visible.length === 0 && (
        <p className="text-sm text-muted-foreground">All cities are hidden. Click one above to show it again.</p>
      )}
    </div>
  );
}
