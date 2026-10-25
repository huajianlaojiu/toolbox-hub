"use client";
import { useState } from "react";
import type { ReactNode } from "react";
import { Upload, Download, Loader2, Archive, PackageOpen } from "lucide-react";
import JSZip from "jszip";

type Entry = { name: string; size: number; blob: Blob };

/* ── TAR 读写（纯 JS，格式固定：512 字节头 + 数据 + 512 对齐填充） ── */
function parseTar(buf: ArrayBuffer): Entry[] {
  const out: Entry[] = [];
  const u8 = new Uint8Array(buf);
  const dec = new TextDecoder();
  let off = 0;
  while (off + 512 <= u8.length) {
    const nameRaw = dec.decode(u8.subarray(off, off + 100)).replace(/\0.*$/, "");
    if (!nameRaw) break;
    const sizeStr = dec.decode(u8.subarray(off + 124, off + 136)).replace(/\0.*$/, "").trim();
    const size = parseInt(sizeStr, 8) || 0;
    const type = String.fromCharCode(u8[off + 156]);
    const prefix = dec.decode(u8.subarray(off + 345, off + 500)).replace(/\0.*$/, "");
    const name = prefix ? `${prefix}/${nameRaw}` : nameRaw;
    const start = off + 512;
    if (type === "0" || type === "\u0000") {
      out.push({ name, size, blob: new Blob([u8.subarray(start, start + size)]) });
    }
    off = start + Math.ceil(size / 512) * 512;
  }
  return out;
}

function createTar(files: { name: string; data: Uint8Array }[]): Blob {
  const enc = new TextEncoder();
  const chunks: Uint8Array[] = [];
  for (const f of files) {
    const h = new Uint8Array(512);
    const put = (s: string, at: number) => h.set(enc.encode(s), at);
    put(f.name.slice(0, 100), 0);
    put("0000644\u0000", 100);
    put("0000000\u0000", 108);
    put("0000000\u0000", 116);
    put(f.data.length.toString(8).padStart(11, "0") + "\u0000", 124);
    put(Math.floor(Date.now() / 1000).toString(8).padStart(11, "0") + "\u0000", 136);
    put("        ", 148);
    h[156] = 0x30; // regular file
    put("ustar\u0000", 257);
    put("00", 263);
    let sum = 0;
    for (let i = 0; i < 512; i++) sum += h[i];
    put(sum.toString(8).padStart(6, "0") + "\u0000 ", 148);
    chunks.push(h);
    chunks.push(f.data);
    const pad = (512 - (f.data.length % 512)) % 512;
    if (pad) chunks.push(new Uint8Array(pad));
  }
  chunks.push(new Uint8Array(1024));
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const out = new Uint8Array(total);
  let p = 0;
  for (const c of chunks) {
    out.set(c, p);
    p += c.length;
  }
  return new Blob([out], { type: "application/x-tar" });
}

/* ── 工具 ── */
function sizeStr(n: number) {
  if (n < 1024) return n + " B";
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
  return (n / 1024 / 1024).toFixed(2) + " MB";
}
function save(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

const TABS: { id: string; label: string; icon: ReactNode }[] = [
  { id: "create", label: "Create archive", icon: <Archive className="h-4 w-4" /> },
  { id: "extract", label: "Extract archive", icon: <PackageOpen className="h-4 w-4" /> },
];

export default function ArchiveTool() {
  const [tab, setTab] = useState("create");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  /* 打包 */
  const [fmt, setFmt] = useState<"zip" | "tar">("zip");
  const [src, setSrc] = useState<File[]>([]);

  /* 解包 */
  const [entries, setEntries] = useState<Entry[]>([]);

  const doCreate = async () => {
    if (src.length === 0) return setMsg("Select files first.");
    setBusy(true);
    setMsg("");
    try {
      if (fmt === "zip") {
        const zip = new JSZip();
        for (const f of src) zip.file(f.name, await f.arrayBuffer());
        const blob = await zip.generateAsync({ type: "blob" });
        save(blob, "archive.zip");
        setMsg(`Created archive.zip with ${src.length} file(s) — ${sizeStr(blob.size)}`);
      } else {
        const files: { name: string; data: Uint8Array }[] = [];
        for (const f of src) files.push({ name: f.name, data: new Uint8Array(await f.arrayBuffer()) });
        const blob = createTar(files);
        save(blob, "archive.tar");
        setMsg(`Created archive.tar with ${src.length} file(s) — ${sizeStr(blob.size)}`);
      }
    } catch (e: any) {
      setMsg("Error: " + (e?.message || e));
    } finally {
      setBusy(false);
    }
  };

  const doExtract = async (file: File) => {
    setBusy(true);
    setMsg("");
    setEntries([]);
    try {
      const buf = await file.arrayBuffer();
      if (/\.zip$/i.test(file.name)) {
        const zip = await JSZip.loadAsync(buf);
        const list: Entry[] = [];
        for (const [name, obj] of Object.entries(zip.files)) {
          if (obj.dir) continue;
          list.push({ name, size: 0, blob: await obj.async("blob") });
        }
        setEntries(list.map((e) => ({ ...e, size: e.blob.size })));
        setMsg(`${list.length} file(s) in ${file.name}`);
      } else {
        const list = parseTar(buf);
        setEntries(list);
        setMsg(`${list.length} file(s) in ${file.name}`);
      }
    } catch (e: any) {
      setMsg("Error: " + (e?.message || e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`tool-btn ${tab === t.id ? "tool-btn-primary" : "tool-btn-secondary"}`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {tab === "create" && (
        <div className="space-y-3">
          <label className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed p-8 cursor-pointer hover:border-primary hover:bg-muted/30 transition-all">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground text-center">Select files to pack (any type, batch supported)</p>
            <input type="file" multiple className="hidden" onChange={(e) => setSrc(Array.from(e.target.files || []))} />
          </label>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Format</span>
            <select value={fmt} onChange={(e) => setFmt(e.target.value as "zip" | "tar")} className="tool-input w-32">
              <option value="zip">ZIP</option>
              <option value="tar">TAR</option>
            </select>
          </div>
          <button disabled={busy} onClick={doCreate} className="tool-btn tool-btn-primary">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Archive className="h-4 w-4" />}Create {fmt.toUpperCase()} from {src.length} file(s)
          </button>
        </div>
      )}

      {tab === "extract" && (
        <div className="space-y-3">
          <label className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed p-8 cursor-pointer hover:border-primary hover:bg-muted/30 transition-all">
            <PackageOpen className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground text-center">Select a .zip or .tar archive to unpack</p>
            <input type="file" accept=".zip,.tar" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) doExtract(f); }} />
          </label>

          {entries.length > 0 && (
            <div className="rounded-lg border divide-y max-h-80 overflow-y-auto">
              {entries.map((en, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <span className="text-sm truncate flex-1">{en.name}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{sizeStr(en.size)}</span>
                  <button onClick={() => save(en.blob, en.name.split("/").pop() || en.name)} className="tool-btn tool-btn-secondary py-1 shrink-0">
                    <Download className="h-3.5 w-3.5" />Save
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
      <p className="text-xs text-muted-foreground">ZIP handled by JSZip; TAR read/written with a built-in encoder. 7Z / RAR need native engines and are not supported. Everything stays in your browser.</p>
    </div>
  );
}
