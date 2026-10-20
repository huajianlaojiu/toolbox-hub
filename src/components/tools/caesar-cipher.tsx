"use client";
import { useState } from "react";
import CopyButton from "@/components/copy-button";

function shiftText(text: string, shift: number, decode: boolean): string {
  const s = decode ? (26 - (shift % 26)) % 26 : ((shift % 26) + 26) % 26;
  return text
    .split("")
    .map((c) => {
      if (/[a-z]/.test(c)) return String.fromCharCode(((c.charCodeAt(0) - 97 + s) % 26) + 97);
      if (/[A-Z]/.test(c)) return String.fromCharCode(((c.charCodeAt(0) - 65 + s) % 26) + 65);
      return c;
    })
    .join("");
}

export default function CaesarCipher() {
  const [input, setInput] = useState("");
  const [shift, setShift] = useState(3);
  const [decode, setDecode] = useState(false);

  const lines = input ? input.split("\n") : [];
  const effective = decode ? (26 - (shift % 26)) % 26 : ((shift % 26) + 26) % 26;
  const output = input ? lines.map((l) => shiftText(l, shift, decode)).join("\n") : "";

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Text</label>
        <textarea
          className="tool-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="The quick brown fox"
          spellCheck={false}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setDecode(false)}
            className={`tool-btn ${decode ? "tool-btn-secondary" : "tool-btn-primary"}`}
          >
            Encode
          </button>
          <button
            onClick={() => setDecode(true)}
            className={`tool-btn ${decode ? "tool-btn-primary" : "tool-btn-secondary"}`}
          >
            Decode
          </button>
        </div>
        <label className="flex items-center gap-3 text-sm text-foreground">
          Shift
          <input
            type="range"
            min={0}
            max={25}
            value={shift}
            onChange={(e) => setShift(Number(e.target.value))}
            className="w-48"
          />
          <span className="w-10 tabular-nums">{shift}</span>
        </label>
      </div>

      <div className="flex flex-wrap gap-1">
        {[1, 3, 13, 25].map((n) => (
          <button key={n} onClick={() => setShift(n)} className="tool-btn tool-btn-secondary text-xs">
            ROT{n}
          </button>
        ))}
      </div>

      {output && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              Result (shift {effective} {decode ? "backwards" : "forwards"})
            </span>
            <CopyButton text={output} />
          </div>
          <pre className="tool-result max-h-96 overflow-auto">{output}</pre>
          <p className="text-xs text-muted-foreground">
            To reverse this shift by hand, apply {effective === 0 ? 0 : 26 - effective} in the opposite direction.
          </p>
        </div>
      )}
    </div>
  );
}
