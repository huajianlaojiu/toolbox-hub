"use client";
import { useState, useEffect, useRef } from "react";
import { Download, Loader2, Image as ImageIcon, FileCode2, AlertTriangle } from "lucide-react";

/** 示例图表：覆盖最常用的六种图型，降低上手门槛 */
const EXAMPLES: { label: string; code: string }[] = [
  {
    label: "Flowchart",
    code: "flowchart LR\n  A[Start] --> B{Is it working?}\n  B -->|Yes| C[Ship it]\n  B -->|No| D[Debug]\n  D --> B",
  },
  {
    label: "Sequence",
    code: "sequenceDiagram\n  Alice->>John: Hello John, how are you?\n  John-->>Alice: Great!\n  Alice->>John: See you later",
  },
  {
    label: "Class",
    code: "classDiagram\n  Animal <|-- Duck\n  Animal <|-- Fish\n  Animal : +int age\n  Animal : +String gender\n  Animal: +isMammal()\n  Animal: +mate()",
  },
  {
    label: "ER",
    code: "erDiagram\n  CUSTOMER ||--o{ ORDER : places\n  ORDER ||--|{ LINE-ITEM : contains\n  CUSTOMER {\n    string name\n    string email\n  }",
  },
  {
    label: "Gantt",
    code: "gantt\n  title A Simple Project\n  dateFormat YYYY-MM-DD\n  section Design\n  Draft :done, a1, 2026-01-01, 7d\n  Review :active, a2, after a1, 3d\n  section Build\n  Implement :a3, after a2, 10d",
  },
  {
    label: "Pie",
    code: "pie title Pets adopted by volunteers\n  \"Dogs\" : 386\n  \"Cats\" : 85\n  \"Rabbits\" : 15",
  },
];

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

export default function MermaidDiagram() {
  const [code, setCode] = useState(EXAMPLES[0].code);
  const [svg, setSvg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const seq = useRef(0);

  // 输入防抖后渲染：mermaid 包体较大，动态导入确保不进首屏 bundle，
  // 也避免静态导出（SSG）阶段触碰 DOM 相关 API 而报错。
  useEffect(() => {
    const id = ++seq.current;
    setBusy(true);
    const timer = setTimeout(async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "default",
          // antiscript：允许富文本标签但屏蔽脚本执行，避免注入 SVG 时执行脚本
          securityLevel: "antiscript",
        });
        const token = "mermaid-render-" + id;
        const out = await mermaid.render(token, code);
        if (seq.current === id) {
          setSvg(out.svg);
          setErr("");
        }
      } catch (e: any) {
        if (seq.current === id) {
          setErr(e?.message ? String(e.message).split("\n")[0] : "Invalid diagram syntax");
          setSvg("");
        }
      } finally {
        if (seq.current === id) setBusy(false);
      }
    }, 450);
    return () => clearTimeout(timer);
  }, [code]);

  const saveSvg = () => {
    if (!svg) return;
    downloadBlob(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }), "diagram.svg");
  };

  const savePng = () => {
    if (!svg) return;
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      // 按 2 倍导出，保证 PNG 在视网膜屏与幻灯片里足够清晰
      const scale = 2;
      const canvas = document.createElement("canvas");
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);
      }
      canvas.toBlob((b) => {
        if (b) downloadBlob(b, "diagram.png");
        URL.revokeObjectURL(url);
      }, "image/png");
    };
    img.onerror = () => URL.revokeObjectURL(url);
    img.src = url;
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((e) => (
          <button
            key={e.label}
            onClick={() => setCode(e.code)}
            className={`tool-btn ${code === e.code ? "tool-btn-primary" : "tool-btn-secondary"}`}
          >
            {e.label}
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-2">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={16}
            spellCheck={false}
            className="tool-input w-full resize-y font-mono text-xs leading-relaxed"
            placeholder="graph TD\n  A --> B"
          />
          <p className="text-xs text-muted-foreground">
            Write Mermaid syntax. Rendering updates automatically as you type.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex min-h-[16rem] items-center justify-center rounded-lg border bg-card p-4">
            {busy && !svg && (
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />Rendering…
              </span>
            )}
            {err && (
              <span className="flex max-w-full items-start gap-2 text-sm text-destructive">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span className="break-words">{err}</span>
              </span>
            )}
            {svg && (
              <div
                className="w-full overflow-x-auto [&>svg]:mx-auto [&>svg]:max-w-full"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            )}
            {!busy && !err && !svg && (
              <p className="text-sm text-muted-foreground">Your diagram will appear here.</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button disabled={!svg} onClick={saveSvg} className="tool-btn tool-btn-primary">
              <FileCode2 className="h-4 w-4" />Download SVG
            </button>
            <button disabled={!svg} onClick={savePng} className="tool-btn tool-btn-secondary">
              <ImageIcon className="h-4 w-4" />Download PNG
            </button>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Powered by Mermaid (MIT). The chart engine loads only when you open this tool and renders
        entirely in your browser — nothing is uploaded. SVG exports stay sharp at any size.
      </p>
    </div>
  );
}
