"use client";
import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import CopyButton from "@/components/copy-button";

export default function JsonFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const format = () => {
    setError("");
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
    } catch { setError("Invalid JSON. Check your syntax and try again."); setOutput(""); }
  };

  const minify = () => {
    setError("");
    try { const parsed = JSON.parse(input); setOutput(JSON.stringify(parsed)); }
    catch { setError("Invalid JSON. Check your syntax and try again."); setOutput(""); }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Input JSON</label>
        <textarea className="tool-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder='{"key": "value"}' spellCheck={false} />
      </div>
      <div className="flex flex-wrap gap-2">
        <button onClick={format} className="tool-btn tool-btn-primary"><Plus className="h-4 w-4" />Format</button>
        <button onClick={minify} className="tool-btn tool-btn-secondary"><Minus className="h-4 w-4" />Minify</button>
        <button onClick={() => { setInput(""); setOutput(""); setError(""); }} className="tool-btn tool-btn-secondary">Clear</button>
      </div>
      {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
      {output && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">Output</label>
            <CopyButton text={output} />
          </div>
          <pre className="tool-result max-h-96 overflow-auto">{output}</pre>
        </div>
      )}
    </div>
  );
}