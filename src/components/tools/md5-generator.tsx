"use client";
import { useState } from "react";
import { Hash } from "lucide-react";
import CopyButton from "@/components/copy-button";

async function hashText(text: string, algo: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest(algo, data);
  return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function Md5Generator() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<Record<string, string>>({});
  const [algo, setAlgo] = useState("MD5");

  const algoMap: Record<string, { label: string; api: string }> = {
    MD5: { label: "MD5 (128-bit)", api: "MD5" },
    "SHA-1": { label: "SHA-1 (160-bit)", api: "SHA-1" },
    "SHA-256": { label: "SHA-256", api: "SHA-256" },
    "SHA-512": { label: "SHA-512", api: "SHA-512" },
  };

  const generate = async () => {
    if (!input.trim()) return;
    const newResults: Record<string, string> = {};
    for (const [name, { api }] of Object.entries(algoMap)) {
      try { newResults[name] = await hashText(input, api); } catch { newResults[name] = "N/A"; }
    }
    setResults(newResults);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Input Text</label>
        <textarea className="tool-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Enter text to hash..." spellCheck={false} />
      </div>
      <div className="flex gap-2">
        <button onClick={generate} className="tool-btn tool-btn-primary"><Hash className="h-4 w-4" />Generate Hashes</button>
        <button onClick={() => { setInput(""); setResults({}); }} className="tool-btn tool-btn-secondary">Clear</button>
      </div>
      {Object.keys(results).length > 0 && (
        <div className="space-y-3">
          {Object.entries(algoMap).map(([name, { label }]) => (
            <div key={name} className="rounded-lg border bg-muted/30 p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-foreground">{label}</span>
                <CopyButton text={results[name] || ""} />
              </div>
              <p className="font-mono text-xs break-all text-muted-foreground">{results[name] || "—"}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}