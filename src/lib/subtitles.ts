import { CAPTION_FONT_FAMILY } from "@/lib/caption-font";

export interface Cue {
  /** Inclusive start, in milliseconds. */
  start: number;
  /** Exclusive-enough end, in milliseconds. Always greater than start. */
  end: number;
  text: string;
}

export type CaptionPosition = "bottom" | "center" | "top";

export interface CaptionStyle {
  fontSize: number;
  /** #RRGGBB */
  color: string;
  position: CaptionPosition;
}

const FULL_TIME = /^(\d+):(\d{1,2}):(\d{1,2})[.,](\d{1,3})$/;
const SHORT_TIME = /^(\d{1,2}):(\d{1,2})[.,](\d{1,3})$/;

export function parseTimestamp(raw: string): number {
  const token = raw.trim().split(/\s+/)[0] ?? "";
  const full = FULL_TIME.exec(token);
  if (full) {
    return (
      Number(full[1]) * 3_600_000 +
      Number(full[2]) * 60_000 +
      Number(full[3]) * 1_000 +
      Number(full[4].padEnd(3, "0"))
    );
  }
  const short = SHORT_TIME.exec(token);
  if (short) {
    return Number(short[1]) * 60_000 + Number(short[2]) * 1_000 + Number(short[3].padEnd(3, "0"));
  }
  return Number.NaN;
}

function cleanText(raw: string): string {
  return raw
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?[a-z][^>]*>/gi, "")
    .replace(/\{[^}]*\}/g, "")
    .replace(/\\[Nn]/g, "\n")
    .replace(/\\h/g, " ")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function pushCue(cues: Cue[], start: number, end: number, text: string) {
  const cleaned = cleanText(text);
  if (!cleaned || !Number.isFinite(start)) return;
  const safeEnd = Number.isFinite(end) && end > start ? end : start + 800;
  cues.push({
    start: Math.max(0, Math.round(start)),
    end: Math.max(0, Math.round(safeEnd)),
    text: cleaned,
  });
}

function finish(cues: Cue[]): Cue[] {
  return cues.sort((a, b) => a.start - b.start || a.end - b.end);
}

function parseAss(content: string): Cue[] {
  const cues: Cue[] = [];
  for (const line of content.split("\n")) {
    const match = line.match(/^Dialogue:\s*\d+,([^,]*),([^,]*),(?:[^,]*,){6}(.*)$/i);
    if (!match) continue;
    pushCue(cues, parseTimestamp(match[1]), parseTimestamp(match[2]), match[3]);
  }
  return finish(cues);
}

function stripVttHeader(content: string): string {
  if (!/^WEBVTT\b/i.test(content)) return content;
  const lines = content.split("\n");
  let index = 1;
  while (index < lines.length && lines[index].trim() !== "") index += 1;
  while (index < lines.length && lines[index].trim() === "") index += 1;
  return lines.slice(index).join("\n");
}

function parseTimedBlocks(content: string): Cue[] {
  const body = stripVttHeader(content);
  const cues: Cue[] = [];
  for (const block of body.split(/\n\s*\n/)) {
    const lines = block.split("\n").filter((line) => line.trim() !== "");
    const timeIdx = lines.findIndex((line) => line.includes("-->"));
    if (timeIdx === -1) continue;
    const [startRaw, endRaw = ""] = lines[timeIdx].split("-->");
    pushCue(cues, parseTimestamp(startRaw), parseTimestamp(endRaw), lines.slice(timeIdx + 1).join("\n"));
  }
  return finish(cues);
}

function parseSbv(content: string): Cue[] {
  const cues: Cue[] = [];
  for (const block of content.split(/\n\s*\n/)) {
    const lines = block.split("\n").filter((line) => line.trim() !== "");
    if (lines.length < 2 || !lines[0].includes(",")) continue;
    const [startRaw, endRaw = ""] = lines[0].split(",");
    pushCue(cues, parseTimestamp(startRaw), parseTimestamp(endRaw), lines.slice(1).join("\n"));
  }
  return finish(cues);
}

/** SRT, WebVTT, ASS/SSA, and YouTube SBV. Returns cues in start order. */
export function parseSubtitles(content: string): Cue[] {
  const text = content.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  if (!text) return [];
  if (/\[Events\]/i.test(text) || /^Dialogue:/m.test(text)) return parseAss(text);
  if (text.includes("-->")) return parseTimedBlocks(text);
  return parseSbv(text);
}

export function captionHex(color: string): string {
  return /^#[0-9a-fA-F]{6}$/.test(color) ? color.toUpperCase() : "#FFFFFF";
}

export function clampFontSize(fontSize: number): number {
  if (!Number.isFinite(fontSize)) return 32;
  return Math.min(72, Math.max(16, Math.round(fontSize)));
}

