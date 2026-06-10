"use client";
import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import CopyButton from "@/components/copy-button";

const entityMap: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const decodeMap: Record<string, string> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&apos;": "'" };

function encodeHtml(text: string): string { return text.replace(/[&<>"']/g, (ch) => entityMap[ch] || ch); }
function decodeHtml(text: string): string { return text.replace(/&(?:amp|lt|gt|quot|#39|apos);/g, (e) => decodeMap[e] || e); }

export default function HtmlEntityEncoder() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");

  const process = () => { setOutput(mode === "encode" ? encodeHtml(input) : decodeHtml(input)); };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button onClick={() => setMode("encode")} className={`tool-btn ${mode === "encode" ? "tool-btn-primary" : "tool-btn-secondary"}`}>Encode</button>
        <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
        <button onClick={() => setMode("decode")} className={`tool-btn ${mode === "decode" ? "tool-btn-primary" : "tool-btn-secondary"}`}>Decode</button>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">{mode === "encode" ? "Input Text" : "HTML Entities"}</label>
        <textarea className="tool-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder={mode === "encode" ? '<div class="example">Hello</div>' : "&lt;div class=&quot;example&quot;&gt;Hello&lt;/div&gt;"} spellCheck={false} />
      </div>
      <div className="flex gap-2">
        <button onClick={process} className="tool-btn tool-btn-primary">Convert</button>
        <button onClick={() => { setInput(""); setOutput(""); }} className="tool-btn tool-btn-secondary">Clear</button>
      </div>
      {output && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">{mode === "encode" ? "Encoded" : "Decoded"}</label>
            <CopyButton text={output} />
          </div>
          <pre className="tool-result max-h-96 overflow-auto">{output}</pre>
        </div>
      )}
    </div>
  );
}