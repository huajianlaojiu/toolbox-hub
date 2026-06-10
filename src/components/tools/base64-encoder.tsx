"use client";
import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import CopyButton from "@/components/copy-button";

export default function Base64Encoder() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [error, setError] = useState("");

  const process = () => {
    setError("");
    try {
      if (mode === "encode") { setOutput(btoa(unescape(encodeURIComponent(input)))); }
      else { setOutput(decodeURIComponent(escape(atob(input)))); }
    } catch { setError(mode === "decode" ? "Invalid Base64 string." : "Encoding failed."); setOutput(""); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button onClick={() => setMode("encode")} className={`tool-btn ${mode === "encode" ? "tool-btn-primary" : "tool-btn-secondary"}`}>Encode</button>
        <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
        <button onClick={() => setMode("decode")} className={`tool-btn ${mode === "decode" ? "tool-btn-primary" : "tool-btn-secondary"}`}>Decode</button>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">{mode === "encode" ? "Text" : "Base64"}</label>
        <textarea className="tool-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder={mode === "encode" ? "Enter text to encode..." : "Paste Base64 string..."} spellCheck={false} />
      </div>
      <div className="flex gap-2">
        <button onClick={process} className="tool-btn tool-btn-primary">Convert</button>
        <button onClick={() => { setInput(""); setOutput(""); setError(""); }} className="tool-btn tool-btn-secondary">Clear</button>
      </div>
      {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
      {output && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">{mode === "encode" ? "Base64 Output" : "Decoded Text"}</label>
            <CopyButton text={output} />
          </div>
          <pre className="tool-result max-h-96 overflow-auto">{output}</pre>
        </div>
      )}
    </div>
  );
}