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
        let num = Number(ts);
        if (num > 9999999999999) num = Math.floor(num / 1000);
        const d = new Date(num * 1000);
        if (isNaN(d.getTime())) { setError("Invalid timestamp."); return; }
        setResult(d.toISOString().replace("T", " ").slice(0, 19) + " UTC\n" + d.toString() + "\nUnix (s): " + Math.floor(d.getTime() / 1000) + "\nUnix (ms): " + d.getTime());
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