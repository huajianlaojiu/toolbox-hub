import { mp4Args } from "@/lib/video-geometry";

/**
 * Re-encode one video in the browser with the shared ffmpeg.wasm loader.
 * Audio is kept when the file has a soundtrack. A clip with no audio is retried
 * as video-only, which is what phone screen recordings sometimes are.
 */
export async function transcodeVideo(
  file: File,
  filter: string,
  onProgress: (percent: number) => void,
): Promise<Blob> {
  const { loadFFmpeg } = await import("@/lib/ffmpeg");
  const { ffmpeg, fetchFile } = await loadFFmpeg();
  const onProg = ({ progress }: { progress: number }) => {
    if (!Number.isFinite(progress)) return;
    onProgress(Math.min(99, Math.max(0, Math.round(progress * 100))));
  };
  ffmpeg.on("progress", onProg);
  const rawExt = file.name.split(".").pop()?.toLowerCase() ?? "mp4";
  const ext = /^[a-z0-9]{1,5}$/.test(rawExt) ? rawExt : "mp4";
  const inputName = `in.${ext}`;
  const outputName = "out.mp4";
  try {
    await ignore(() => ffmpeg.deleteFile(inputName));
    await ignore(() => ffmpeg.deleteFile(outputName));
    await ffmpeg.writeFile(inputName, await fetchFile(file));
    let code = await ffmpeg.exec(mp4Args(inputName, filter, outputName, true));
    if (typeof code === "number" && code !== 0) {
      await ignore(() => ffmpeg.deleteFile(outputName));
      code = await ffmpeg.exec(mp4Args(inputName, filter, outputName, false));
    }
    if (typeof code === "number" && code !== 0) {
      throw new Error(`encoder stopped (${code})`);
    }
    const data = await ffmpeg.readFile(outputName);
    if (!(data instanceof Uint8Array) || data.byteLength < 32) {
      throw new Error("encoder produced an empty file");
    }
    return new Blob([data as BlobPart], { type: "video/mp4" });
  } finally {
    ffmpeg.off("progress", onProg);
    await ignore(() => ffmpeg.deleteFile(inputName));
    await ignore(() => ffmpeg.deleteFile(outputName));
  }
}

async function ignore(run: () => Promise<unknown>) {
  try {
    await run();
  } catch {
    /* The file is not there yet, or it was already removed. */
  }
}
