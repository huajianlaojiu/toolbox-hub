"use client";
import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import CopyButton from "@/components/copy-button";

export default function TimestampConverter() {
  const [ts, setTs] = useState(Math.floor(Date.now() / 1000).toString());
  const [dateStr, setDateStr] = useState("");
  const [result, setResult] = useState("");
  const [mode, setMode] = useState<"ts-to-date" | "date-to-ts">("ts-to-date");
  const [error, setError] = useState("");

  const convert = () => {
    setError("");
    try {
      if (mode === "ts-to-date") {
        const raw = Number(ts);
        if (!Number.isFinite(raw)) { setError("Invalid timestamp."); return; }
        // 秒戳现在是 10 位（~1.8e9），毫秒戳是 13 位（~1.8e12）。
        // 旧阈值 9999999999999（13 个 9）会漏判：2026 年的毫秒戳 1.76e12
        // 小于它，于是被当成秒、乘 1000 后得到公元 5 万年，且不报错。
        // 1e11 是干净的分界：覆盖 1973 年之后的毫秒戳与公元 5138 年之前的秒戳。
        const unit: "s" | "ms" = Math.abs(raw) >= 1e11 ? "ms" : "s";
        const num = unit === "ms" ? Math.floor(raw / 1000) : raw;
        const d = new Date(num * 1000);
        if (isNaN(d.getTime())) { setError("Invalid timestamp."); return; }
        setResult(
          `Input interpreted as ${unit === "ms" ? "milliseconds" : "seconds"}\n` +
          d.toISOString().replace("T", " ").slice(0, 19) + " UTC\n" + d.toString() +
          "\nUnix (s): " + Math.floor(d.getTime() / 1000) + "\nUnix (ms): " + d.getTime()
        );
      } else {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) { setError("Invalid date."); return; }
        setResult("Unix (seconds): " + Math.floor(d.getTime() / 1000) + "\nUnix (milliseconds): " + d.getTime() + "\nISO 8601: " + d.toISOString());
      }
    } catch { setError("Conversion error."); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button onClick={() => { setMode("ts-to-date"); setResult(""); setError(""); }} className={`tool-btn ${mode === "ts-to-date" ? "tool-btn-primary" : "tool-btn-secondary"}`}>Timestamp to Date</button>
        <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
        <button onClick={() => { setMode("date-to-ts"); setResult(""); setError(""); }} className={`tool-btn ${mode === "date-to-ts" ? "tool-btn-primary" : "tool-btn-secondary"}`}>Date to Timestamp</button>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">{mode === "ts-to-date" ? "Unix Timestamp" : "Date & Time"}</label>
        {mode === "ts-to-date" ? (
          <input className="tool-input tool-input-sm font-mono" value={ts} onChange={(e) => setTs(e.target.value)} placeholder="1700000000" />
        ) : (
          <input type="datetime-local" className="tool-input tool-input-sm font-sans" value={dateStr} onChange={(e) => setDateStr(e.target.value)} />
        )}
      </div>
      <button onClick={convert} className="tool-btn tool-btn-primary">Convert</button>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {result && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">Result</label>
            <CopyButton text={result} />
          </div>
          <pre className="tool-result">{result}</pre>
        </div>
      )}
    </div>
  );
}