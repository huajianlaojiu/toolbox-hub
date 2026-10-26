"use client";
import { useState } from "react";
import { Upload, Download, FileSpreadsheet, Braces, Table2 } from "lucide-react";

type AoA = (string | number | boolean | null)[][];

/** 二维数组 → 对象数组（首行作为表头） */
function aoaToObjects(aoa: AoA): Record<string, unknown>[] {
  if (!aoa.length) return [];
  const header = aoa[0].map((h, i) => String(h ?? "col" + i));
  return aoa.slice(1).map((row) => {
    const o: Record<string, unknown> = {};
    header.forEach((h, i) => {
      o[h] = row?.[i] ?? "";
    });
    return o;
  });
}

/** 对象数组 → 二维数组（并集表头，缺失值留空） */
function objectsToAoa(objs: Record<string, unknown>[]): AoA {
  if (!objs.length) return [];
  const keys = Array.from(new Set(objs.flatMap((o) => Object.keys(o))));
  return [keys, ...objs.map((o) => keys.map((k) => String((o?.[k] as string | number | boolean) ?? "")))];
}

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const MAX_PREVIEW_ROWS = 60;

export default function ExcelConverter() {
  const [tab, setTab] = useState<"read" | "write">("read");
  const [aoa, setAoa] = useState<AoA>([]);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [activeSheet, setActiveSheet] = useState("");
  const [fileName, setFileName] = useState("");
  const [workbookCache, setWorkbookCache] = useState<unknown>(null);
  const [inputText, setInputText] = useState("");
  const [msg, setMsg] = useState("");

  const loadFile = async (f: File) => {
    setMsg("");
    setFileName(f.name);
    try {
      // SheetJS 体积较大，动态导入避免拖累首屏
      const XLSX = await import("xlsx");
      const buf = await f.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      setWorkbookCache(wb);
      setSheetNames(wb.SheetNames);
      const first = wb.SheetNames[0];
      setActiveSheet(first);
      applySheet(XLSX, wb, first);
    } catch (e: any) {
      setMsg("Error reading file: " + (e?.message || String(e)));
      setAoa([]);
    }
  };

  const applySheet = (XLSX: typeof import("xlsx"), wb: unknown, name: string) => {
    const w = wb as import("xlsx").WorkBook;
    const rows = XLSX.utils.sheet_to_json(w.Sheets[name], {
      header: 1,
      defval: "",
      blankrows: false,
    }) as unknown as AoA;
    setAoa(rows);
    setActiveSheet(name);
  };

  const switchSheet = async (name: string) => {
    if (!workbookCache) return;
    const XLSX = await import("xlsx");
    applySheet(XLSX, workbookCache, name);
  };

  const exportAs = async (fmt: "xlsx" | "csv" | "json") => {
    if (!aoa.length) return;
    try {
      const XLSX = await import("xlsx");
      if (fmt === "json") {
        const json = JSON.stringify(aoaToObjects(aoa), null, 2);
        downloadBlob(new Blob([json], { type: "application/json" }), fileName.replace(/\.[^.]+$/, "") + ".json");
      } else if (fmt === "csv") {
        const csv = aoa.map((r) => r.map((c) => {
          const s = String(c ?? "");
          return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
        }).join(",")).join("\n");
        downloadBlob(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }), fileName.replace(/\.[^.]+$/, "") + ".csv");
      } else {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(aoa);
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        downloadBlob(new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), fileName.replace(/\.[^.]+$/, "") + ".xlsx");
      }
    } catch (e: any) {
      setMsg("Export failed: " + (e?.message || String(e)));
    }
  };

  const generateWorkbook = async () => {
    setMsg("");
    const raw = inputText.trim();
    if (!raw) return;
    try {
      const XLSX = await import("xlsx");
      let rows: AoA;
      if (raw.startsWith("[") || raw.startsWith("{")) {
        const parsed = JSON.parse(raw);
        rows = objectsToAoa(Array.isArray(parsed) ? parsed : [parsed]);
      } else {
        // 简易 CSV 解析：支持引号包裹字段
        rows = [];
        let cur: string[] = [];
        let field = "";
        let inQuotes = false;
        for (let i = 0; i < raw.length; i++) {
          const ch = raw[i];
          if (inQuotes) {
            if (ch === '"' && raw[i + 1] === '"') { field += '"'; i++; }
            else if (ch === '"') inQuotes = false;
            else field += ch;
          } else if (ch === '"') inQuotes = true;
          else if (ch === ",") { cur.push(field); field = ""; }
          else if (ch === "\n") { cur.push(field); rows.push(cur); cur = []; field = ""; }
          else if (ch !== "\r") field += ch;
        }
        if (field.length || cur.length) { cur.push(field); rows.push(cur); }
      }
      if (!rows.length) { setMsg("Nothing to convert."); return; }
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      downloadBlob(new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), "converted.xlsx");
      setMsg(`Wrote ${rows.length} row(s).`);
    } catch (e: any) {
      setMsg("Invalid input: " + (e?.message || String(e)));
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setTab("read")} className={`tool-btn ${tab === "read" ? "tool-btn-primary" : "tool-btn-secondary"}`}>
          <FileSpreadsheet className="h-4 w-4" />Spreadsheet → JSON / CSV
        </button>
        <button onClick={() => setTab("write")} className={`tool-btn ${tab === "write" ? "tool-btn-primary" : "tool-btn-secondary"}`}>
          <Braces className="h-4 w-4" />JSON / CSV → XLSX
        </button>
      </div>

      {tab === "read" ? (
        <div className="space-y-4">
          <label className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed p-8 cursor-pointer hover:border-primary hover:bg-muted/30 transition-all">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground text-center">Select an .xlsx, .xls or .csv file</p>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) loadFile(f); }}
            />
          </label>

          {aoa.length > 0 && (
            <>
              <div className="flex flex-wrap items-center gap-3">
                {sheetNames.length > 1 && (
                  <select value={activeSheet} onChange={(e) => switchSheet(e.target.value)} className="tool-input w-48">
                    {sheetNames.map((n) => (<option key={n} value={n}>{n}</option>))}
                  </select>
                )}
                <span className="text-xs text-muted-foreground">
                  {aoa.length} row(s)
                  {aoa.length > MAX_PREVIEW_ROWS ? ` · preview limited to ${MAX_PREVIEW_ROWS}` : ""}
                </span>
              </div>

              <div className="max-h-96 overflow-auto rounded-lg border">
                <table className="w-full border-collapse text-xs">
                  <tbody>
                    {aoa.slice(0, MAX_PREVIEW_ROWS).map((row, i) => (
                      <tr key={i} className={i === 0 ? "bg-muted font-semibold" : "odd:bg-muted/30"}>
                        {row.map((cell, j) => (
                          <td key={j} className="whitespace-nowrap border-b border-r px-2 py-1">{String(cell ?? "")}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap gap-2">
                <button onClick={() => exportAs("json")} className="tool-btn tool-btn-primary">
                  <Download className="h-4 w-4" />Export JSON
                </button>
                <button onClick={() => exportAs("csv")} className="tool-btn tool-btn-secondary">
                  <Download className="h-4 w-4" />Export CSV
                </button>
                <button onClick={() => exportAs("xlsx")} className="tool-btn tool-btn-secondary">
                  <Download className="h-4 w-4" />Export XLSX
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={14}
            spellCheck={false}
            placeholder='Paste JSON (e.g. [{"name":"Ada","age":36}]) or CSV text here'
            className="tool-input w-full resize-y font-mono text-xs leading-relaxed"
          />
          <button onClick={generateWorkbook} className="tool-btn tool-btn-primary">
            <Table2 className="h-4 w-4" />Create XLSX file
          </button>
        </div>
      )}

      {msg && <p className="text-sm text-muted-foreground">{msg}</p>}

      <p className="text-xs text-muted-foreground">
        Powered by SheetJS (Apache-2.0), loaded from the official SheetJS distribution. Files are parsed
        and written inside your browser — no spreadsheet ever leaves your device.
      </p>
    </div>
  );
}
