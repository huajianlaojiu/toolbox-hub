"use client";
import { useState } from "react";
import { Hash } from "lucide-react";
import CopyButton from "@/components/copy-button";

function md5(input: string): string {
  function add(x: number, y: number) { return (x + y) >>> 0; }
  function rol(v: number, s: number) { return (v << s) | (v >>> (32 - s)); }
  function cmn(q: number, a: number, b: number, x: number, s: number, t: number) { return add(rol(add(add(a, q), add(x, t)), s), b); }
  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn((b & c) | (~b & d), a, b, x, s, t); }
  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn((b & d) | (c & ~d), a, b, x, s, t); }
  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn(b ^ c ^ d, a, b, x, s, t); }
  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn(c ^ (b | ~d), a, b, x, s, t); }

  const str2bin = (s: string): number[] => {
    const bin: number[] = [];
    for (let i = 0; i < s.length * 8; i += 8) bin[i >> 5] |= (s.charCodeAt(i >> 3) & 255) << (i % 32);
    return bin;
  };

  const x = str2bin(input);
  let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
  const len = input.length * 8;
  x[len >> 5] |= 128 << (len % 32);
  x[(((len + 64) >>> 9) << 4) + 14] = len;

  for (let i = 0; i < x.length; i += 16) {
    const oa = a, ob = b, oc = c, od = d;
    a = ff(a,b,c,d,x[i],7,-680876936);d=ff(d,a,b,c,x[i+1],12,-389564586);c=ff(c,d,a,b,x[i+2],17,606105819);b=ff(b,c,d,a,x[i+3],22,-1044525330);
    a = ff(a,b,c,d,x[i+4],7,-176418897);d=ff(d,a,b,c,x[i+5],12,1200080426);c=ff(c,d,a,b,x[i+6],17,-1473231341);b=ff(b,c,d,a,x[i+7],22,-45705983);
    a = ff(a,b,c,d,x[i+8],7,1770035416);d=ff(d,a,b,c,x[i+9],12,-1958414417);c=ff(c,d,a,b,x[i+10],17,-42063);b=ff(b,c,d,a,x[i+11],22,-1990404162);
    a = ff(a,b,c,d,x[i+12],7,1804603682);d=ff(d,a,b,c,x[i+13],12,-40341101);c=ff(c,d,a,b,x[i+14],17,-1502002290);b=ff(b,c,d,a,x[i+15],22,1236535329);
    a = gg(a,b,c,d,x[i+1],5,-165796510);d=gg(d,a,b,c,x[i+6],9,-1069501632);c=gg(c,d,a,b,x[i+11],14,643717713);b=gg(b,c,d,a,x[i],20,-373897302);
    a = gg(a,b,c,d,x[i+5],5,-701558691);d=gg(d,a,b,c,x[i+10],9,38016083);c=gg(c,d,a,b,x[i+15],14,-660478335);b=gg(b,c,d,a,x[i+4],20,-405537848);
    a = gg(a,b,c,d,x[i+9],5,568446438);d=gg(d,a,b,c,x[i+14],9,-1019803690);c=gg(c,d,a,b,x[i+3],14,-187363961);b=gg(b,c,d,a,x[i+8],20,1163531501);
    a = gg(a,b,c,d,x[i+13],5,-1444681467);d=gg(d,a,b,c,x[i+2],9,-51403784);c=gg(c,d,a,b,x[i+7],14,1735328473);b=gg(b,c,d,a,x[i+12],20,-1926607734);
    a = hh(a,b,c,d,x[i+5],4,-378558);d=hh(d,a,b,c,x[i+8],11,-2022574463);c=hh(c,d,a,b,x[i+11],16,1839030562);b=hh(b,c,d,a,x[i+14],23,-35309556);
    a = hh(a,b,c,d,x[i+1],4,-1530992060);d=hh(d,a,b,c,x[i+4],11,1272893353);c=hh(c,d,a,b,x[i+7],16,-155497632);b=hh(b,c,d,a,x[i+10],23,-1094730640);
    a = hh(a,b,c,d,x[i+13],4,681279174);d=hh(d,a,b,c,x[i],11,-358537222);c=hh(c,d,a,b,x[i+3],16,-722521979);b=hh(b,c,d,a,x[i+6],23,76029189);
    a = hh(a,b,c,d,x[i+9],4,-640364487);d=hh(d,a,b,c,x[i+12],11,-421815835);c=hh(c,d,a,b,x[i+15],16,530742520);b=hh(b,c,d,a,x[i+2],23,-995338651);
    a = ii(a,b,c,d,x[i],6,-198630844);d=ii(d,a,b,c,x[i+7],10,1126891415);c=ii(c,d,a,b,x[i+14],15,-1416354905);b=ii(b,c,d,a,x[i+5],21,-57434055);
    a = ii(a,b,c,d,x[i+12],6,1700485571);d=ii(d,a,b,c,x[i+3],10,-1894986606);c=ii(c,d,a,b,x[i+10],15,-1051523);b=ii(b,c,d,a,x[i+1],21,-2054922799);
    a = ii(a,b,c,d,x[i+8],6,1873313359);d=ii(d,a,b,c,x[i+15],10,-30611744);c=ii(c,d,a,b,x[i+6],15,-1560198380);b=ii(b,c,d,a,x[i+13],21,1309151649);
    a = ii(a,b,c,d,x[i+4],6,-145523070);d=ii(d,a,b,c,x[i+11],10,-1120210379);c=ii(c,d,a,b,x[i+2],15,718787259);b=ii(b,c,d,a,x[i+9],21,-343485551);
    a = add(a, oa); b = add(b, ob); c = add(c, oc); d = add(d, od);
  }
  function toHex(v: number) { let h = ""; for (let j = 0; j < 4; j++) h += ((v >> (j * 8)) & 255).toString(16).padStart(2,"0"); return h; }
  return (toHex(d) + toHex(c) + toHex(b) + toHex(a)).toLowerCase();
}

async function hashText(text: string, algo: string): Promise<string> {
  if (algo === "MD5") return md5(text);
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest(algo, encoder.encode(text));
  return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function Md5Generator() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<Record<string, string>>({});
  const algoMap: Record<string, string> = { "MD5": "MD5 (128-bit)", "SHA-1": "SHA-1 (160-bit)", "SHA-256": "SHA-256", "SHA-512": "SHA-512" };

  const generate = async () => {
    if (!input.trim()) return;
    const newResults: Record<string, string> = {};
    for (const [name] of Object.entries(algoMap)) {
      try { newResults[name] = await hashText(input, name); } catch { newResults[name] = "Error"; }
    }
    setResults(newResults);
  };

  return (
    <div className="space-y-4">
      <div><label className="block text-sm font-medium text-foreground mb-2">Input Text</label><textarea className="tool-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Enter text to hash..." spellCheck={false} /></div>
      <div className="flex gap-2">
        <button onClick={generate} className="tool-btn tool-btn-primary"><Hash className="h-4 w-4" />Generate Hashes</button>
        <button onClick={() => { setInput(""); setResults({}); }} className="tool-btn tool-btn-secondary">Clear</button>
      </div>
      {Object.keys(results).length > 0 && (
        <div className="space-y-3">
          {Object.entries(algoMap).map(([name, label]) => (
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