"use client";
import { useState, useMemo } from "react";
import { Check, Copy, Download, Search, X } from "lucide-react";
import rawData from "@/lib/data/gitignore-templates.json";

const DATA = rawData as {
  templates: Record<string, string>;
  catalog: { category: string; keys: string[] }[];
};

/** 纯文本下载（内联实现，避免为此拉入 ffmpeg 依赖） */
function downloadText(text: string, filename: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function GitignoreGenerator() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [q, setQ] = useState("");
  const [copied, setCopied] = useState(false);

  const toggle = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const groups = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return DATA.catalog;
    return DATA.catalog
      .map((g) => ({
        category: g.category,
        keys: g.keys.filter((k) => k.toLowerCase().includes(term)),
      }))
      .filter((g) => g.keys.length > 0);
  }, [q]);

  // 按 catalog 顺序输出，保证生成结果稳定可复现
  const generated = useMemo(() => {
    if (selected.size === 0) return "";
    const parts: string[] = [];
    for (const g of DATA.catalog) {
      for (const k of g.keys) {
        if (!selected.has(k)) continue;
        const name = k.startsWith("Global/") ? k.slice(7) : k;
        parts.push(`# ---- ${name} ----\n${DATA.templates[k].trim()}\n`);
      }
    }
    return parts.join("\n");
  }, [selected]);

  const lineCount = generated ? generated.split("\n").filter((l) => l.trim()).length : 0;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(generated);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* 剪贴板不可用时静默降级，用户仍可选中手动复制 */
    }
  };

  return (
    <div className="space-y-5">
      {/* 已选摘要 */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {selected.size} template{selected.size === 1 ? "" : "s"} selected
        </span>
        {selected.size > 0 && (
          <button onClick={() => setSelected(new Set())} className="tool-btn tool-btn-secondary py-1">
            <X className="h-3.5 w-3.5" />Clear all
          </button>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* 左：模板选择 */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search templates (Node, Python, macOS...)"
              className="tool-input w-full pl-9"
            />
          </div>

          <div className="max-h-[26rem] space-y-4 overflow-y-auto pr-1">
            {groups.map((g) => (
              <div key={g.category} className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {g.category}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {g.keys.map((k) => {
                    const name = k.startsWith("Global/") ? k.slice(7) : k;
                    const on = selected.has(k);
                    return (
                      <button
                        key={k}
                        onClick={() => toggle(k)}
                        className={`tool-btn py-1 ${on ? "tool-btn-primary" : "tool-btn-secondary"}`}
                      >
                        {on && <Check className="h-3.5 w-3.5" />}
                        {name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            {groups.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">No template matches “{q}”</p>
            )}
          </div>
        </div>

        {/* 右：生成结果 */}
        <div className="space-y-3">
          <textarea
            readOnly
            value={generated || "# Pick templates on the left — your .gitignore appears here."}
            rows={18}
            spellCheck={false}
            className="tool-input w-full resize-y font-mono text-xs leading-relaxed"
          />
          <div className="flex flex-wrap items-center gap-2">
            <button disabled={!generated} onClick={copy} className="tool-btn tool-btn-primary">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              disabled={!generated}
              onClick={() => downloadText(generated, ".gitignore")}
              className="tool-btn tool-btn-secondary"
            >
              <Download className="h-4 w-4" />Download .gitignore
            </button>
            {generated && (
              <span className="text-xs text-muted-foreground">{lineCount} lines</span>
            )}
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Templates come from github/gitignore (CC0-1.0), with a few hand-written rules for stacks the
        upstream repo does not ship (PHP, Django, Vue, Nuxt, C#, Jupyter). Everything is generated in
        your browser — no upload, no request leaves your device.
      </p>
    </div>
  );
}
