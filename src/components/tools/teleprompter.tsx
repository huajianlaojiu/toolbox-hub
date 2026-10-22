"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Maximize2, Upload, FlipHorizontal2, Type, Gauge } from "lucide-react";
import { useI18n } from "@/lib/i18n";

/**
 * 提词器（自研，零依赖）
 * 功能：自动滚动 / 速度字号调节 / 镜像翻转（适配提词器硬件反射）/ 全屏 /
 *       导入 .txt / .srt（自动去时间码只留文本）/ localStorage 记忆
 */
export default function Teleprompter() {
  const { lang } = useI18n();
  const L = (en: string, zh: string) => (lang === "zh" ? zh : en);

  const [text, setText] = useState("");
  const [speed, setSpeed] = useState(40); // px/s
  const [fontSize, setFontSize] = useState(32);
  const [lineHeight, setLineHeight] = useState(1.8);
  const [mirror, setMirror] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [editing, setEditing] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const lastTsRef = useRef<number>(0);

  // 本地记忆
  useEffect(() => {
    const saved = localStorage.getItem("tb-teleprompter-text");
    if (saved) { setText(saved); setEditing(false); }
  }, []);
  useEffect(() => {
    const id = setTimeout(() => { try { localStorage.setItem("tb-teleprompter-text", text); } catch { /* ignore */ } }, 500);
    return () => clearTimeout(id);
  }, [text]);

  // 滚动驱动
  const tick = useCallback((ts: number) => {
    const el = scrollRef.current;
    if (!el) return;
    if (!lastTsRef.current) lastTsRef.current = ts;
    const dt = (ts - lastTsRef.current) / 1000;
    lastTsRef.current = ts;
    el.scrollTop += speed * dt;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 2) {
      setPlaying(false);
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [speed]);

  useEffect(() => {
    if (playing) {
      lastTsRef.current = 0;
      rafRef.current = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(rafRef.current);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, tick]);

  const importFile = (f: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      let content = String(reader.result || "");
      // SRT/VTT：去掉时间码行和序号，只留文本
      if (/\.(srt|vtt)$/i.test(f.name)) {
        content = content
          .split(/\r?\n/)
          .filter((line) => !/^\d+$/.test(line.trim()) && !/--?>/.test(line) && !/^WEBVTT/i.test(line))
          .join("\n");
      }
      setText(content.trim());
      setEditing(false);
    };
    reader.readAsText(f);
  };

  const fullscreen = () => {
    const el = scrollRef.current?.parentElement;
    if (el?.requestFullscreen) el.requestFullscreen().catch(() => {});
  };

  // 键盘控制（提词器常用）
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;
      if (e.code === "Space") { e.preventDefault(); setPlaying((p) => !p); }
      if (e.code === "ArrowUp") { setSpeed((s) => Math.min(300, s + 10)); }
      if (e.code === "ArrowDown") { setSpeed((s) => Math.max(5, s - 10)); }
      if (e.code === "KeyR") { if (scrollRef.current) scrollRef.current.scrollTop = 0; setPlaying(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (editing) {
    return (
      <div className="space-y-4">
        <label className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed p-8 cursor-pointer hover:border-primary hover:bg-muted/30 transition-all">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{L("Import a .txt or .srt script (optional)", "导入 .txt 或 .srt 讲稿（可选）")}</p>
          <input type="file" accept=".txt,.srt,.vtt,text/plain" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) importFile(f); }} />
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={L("Paste your script here...", "在此粘贴讲稿...")}
          className="tool-input h-64 resize-y"
          autoFocus
        />
        <div className="flex gap-2">
          <button onClick={() => { if (scrollRef.current) scrollRef.current.scrollTop = 0; setEditing(false); }} disabled={!text.trim()} className="tool-btn tool-btn-primary">
            <Play className="h-4 w-4" />{L("Start presenting", "开始演讲")}
          </button>
          {text.trim() && (
            <button onClick={() => { setText(""); localStorage.removeItem("tb-teleprompter-text"); }} className="tool-btn tool-btn-secondary">
              <RotateCcw className="h-4 w-4" />{L("Clear", "清空")}
            </button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {L("Shortcuts: Space = play/pause · ↑/↓ = speed · R = restart", "快捷键：空格 = 播放/暂停 · ↑/↓ = 调速 · R = 重新开始")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative rounded-xl border bg-card overflow-hidden" style={{ height: "min(62vh, 640px)" }}>
        {/* 阅读指示线 */}
        <div className="pointer-events-none absolute left-0 right-0 top-1/3 z-10 border-t-2 border-primary/60" />
        <div
          ref={scrollRef}
          className="h-full overflow-y-auto px-6 py-8"
          style={{
            transform: mirror ? "scaleX(-1)" : undefined,
            fontSize: `${fontSize}px`,
            lineHeight,
            fontWeight: 600,
          }}
        >
          <p className="whitespace-pre-wrap text-foreground">{text}</p>
          <div style={{ height: "40vh" }} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button onClick={() => setPlaying((p) => !p)} className="tool-btn tool-btn-primary">
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {playing ? L("Pause", "暂停") : L("Play", "播放")}
        </button>
        <button onClick={() => { if (scrollRef.current) scrollRef.current.scrollTop = 0; setPlaying(false); }} className="tool-btn tool-btn-secondary">
          <RotateCcw className="h-4 w-4" />{L("Restart", "重新开始")}
        </button>
        <button onClick={() => setMirror((m) => !m)} className={`tool-btn ${mirror ? "tool-btn-primary" : "tool-btn-secondary"}`}>
          <FlipHorizontal2 className="h-4 w-4" />{L("Mirror", "镜像")}
        </button>
        <button onClick={fullscreen} className="tool-btn tool-btn-secondary">
          <Maximize2 className="h-4 w-4" />{L("Fullscreen", "全屏")}
        </button>
        <button onClick={() => setEditing(true)} className="tool-btn tool-btn-secondary">
          <Type className="h-4 w-4" />{L("Edit script", "编辑讲稿")}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="flex items-center gap-2 text-sm">
          <Gauge className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground whitespace-nowrap">{L("Speed", "速度")}</span>
          <input type="range" min={5} max={300} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="w-full" />
          <span className="font-mono text-xs w-12 text-right">{speed}</span>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Type className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground whitespace-nowrap">{L("Font size", "字号")}</span>
          <input type="range" min={16} max={72} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full" />
          <span className="font-mono text-xs w-12 text-right">{fontSize}</span>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground whitespace-nowrap">{L("Line height", "行距")}</span>
          <input type="range" min={1.2} max={3} step={0.1} value={lineHeight} onChange={(e) => setLineHeight(Number(e.target.value))} className="w-full" />
          <span className="font-mono text-xs w-12 text-right">{lineHeight.toFixed(1)}</span>
        </label>
      </div>
    </div>
  );
}
