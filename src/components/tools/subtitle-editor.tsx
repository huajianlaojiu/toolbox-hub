"use client";
import { useRef, useState } from "react";
import { Upload, Download, Plus, Trash2, Play, Pause, Clock, FileText } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface Cue { id: number; start: number; end: number; text: string }

/* ── 时间码工具 ── */
function parseTime(s: string): number {
  s = s.trim();
  const m = s.match(/^(\d+):(\d{1,2}):(\d{1,2})[.,](\d{1,3})$/);
  if (m) return (+m[1]) * 3600000 + (+m[2]) * 60000 + (+m[3]) * 1000 + (+m[4].padEnd(3, "0"));
  const m2 = s.match(/^(\d{1,2}):(\d{1,2})[.,](\d{1,3})$/);
  if (m2) return (+m2[1]) * 60000 + (+m2[2]) * 1000 + (+m2[3].padEnd(3, "0"));
  return 0;
}
function fmtSrt(ms: number): string {
  const t = Math.max(0, Math.round(ms));
  const h = String(Math.floor(t / 3600000)).padStart(2, "0");
  const m = String(Math.floor(t / 60000) % 60).padStart(2, "0");
  const s = String(Math.floor(t / 1000) % 60).padStart(2, "0");
  const mm = String(t % 1000).padStart(3, "0");
  return `${h}:${m}:${s},${mm}`;
}
function fmtVtt(ms: number): string { return fmtSrt(ms).replace(",", "."); }
function fmtAss(ms: number): string {
  const t = Math.max(0, Math.round(ms / 10));
  const h = Math.floor(t / 360000);
  const m = String(Math.floor(t / 6000) % 60).padStart(2, "0");
  const s = String(Math.floor(t / 100) % 60).padStart(2, "0");
  const cs = String(t % 100).padStart(2, "0");
  return `${h}:${m}:${s}.${cs}`;
}

/* ── 解析 ── */
function parseSub(content: string): Cue[] {
  const cues: Cue[] = [];
  let id = 1;
  if (/\[Events\]/i.test(content)) {
    // ASS/SSA
    for (const line of content.split(/\r?\n/)) {
      const m = line.match(/^Dialogue:\s*\d+,([^,]*),([^,]*),([^,]*),([^,]*),([^,]*),([^,]*),([^,]*),([^,]*),(.*)$/i);
      if (m) {
        cues.push({ id: id++, start: parseTime(m[2]), end: parseTime(m[3]), text: m[10].replace(/\\N/g, "\n") });
      }
    }
    return cues;
  }
  const blocks = content.replace(/^WEBVTT.*\r?\n/i, "").trim().split(/\r?\n\s*\r?\n/);
  for (const block of blocks) {
    const lines = block.split(/\r?\n/).filter((l) => l.trim() !== "");
    if (lines.length === 0) continue;
    let timeLineIdx = lines.findIndex((l) => l.includes("-->"));
    if (timeLineIdx === -1) continue;
    const timeParts = lines[timeLineIdx].split("-->");
    const text = lines.slice(timeLineIdx + 1).join("\n");
    cues.push({ id: id++, start: parseTime(timeParts[0]), end: parseTime(timeParts[1] || timeParts[0]), text });
  }
  return cues;
}

/* ── 序列化 ── */
function toSrt(cues: Cue[]): string {
  return cues.map((c, i) => `${i + 1}\n${fmtSrt(c.start)} --> ${fmtSrt(c.end)}\n${c.text}\n`).join("\n");
}
function toVtt(cues: Cue[]): string {
  return "WEBVTT\n\n" + cues.map((c, i) => `${i + 1}\n${fmtVtt(c.start)} --> ${fmtVtt(c.end)}\n${c.text}\n`).join("\n");
}
function toAss(cues: Cue[]): string {
  const head = `[Script Info]\nTitle: Toolbox Hub Subtitles\nScriptType: v4.00+\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: Default,Arial,48,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,1,2,40,40,30,1\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n`;
  const body = cues.map((c) => `Dialogue: 0,${fmtAss(c.start)},${fmtAss(c.end)},Default,,0,0,0,,${c.text.replace(/\n/g, "\\N")}`).join("\n");
  return head + body + "\n";
}

