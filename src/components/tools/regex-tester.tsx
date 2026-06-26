// @ts-nocheck
"use client";
import { useState } from "react";
import { Search } from "lucide-react";
export default function RegexTester() {
  const [pattern, setPattern] = useState("");
  const [text, setText] = useState("");
  const [flags, setFlags] = useState("g");
  const [matches, setMatches] = useState<string[]>([]);
  const [error, setError] = useState("");
  const test = () => {
    setError(""); setMatches([]);
    try {
      const re = new RegExp(pattern, flags);
      const m = [...text.matchAll(re)];
      setMatches(m.map(x => x[0]));
      if (m.length === 0) setError("No matches found");
    } catch(e: any) { setError(e.message); }
  };
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1"><label className="block text-sm font-medium text-foreground mb-2">Pattern</label><input className="tool-input tool-input-sm font-mono" value={pattern} onChange={e=>setPattern(e.target.value)} placeholder="/[a-z]+/"/></div>
        <div className="w-20"><label className="block text-sm font-medium text-foreground mb-2">Flags</label><input className="tool-input tool-input-sm font-mono" value={flags} onChange={e=>setFlags(e.target.value)} placeholder="g"/></div>
      </div>
      <div><label className="block text-sm font-medium text-foreground mb-2">Test Text</label><textarea className="tool-input" value={text} onChange={e=>setText(e.target.value)} placeholder="Enter text to test..." rows={4}/></div>
      <button onClick={test} className="tool-btn tool-btn-primary"><Search className="h-4 w-4"/>Test Regex</button>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {matches.length > 0 && (
        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="text-sm font-medium mb-2">{matches.length} match{matches.length!==1?"es":""}</p>
          <div className="space-y-1 max-h-48 overflow-auto">{matches.map((m,i)=><div key={i} className="font-mono text-sm bg-card px-3 py-1 rounded border">{m}</div>)}</div>
        </div>
      )}
    </div>
  );
}