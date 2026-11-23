/**
 * Resize and crop math shared by the video tools.
 * Width and height stay even because the H.264 encoder uses 4:2:0.
 * The same numbers are drawn on the preview and passed to ffmpeg.
 */

export interface Size {
  width: number;
  height: number;
}

export interface ResizePlan extends Size {
  /** Output is larger than the source on at least one side. */
  upscaling: boolean;
  /** The request was larger than the memory cap. */
  clamped: boolean;
}

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const RESIZE_PRESETS = [
  { id: "1080p", label: "1080p", width: 1920, height: 1080 },
  { id: "720p", label: "720p", width: 1280, height: 720 },
  { id: "480p", label: "480p", width: 854, height: 480 },
  { id: "360p", label: "360p", width: 640, height: 360 },
] as const;

export type ResizePresetId = (typeof RESIZE_PRESETS)[number]["id"];

export const CROP_ASPECTS = [
  { id: "free", label: "Free" },
  { id: "16:9", label: "16:9" },
  { id: "9:16", label: "9:16" },
  { id: "1:1", label: "1:1" },
  { id: "4:5", label: "4:5" },
  { id: "custom", label: "Custom" },
] as const;

export type CropAspectId = (typeof CROP_ASPECTS)[number]["id"];

export type CropHandle = "move" | "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

/** Longest side we will ask the browser encoder to produce, unless the source is already larger. */
export const MAX_OUTPUT_SIDE = 4096;

const ASPECT_RATIOS: Record<Exclude<CropAspectId, "free" | "custom">, number> = {
  "16:9": 16 / 9,
  "9:16": 9 / 16,
  "1:1": 1,
  "4:5": 4 / 5,
};

export function evenFloor(value: number, min = 0): number {
  const floorMin = min % 2 === 0 ? min : min + 1;
  if (!Number.isFinite(value)) return floorMin;
  let v = Math.floor(value);
  if (v % 2 !== 0) v -= 1;
  return Math.max(floorMin, v);
}

export function aspectRatio(id: CropAspectId, customWidth = 0, customHeight = 0): number | null {
  if (id === "free") return null;
  if (id === "custom") {
    if (customWidth > 0 && customHeight > 0) return customWidth / customHeight;
    return null;
  }
  return ASPECT_RATIOS[id];
}

function outputCap(source: Size): number {
  return Math.max(MAX_OUTPUT_SIDE, Math.ceil(source.width), Math.ceil(source.height));
}

/**
 * Fit `source` inside `requested` when keepAspect is set, otherwise stretch.
 * Does not swap orientation — preset buttons do that before calling this.
 */
export function planResize(source: Size, requested: Size, keepAspect: boolean): ResizePlan {
  const srcW = Math.max(1, source.width);
  const srcH = Math.max(1, source.height);
  const cap = outputCap({ width: srcW, height: srcH });
  const clamped = requested.width > cap || requested.height > cap;
  const boxW = Math.min(Math.max(2, requested.width || srcW), cap);
  const boxH = Math.min(Math.max(2, requested.height || srcH), cap);

  if (!keepAspect) {
    const width = evenFloor(boxW, 2);
    const height = evenFloor(boxH, 2);
    return { width, height, upscaling: width > srcW || height > srcH, clamped };
  }

  const scale = Math.min(boxW / srcW, boxH / srcH);
  let width = evenFloor(srcW * scale, 2);
  let height = evenFloor(srcH * scale, 2);
  if (width > boxW) width = evenFloor(boxW, 2);
  if (height > boxH) height = evenFloor(boxH, 2);
  if (scale <= 1) {
    width = Math.min(width, evenFloor(srcW, 2));
    height = Math.min(height, evenFloor(srcH, 2));
  }
  return {
    width,
    height,
    upscaling: width > srcW || height > srcH,
    clamped,
  };
}

/** Landscape presets become portrait frames when the source is portrait and aspect is locked. */
export function presetPlan(source: Size, preset: Size, keepAspect: boolean): ResizePlan & { portraitFrame: boolean } {
  const portraitFrame = keepAspect && source.height > source.width && preset.width >= preset.height;
  const box = portraitFrame ? { width: preset.height, height: preset.width } : preset;
  return { ...planResize(source, box, keepAspect), portraitFrame };
}

function minCropSide(frame: Size): number {
  const limit = Math.min(evenFloor(frame.width, 2), evenFloor(frame.height, 2));
  return Math.min(16, limit);
}

/**
 * Snap a crop to even pixels inside the frame.
 * When `ratio` is set (width / height), height follows width, then the box shrinks to fit.
 */
