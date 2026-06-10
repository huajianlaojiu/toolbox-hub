"use client";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import CopyButton from "@/components/copy-button";

function generateUUID() { return crypto.randomUUID(); }

export default function UuidGenerator() {
  const [uuids, setUuids] = useState<string[]>([generateUUID()]);
  const [uppercase, setUppercase] = useState(false);
  const [count, setCount] = useState(1);

  const generate = () => {
    const newUuids = Array.from({ length: count }, () => generateUUID());
    setUuids(newUuids);
  };

  const addOne = () => { setUuids([...uuids, generateUUID()]); };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-foreground">Count:</span>
          <select value={count} onChange={(e) => { setCount(Number(e.target.value)); generate(); }} className="tool-input tool-input-sm font-sans w-20">
            {[1, 5, 10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" checked={uppercase} onChange={(e) => setUppercase(e.target.checked)} className="rounded" />
          Uppercase
        </label>
      </div>
      <div className="flex gap-2">
        <button onClick={generate} className="tool-btn tool-btn-primary"><Plus className="h-4 w-4" />Generate</button>
        <button onClick={() => { setUuids([]); }} className="tool-btn tool-btn-secondary"><Trash2 className="h-4 w-4" />Clear</button>
        <CopyButton text={uuids.map((u) => uppercase ? u.toUpperCase() : u).join("\n")} label="Copy All" />
      </div>
      {uuids.length > 0 && (
        <div className="space-y-2">
          {uuids.map((uuid, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg bg-muted px-4 py-2 font-mono text-sm">
              <span className="select-all">{uppercase ? uuid.toUpperCase() : uuid}</span>
              <CopyButton text={uppercase ? uuid.toUpperCase() : uuid} />
            </div>
          ))}
          {uuids.length < 50 && (
            <button onClick={addOne} className="text-sm text-primary hover:underline">+ Add one more</button>
          )}
        </div>
      )}
    </div>
  );
}