"use client";
import { useState } from "react";
import CopyButton from "@/components/copy-button";

interface SimpleToolProps {
  label?: string;
  placeholder?: string;
  process: (input: string) => string;
  multiline?: boolean;
  showInput?: boolean;
  btnLabel?: string;
}

export default function SimpleTool({ label = "Input", placeholder = "", process, multiline = true, showInput = true, btnLabel = "Process" }: SimpleToolProps) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const handleProcess = () => {
    if (!input.trim() && showInput) return;
    setOutput(process(showInput ? input : input || "generate"));
  };

  return (
    <div className="space-y-4">
      {showInput && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">{label}</label>
          {multiline ? (
            <textarea className="tool-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder={placeholder} spellCheck={false} />
          ) : (
            <input className="tool-input tool-input-sm font-sans" value={input} onChange={(e) => setInput(e.target.value)} placeholder={placeholder} />
          )}
        </div>
      )}
      <div className="flex gap-2">
        <button onClick={handleProcess} className="tool-btn tool-btn-primary">{btnLabel}</button>
        <button onClick={() => { setInput(""); setOutput(""); }} className="tool-btn tool-btn-secondary">Clear</button>
      </div>
      {output && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">Result</label>
            <CopyButton text={output} />
          </div>
          <pre className="tool-result max-h-96 overflow-auto">{output}</pre>
        </div>
      )}
    </div>
  );
}