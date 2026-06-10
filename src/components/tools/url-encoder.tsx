"use client";
import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import CopyButton from "@/components/copy-button";

export default function UrlEncoder() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");

  const process = () => {
    try { setOutput(mode === "encode" ? encodeURIComponent(input) : decodeURIComponent(input)); }
    catch { setOutput("Invalid URL-encoded string."); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button onClick={() => setMode("encode")} className={`tool-btn ${mode === "encode" ? "tool-btn-primary" : "tool-btn-secondary"}`}>Encode</button>
        <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
        <button onClick={() => setMode("decode")} className={`tool-btn ${mode === "decode" ? "tool-btn-primary" : "tool-btn-secondary"}`}>Decode</button>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">{mode === "encode" ? "Text to URL-encode" : "URL-encoded text to decode"}</label>
        <textarea className="tool-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder={mode === "encode" ? "Hello World! & more" : "Hello%20World%21%20%26%20more"} spellCheck={false} />
      </div>
      <div className="flex gap-2">
        <button onClick={process} className="tool-btn tool-btn-primary">Convert</button>
        <button onClick={() => { setInput(""); setOutput(""); }} className="tool-btn tool-btn-secondary">Clear</button>
      </div>
      {output && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">{mode === "encode" ? "Encoded URL" : "Decoded Text"}</label>
            <CopyButton text={output} />
          </div>
          <pre className="tool-result max-h-96 overflow-auto">{output}</pre>
        </div>
      )}
    </div>
  );
}