export default function SubtitleEditor() {
  const { L } = useI18n();

  const [cues, setCues] = useState<Cue[]>([]);
  const [selected, setSelected] = useState(0);
  const [videoUrl, setVideoUrl] = useState("");
  const [current, setCurrent] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [offset, setOffset] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const loadFile = (f: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = parseSub(String(reader.result || ""));
      if (parsed.length === 0) {
        alert(L("Could not parse any subtitle cues from this file."));
        return;
      }
      setCues(parsed);
      setSelected(0);
    };
    reader.readAsText(f);
  };

  const loadVideo = (f: File) => setVideoUrl(URL.createObjectURL(f));

  const download = (fmt: "srt" | "vtt" | "ass") => {
    const content = fmt === "srt" ? toSrt(cues) : fmt === "vtt" ? toVtt(cues) : toAss(cues);
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `subtitles.${fmt}`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const applyOffset = () => {
    if (offset === 0) return;
    setCues((cs) => cs.map((c) => ({ ...c, start: Math.max(0, c.start + offset * 1000), end: Math.max(0, c.end + offset * 1000) })));
    setOffset(0);
  };

  const updateCue = (i: number, patch: Partial<Cue>) => {
    setCues((cs) => cs.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  };

  // 视频时间同步高亮
  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    const t = v.currentTime * 1000;
    const idx = cues.findIndex((c) => t >= c.start && t <= c.end);
    setCurrent(idx);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed p-6 cursor-pointer hover:border-primary hover:bg-muted/30 transition-all">
          <FileText className="h-7 w-7 text-muted-foreground" />
          <p className="text-sm text-muted-foreground text-center">{L("Import subtitles (SRT / VTT / ASS / SSA / SBV)")}</p>
          <input type="file" accept=".srt,.vtt,.ass,.ssa,.sbv,text/plain" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) loadFile(f); }} />
        </label>
        <label className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed p-6 cursor-pointer hover:border-primary hover:bg-muted/30 transition-all">
          <Play className="h-7 w-7 text-muted-foreground" />
          <p className="text-sm text-muted-foreground text-center">{L("Load a video to preview timing (optional)")}</p>
          <input type="file" accept="video/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) loadVideo(f); }} />
        </label>
      </div>

      {cues.length > 0 && (
        <>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">{cues.length} {L("cues")}</span>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <input type="number" step={0.1} value={offset} onChange={(e) => setOffset(Number(e.target.value))} className="tool-input w-20 py-1" />
              <span className="text-xs text-muted-foreground">s</span>
              <button onClick={applyOffset} className="tool-btn tool-btn-secondary py-1">{L("Shift all")}</button>
            </div>
            <div className="ml-auto flex gap-2">
              <button onClick={() => download("srt")} className="tool-btn tool-btn-secondary py-1"><Download className="h-3.5 w-3.5" />SRT</button>
              <button onClick={() => download("vtt")} className="tool-btn tool-btn-secondary py-1"><Download className="h-3.5 w-3.5" />VTT</button>
              <button onClick={() => download("ass")} className="tool-btn tool-btn-secondary py-1"><Download className="h-3.5 w-3.5" />ASS</button>
            </div>
          </div>

          {videoUrl && (
            <video
              ref={videoRef}
              src={videoUrl}
              controls
              className="w-full rounded-lg border max-h-72"
              onTimeUpdate={onTimeUpdate}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
            />
          )}

          <div className="rounded-lg border max-h-96 overflow-y-auto divide-y">
            {cues.map((c, i) => (
              <div
                key={c.id}
                onClick={() => { setSelected(i); if (videoRef.current) videoRef.current.currentTime = c.start / 1000; }}
                className={`p-3 cursor-pointer transition-colors ${i === current ? "bg-primary/10" : i === selected ? "bg-muted/60" : "hover:bg-muted/30"}`}
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <span className="font-mono">#{i + 1}</span>
                  <input
                    type="text"
                    value={fmtSrt(c.start).slice(0, 8)}
                    onChange={(e) => updateCue(i, { start: parseTime(e.target.value + ",000") })}
                    onClick={(e) => e.stopPropagation()}
                    className="tool-input w-24 py-0.5 font-mono text-xs"
                  />
                  <span>→</span>
                  <input
                    type="text"
                    value={fmtSrt(c.end).slice(0, 8)}
                    onChange={(e) => updateCue(i, { end: parseTime(e.target.value + ",000") })}
                    onClick={(e) => e.stopPropagation()}
                    className="tool-input w-24 py-0.5 font-mono text-xs"
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); setCues((cs) => cs.filter((_, j) => j !== i)); }}
                    className="ml-auto text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                {i === selected ? (
                  <textarea
                    value={c.text}
                    onChange={(e) => updateCue(i, { text: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                    className="tool-input text-sm"
                    rows={Math.min(4, c.text.split("\n").length + 1)}
                    autoFocus
                  />
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{c.text}</p>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              const last = cues[cues.length - 1];
              setCues((cs) => [...cs, { id: Date.now(), start: last ? last.end : 0, end: last ? last.end + 2000 : 2000, text: "" }]);
              setSelected(cues.length);
            }}
            className="tool-btn tool-btn-secondary"
          >
            <Plus className="h-4 w-4" />{L("Add cue")}
          </button>
        </>
      )}

      {cues.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-6">
          {L("Import a subtitle file to start editing. Everything stays in your browser.")}
        </p>
      )}
    </div>
  );
}