export function normalizeCrop(crop: CropRect, frame: Size, ratio: number | null): CropRect {
  const frameW = Math.max(2, Math.floor(frame.width));
  const frameH = Math.max(2, Math.floor(frame.height));
  const min = minCropSide({ width: frameW, height: frameH });

  let width = evenFloor(crop.width, min);
  let height = evenFloor(crop.height, min);

  if (ratio && ratio > 0) {
    height = evenFloor(width / ratio, min);
    if (width > frameW || height > frameH) {
      const scale = Math.min(frameW / width, frameH / Math.max(height, 1));
      width = evenFloor(width * scale, min);
      height = evenFloor(width / ratio, min);
    }
    if (height > frameH) {
      height = evenFloor(frameH, min);
      width = evenFloor(height * ratio, min);
    }
    if (width > frameW) width = evenFloor(frameW, min);
  }

  width = Math.max(min, Math.min(width, evenFloor(frameW, min)));
  height = Math.max(min, Math.min(height, evenFloor(frameH, min)));

  let x = evenFloor(Math.max(0, crop.x), 0);
  let y = evenFloor(Math.max(0, crop.y), 0);
  const maxX = Math.max(0, frameW - width);
  const maxY = Math.max(0, frameH - height);
  if (x > maxX) x = evenFloor(maxX, 0);
  if (y > maxY) y = evenFloor(maxY, 0);
  if (x + width > frameW) width = evenFloor(frameW - x, min);
  if (y + height > frameH) height = evenFloor(frameH - y, min);

  return { x, y, width, height };
}

/** Largest even crop of `ratio`, centered. `coverage` < 1 insets a freeform box. */
export function centeredCrop(frame: Size, ratio: number | null, coverage = 1): CropRect {
  const frameW = evenFloor(frame.width, 2);
  const frameH = evenFloor(frame.height, 2);
  const min = minCropSide({ width: frameW, height: frameH });
  const cover = Math.min(1, Math.max(0.05, coverage));
  let width = evenFloor(frameW * cover, min);
  let height = evenFloor(frameH * cover, min);
  if (ratio && ratio > 0) {
    height = evenFloor(width / ratio, min);
    if (height > frameH * cover) {
      height = evenFloor(frameH * cover, min);
      width = evenFloor(height * ratio, min);
    }
  }
  const x = evenFloor((frameW - width) / 2, 0);
  const y = evenFloor((frameH - height) / 2, 0);
  return normalizeCrop({ x, y, width, height }, { width: frameW, height: frameH }, ratio);
}

export function dragCrop(
  start: CropRect,
  dx: number,
  dy: number,
  handle: CropHandle,
  frame: Size,
  ratio: number | null,
): CropRect {
  if (handle === "move") {
    return normalizeCrop({ ...start, x: start.x + dx, y: start.y + dy }, frame, null);
  }

  const east = handle.includes("e");
  const west = handle.includes("w");
  const south = handle.includes("s");
  const north = handle.includes("n");

  if (!ratio) {
    let x = start.x;
    let y = start.y;
    let width = start.width;
    let height = start.height;
    if (east) width = start.width + dx;
    if (west) {
      x = start.x + dx;
      width = start.width - dx;
    }
    if (south) height = start.height + dy;
    if (north) {
      y = start.y + dy;
      height = start.height - dy;
    }
    if (width < 0) {
      x += width;
      width = -width;
    }
    if (height < 0) {
      y += height;
      height = -height;
    }
    return normalizeCrop({ x, y, width, height }, frame, null);
  }

  const widthDelta = east ? dx : west ? -dx : 0;
  const heightDelta = south ? dy : north ? -dy : 0;
  const driveWidth = east || west ? !(north || south) || Math.abs(widthDelta) >= Math.abs(heightDelta) * ratio : false;

  let width = start.width;
  let height = start.height;
  if (driveWidth) {
    width = Math.max(2, start.width + widthDelta);
    height = width / ratio;
  } else {
    height = Math.max(2, start.height + heightDelta);
    width = height * ratio;
  }

  const right = start.x + start.width;
  const bottom = start.y + start.height;
  const x = west && !east ? right - width : !east && !west ? start.x + (start.width - width) / 2 : start.x;
  const y = north && !south ? bottom - height : !north && !south ? start.y + (start.height - height) / 2 : start.y;
  return normalizeCrop({ x, y, width, height }, frame, ratio);
}

export function scaleFilter(width: number, height: number): string {
  return `scale=${width}:${height}:flags=lanczos,setsar=1`;
}

export function cropFilter(crop: CropRect): string {
  return `crop=${crop.width}:${crop.height}:${crop.x}:${crop.y},setsar=1`;
}

/**
 * A stream-copied trim can report a playhead past the duration, so a player
 * shows 0:03 / 0:02. Keep the displayed time inside the clip.
 */
export function clampTrimClock(currentTime: number, duration: number): { current: number; seekTo: number | null } {
  if (!Number.isFinite(duration) || duration <= 0) return { current: 0, seekTo: null };
  const current = Number.isFinite(currentTime) ? currentTime : 0;
  if (current > duration + 0.04) {
    const seekTo = Math.max(0, duration - 0.001);
    return { current: seekTo, seekTo };
  }
  return { current: Math.min(Math.max(0, current), duration), seekTo: null };
}

export function mp4Args(inputName: string, videoFilter: string, outputName = "output.mp4", withAudio = true): string[] {
  const args = ["-i", inputName, "-vf", videoFilter, "-map", "0:v:0"];
  if (withAudio) args.push("-map", "0:a:0?");
  args.push("-c:v", "libx264", "-preset", "veryfast", "-crf", "23", "-pix_fmt", "yuv420p");
  if (withAudio) args.push("-c:a", "aac", "-b:a", "128k");
  else args.push("-an");
  args.push("-y", outputName);
  return args;
}