function assTimestamp(ms: number): string {
  const ticks = Math.max(0, Math.round(ms / 10));
  const h = Math.floor(ticks / 360000);
  const m = String(Math.floor(ticks / 6000) % 60).padStart(2, "0");
  const s = String(Math.floor(ticks / 100) % 60).padStart(2, "0");
  const cs = String(ticks % 100).padStart(2, "0");
  return `${h}:${m}:${s}.${cs}`;
}

export function assColor(hex: string): string {
  const value = captionHex(hex).slice(1);
  return `&H00${value.slice(4, 6)}${value.slice(2, 4)}${value.slice(0, 2)}`;
}

function alignment(position: CaptionPosition): number {
  if (position === "top") return 8;
  if (position === "center") return 5;
  return 2;
}

function escapeAss(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/\{/g, "\\{").replace(/\}/g, "\\}").replace(/\n/g, "\\N");
}

/** ASS script using the bundled font. PlayRes matches the video so font size is in video pixels. */
export function buildAss(cues: Cue[], style: CaptionStyle, play: { width: number; height: number }): string {
  const width = Math.max(2, Math.round(play.width) || 1280);
  const height = Math.max(2, Math.round(play.height) || 720);
  const fontSize = clampFontSize(style.fontSize);
  const margin = Math.max(16, Math.round(height * 0.05));
  const outline = fontSize >= 48 ? 3 : 2;
  const events = cues
    .map(
      (cue) =>
        `Dialogue: 0,${assTimestamp(cue.start)},${assTimestamp(cue.end)},Default,,0,0,0,,${escapeAss(cue.text)}`,
    )
    .join("\n");
  return `[Script Info]
ScriptType: v4.00+
PlayResX: ${width}
PlayResY: ${height}
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${CAPTION_FONT_FAMILY},${fontSize},${assColor(style.color)},&H000000FF,&H00000000,&H64000000,0,0,0,0,100,100,0,0,1,${outline},0,${alignment(style.position)},${margin},${margin},${margin},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
${events}
`;
}

function wrapLine(line: string, maxChars: number): string[] {
  if (line.length <= maxChars) return [line];
  const words = line.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  const pushChunks = (part: string) => {
    if (part.length <= maxChars) {
      lines.push(part);
      return;
    }
    for (let i = 0; i < part.length; i += maxChars) lines.push(part.slice(i, i + maxChars));
  };
  if (words.length === 0) return [line.slice(0, maxChars)];
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      pushChunks(current);
      current = word.length > maxChars ? "" : word;
      if (word.length > maxChars) pushChunks(word);
    } else {
      current = next;
    }
  }
  if (current) pushChunks(current);
  return lines;
}

export function wrapCaption(text: string, fontSize: number, videoWidth: number): string[] {
  const size = clampFontSize(fontSize);
  const width = Math.max(160, videoWidth || 1280);
  const maxChars = Math.max(12, Math.floor((width * 0.88) / (size * 0.55)));
  const lines: string[] = [];
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    lines.push(...wrapLine(line, maxChars));
    if (lines.length >= 4) break;
  }
  return lines.slice(0, 4);
}

export interface DrawtextPlan {
  filter: string;
  files: { name: string; text: string }[];
}

/**
 * One drawtext per caption line, with fontfile pointed at the bundled TTF.
 * Text lives in sidecar files so quotes and commas in the caption do not break the filter graph.
 */
export function drawtextFilter(cues: Cue[], style: CaptionStyle, videoWidth: number): DrawtextPlan {
  const fontSize = clampFontSize(style.fontSize);
  const color = captionHex(style.color).slice(1);
  const files: { name: string; text: string }[] = [];
  const parts: string[] = [];
  const step = fontSize + 8;
  const margin = Math.max(16, Math.round(step * 0.6));
  cues.forEach((cue, cueIndex) => {
    const lines = wrapCaption(cue.text, fontSize, videoWidth);
    const start = (cue.start / 1000).toFixed(3);
    const end = (cue.end / 1000).toFixed(3);
    const block = lines.length * step;
    lines.forEach((line, lineIndex) => {
      const name = `c${cueIndex}_${lineIndex}.txt`;
      files.push({ name, text: line });
      let y = `${margin + lineIndex * step}`;
      if (style.position === "bottom") y = `h-${margin + (lines.length - lineIndex) * step}`;
      if (style.position === "center") y = `(h-${block})/2+${lineIndex * step}`;
      parts.push(
        `drawtext=fontfile=/fonts/NotoSans-Regular.ttf:textfile=${name}:expansion=none:fontsize=${fontSize}:fontcolor=0x${color}:borderw=2:bordercolor=black:x=(w-text_w)/2:y=${y}:enable='between(t,${start},${end})'`,
      );
    });
  });
  return { filter: parts.join(","), files };
}
