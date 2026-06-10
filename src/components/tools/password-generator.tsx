"use client";
import { useState, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import CopyButton from "@/components/copy-button";

function generatePassword(length: number, opts: Record<string, boolean>): string {
  const chars: Record<string, string> = {
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    numbers: "0123456789",
    symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
  };
  let pool = "";
  Object.entries(opts).forEach(([k, v]) => { if (v) pool += chars[k] || ""; });
  if (!pool) pool = chars.lowercase + chars.numbers;
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr, (n) => pool[n % pool.length]).join("");
}

export default function PasswordGenerator() {
  const [password, setPassword] = useState(generatePassword(16, { lowercase: true, uppercase: true, numbers: true, symbols: false }));
  const [length, setLength] = useState(16);
  const [opts, setOpts] = useState({ lowercase: true, uppercase: true, numbers: true, symbols: false });

  const regenerate = useCallback(() => setPassword(generatePassword(length, opts)), [length, opts]);

  const toggle = (k: string) => {
    const newOpts = { ...opts, [k]: !opts[k as keyof typeof opts] };
    const enabled = Object.values(newOpts).some(Boolean);
    if (!enabled) return;
    setOpts(newOpts);
    setPassword(generatePassword(length, newOpts));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-foreground">Length:</span>
          <input type="range" min={8} max={64} value={length} onChange={(e) => { setLength(Number(e.target.value)); regenerate(); }} className="w-32" />
          <span className="text-sm font-mono font-medium">{length}</span>
        </div>
        {Object.entries(opts).map(([k, v]) => (
          <label key={k} className="flex items-center gap-1.5 text-sm text-foreground">
            <input type="checkbox" checked={v} onChange={() => toggle(k)} className="rounded" />
            {k.charAt(0).toUpperCase() + k.slice(1)}
          </label>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 rounded-lg bg-muted px-4 py-3 font-mono text-lg font-medium break-all select-all">{password}</div>
        <CopyButton text={password} />
        <button onClick={regenerate} className="tool-btn tool-btn-primary"><RefreshCw className="h-4 w-4" />New</button>
      </div>
      <p className="text-xs text-muted-foreground">
        Generated client-side with crypto.getRandomValues. Password never leaves your browser.
      </p>
    </div>
  );
}