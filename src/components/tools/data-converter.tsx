"use client";
import { useState } from "react";
import { ArrowLeftRight, Copy, Download, Loader2 } from "lucide-react";
import * as yaml from "js-yaml";

type Fmt = "json" | "yaml" | "xml" | "csv";
const FMTS: Fmt[] = ["json", "yaml", "xml", "csv"];

/* ── 基础工具 ── */
function escXml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function safeName(n: string) {
  let s = n.replace(/[^A-Za-z0-9_.-]/g, "_");
  if (!/^[A-Za-z_]/.test(s)) s = "_" + s;
  return s || "field";
}

/* ── XML → JS ── */
function xmlToJs(node: Element): any {
  const kids = Array.from(node.children);
  if (kids.length === 0) return node.textContent ?? "";
  const out: Record<string, any> = {};
  for (const c of kids) {
    const v = xmlToJs(c);
    if (out[c.tagName] === undefined) out[c.tagName] = v;
    else if (Array.isArray(out[c.tagName])) out[c.tagName].push(v);
    else out[c.tagName] = [out[c.tagName], v];
  }
  return out;
}

/* ── JS → XML ── */
function buildXml(val: any, name: string): string {
  if (val === null || val === undefined) return `<${name}/>`;
  if (Array.isArray(val)) return val.map((x) => buildXml(x, name)).join("");
  if (typeof val === "object") {
    const inner = Object.entries(val).map(([k, v]) => buildXml(v, safeName(k))).join("");
    return inner ? `<${name}>${inner}</${name}>` : `<${name}/>`;
  }
  return `<${name}>${escXml(String(val))}</${name}>`;
}
function jsToXml(v: any, root = "root"): string {
  const body = Array.isArray(v)
    ? `<${root}>${v.map((x) => buildXml(x, "item")).join("")}</${root}>`
    : buildXml(v, root);
  return `<?xml version="1.0" encoding="UTF-8"?>\n${body}`;
}

/* ── CSV ── */
function parseLine(l: string, d = ","): string[] {
  const out: string[] = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < l.length; i++) {
    const ch = l[i];
    if (ch === '"') {
      if (q && l[i + 1] === '"') { cur += '"'; i++; } else q = !q;
    } else if (ch === d && !q) { out.push(cur); cur = ""; } else cur += ch;
  }
  out.push(cur);
  return out;
}
function csvToJs(text: string): any[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length === 0) return [];
  const head = parseLine(lines[0]);
  return lines.slice(1).map((l) => {
    const cells = parseLine(l);
    const o: Record<string, string> = {};
    head.forEach((h, i) => { o[h || `col${i}`] = cells[i] ?? ""; });
    return o;
  });
}
function jsToCsv(v: any): string {
  let rows: any[];
  if (Array.isArray(v)) rows = v;
  else if (v && typeof v === "object") {
    const arr = Object.values(v).find((x) => Array.isArray(x));
    rows = Array.isArray(arr) ? arr : [v];
  } else return String(v ?? "");
  if (rows.length === 0) return "";
  const flat = rows.map((r) => (r && typeof r === "object" && !Array.isArray(r) ? r : { value: r }));
  const cols = Array.from(new Set(flat.flatMap((r) => Object.keys(r))));
  const esc = (x: any) => {
    const t = String(x ?? "");
    return /[",\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
  };
  return [cols.join(","), ...flat.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
}

/* ── 转换入口 ── */
function parse(text: string, from: Fmt): any {
  if (from === "json") return JSON.parse(text);
  if (from === "yaml") return yaml.load(text);
  if (from === "csv") return csvToJs(text);
  const doc = new DOMParser().parseFromString(text, "application/xml");
  if (doc.getElementsByTagName("parsererror").length > 0) throw new Error("Invalid XML");
  const root = doc.documentElement;
  if (!root) throw new Error("Empty XML");
  return { [root.tagName]: xmlToJs(root) };
}
function serialize(v: any, to: Fmt): string {
  if (to === "json") return JSON.stringify(v, null, 2);
  if (to === "yaml") return yaml.dump(v, { noRefs: true });
  if (to === "csv") return jsToCsv(v);
  return jsToXml(v);
}

const SAMPLE: Record<Fmt, string> = {
  json: '[\n  { "name": "Ada", "role": "engineer" },\n  { "name": "Linus", "role": "author" }\n]',
  yaml: "- name: Ada\n  role: engineer\n- name: Linus\n  role: author\n",
  xml: '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n  <item><name>Ada</name><role>engineer</role></item>\n  <item><name>Linus</name><role>author</role></item>\n</root>',
  csv: "name,role\nAda,engineer\nLinus,author",
};
const EXT: Record<Fmt, string> = { json: "json", yaml: "yaml", xml: "xml", csv: "csv" };

export default function DataConverter() {
  const [from, setFrom] = useState<Fmt>("json");
  const [to, setTo] = useState<Fmt>("yaml");
  const [input, setInput] = useState(SAMPLE.json);
  const [output, setOutput] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const convert = () => {
    setErr("");
    setBusy(true);
    try {
      const v = parse(input, from);
      setOutput(serialize(v, to));
    } catch (e: any) {
      setErr(e?.message || String(e));
      setOutput("");
    } finally {
      setBusy(false);
    }
  };

  const swap = () => {
    setFrom(to);
    setTo(from);
    setInput(output || input);
    setOutput("");
  };

  const copy = () => {
    if (output) navigator.clipboard?.writeText(output);
  };
  const download = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `converted.${EXT[to]}`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="text-xs text-muted-foreground">From</label>
          <select value={from} onChange={(e) => setFrom(e.target.value as Fmt)} className="tool-input">
            {FMTS.map((f) => (<option key={f} value={f}>{f.toUpperCase()}</option>))}
          </select>
        </div>
        <button onClick={swap} className="tool-btn tool-btn-secondary" title="Swap direction">
          <ArrowLeftRight className="h-4 w-4" />
        </button>
        <div>
          <label className="text-xs text-muted-foreground">To</label>
          <select value={to} onChange={(e) => setTo(e.target.value as Fmt)} className="tool-input">
            {FMTS.map((f) => (<option key={f} value={f}>{f.toUpperCase()}</option>))}
          </select>
        </div>
        <button onClick={convert} disabled={busy} className="tool-btn tool-btn-primary">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}Convert
        </button>
        <button onClick={() => { setInput(SAMPLE[from]); setOutput(""); setErr(""); }} className="tool-btn tool-btn-secondary">
          Load sample
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Input ({from.toUpperCase()})</label>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} className="tool-input w-full h-64 font-mono text-xs" spellCheck={false} />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Output ({to.toUpperCase()})</label>
          <textarea readOnly value={output} className="tool-input w-full h-64 font-mono text-xs" spellCheck={false} placeholder="Converted result appears here" />
        </div>
      </div>

      {err && <p className="text-sm text-destructive">Error: {err}</p>}

      {output && (
        <div className="flex gap-2">
          <button onClick={copy} className="tool-btn tool-btn-secondary"><Copy className="h-4 w-4" />Copy</button>
          <button onClick={download} className="tool-btn tool-btn-secondary"><Download className="h-4 w-4" />Download .{EXT[to]}</button>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Supports JSON, YAML, XML and CSV in every direction. YAML handled by js-yaml; XML and CSV use built-in converters. Runs entirely in your browser.
      </p>
    </div>
  );
}
