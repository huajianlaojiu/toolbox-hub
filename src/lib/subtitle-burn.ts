import { mp4Args } from "@/lib/video-geometry";
import { buildAss, drawtextFilter, type CaptionStyle, type Cue } from "@/lib/subtitles";

const FONT_URL = "/fonts/NotoSans-Regular.ttf";
const FONT_PATH = "/fonts/NotoSans-Regular.ttf";

let fontBytes: Promise<Uint8Array> | null = null;

function loadCaptionFont(): Promise<Uint8Array> {
  if (typeof window === "undefined") return Promise.reject(new Error("caption font requires a browser"));
  if (!fontBytes) {
    fontBytes = fetch(FONT_URL).then(async (response) => {
      if (!response.ok) throw new Error("caption font failed to load");
      return new Uint8Array(await response.arrayBuffer());
    });
    fontBytes.catch(() => {
      fontBytes = null;
    });
  }
  return fontBytes;
}

async function ignore(run: () => Promise<unknown>) {
  try {
    await run();
  } catch {
    /* The file is not there yet, or it was already removed. */
  }
}

function inputExt(name: string): string {
  const raw = name.split(".").pop()?.toLowerCase() ?? "mp4";
  return /^[a-z0-9]{1,5}$/.test(raw) ? raw : "mp4";
}

function tail(logs: string[]): string {
  const line = logs.map((item) => item.trim()).filter(Boolean).slice(-4).join(" ");
  return line.slice(0, 280);
}

/**
 * Burn cues into the picture and return an MP4.
 * libass is tried first, with the bundled font. If that build cannot load the font,
 * the same cues are drawn with drawtext and fontfile, which does not need fontconfig.
 */
export async function burnSubtitles(
  file: File,
  cues: Cue[],
  style: CaptionStyle,
  videoSize: { width: number; height: number },
  onProgress: (percent: number) => void,
): Promise<Blob> {
  if (cues.length === 0) throw new Error("no subtitle cues");
  const drawn = drawtextFilter(cues, style, videoSize.width);
  if (!drawn.filter || drawn.files.length === 0) throw new Error("no subtitle text");
  if (drawn.files.length > 500) {
    throw new Error("too many caption lines for this browser. Shorten the subtitle file and try again");
  }

  const { loadFFmpeg } = await import("@/lib/ffmpeg");
  const { ffmpeg, fetchFile } = await loadFFmpeg();
  const font = await loadCaptionFont();
  const logs: string[] = [];
  const onLog = ({ message }: { message: string }) => {
    if (message) logs.push(message);
  };
  const onProg = ({ progress }: { progress: number }) => {
    if (!Number.isFinite(progress)) return;
    onProgress(Math.min(99, Math.max(0, Math.round(progress * 100))));
  };
  ffmpeg.on("log", onLog);
  ffmpeg.on("progress", onProg);

  const inputName = `in.${inputExt(file.name)}`;
  const outputName = "out.mp4";
  const extra = [FONT_PATH, "subs.ass", ...drawn.files.map((item) => item.name)];

  const encode = async (filter: string): Promise<number> => {
    await ignore(() => ffmpeg.deleteFile(outputName));
    let code = await ffmpeg.exec(mp4Args(inputName, filter, outputName, true));
    if (typeof code === "number" && code !== 0) {
      await ignore(() => ffmpeg.deleteFile(outputName));
      code = await ffmpeg.exec(mp4Args(inputName, filter, outputName, false));
    }
    return typeof code === "number" ? code : 0;
  };

  const readOutput = async (): Promise<Blob> => {
    const data = await ffmpeg.readFile(outputName);
    if (!(data instanceof Uint8Array) || data.byteLength < 32) {
      throw new Error("encoder produced an empty file");
    }
    return new Blob([data as BlobPart], { type: "video/mp4" });
  };

  try {
    await ignore(() => ffmpeg.deleteFile(inputName));
    await ignore(() => ffmpeg.deleteFile(outputName));
    await ignore(() => ffmpeg.createDir("/fonts"));
    await ffmpeg.writeFile(inputName, await fetchFile(file));
    // writeFile transfers the buffer. Keep the cached font intact.
    await ffmpeg.writeFile(FONT_PATH, font.slice());
    await ffmpeg.writeFile("subs.ass", new TextEncoder().encode(buildAss(cues, style, videoSize)));

    const assCode = await encode("subtitles=subs.ass:fontsdir=/fonts");
    const fontLoaded = logs.some((line) => /NotoSans/i.test(line));
    if (assCode === 0 && fontLoaded) return await readOutput();

    logs.length = 0;
    for (const item of drawn.files) {
      await ffmpeg.writeFile(item.name, new TextEncoder().encode(item.text));
    }
    const drawCode = await encode(drawn.filter);
    if (drawCode !== 0) {
      throw new Error(tail(logs) || `encoder stopped (${drawCode})`);
    }
    return await readOutput();
  } finally {
    ffmpeg.off("log", onLog);
    ffmpeg.off("progress", onProg);
    await ignore(() => ffmpeg.deleteFile(inputName));
    await ignore(() => ffmpeg.deleteFile(outputName));
    for (const name of extra) await ignore(() => ffmpeg.deleteFile(name));
  }
}
