/**
 * ffmpeg.ts — ffmpeg.wasm 0.12.10 共享加载器（修复版）
 *
 * 背景：@ffmpeg/ffmpeg@0.12.10 的 load() 无论传不传 classWorkerURL，
 * 都会执行 new Worker(new URL("./worker.js", import.meta.url), { type: "module" })。
 * 当主库从 unpkg 以 ESM 动态 import 时，import.meta.url 指向 unpkg 域，
 * 跨域创建 Worker 被浏览器安全策略直接拒绝（wenankuai 线上 ffmpeg 工具
 * 集体故障的根因）。
 *
 * 修复方案（已在 Chrome 144 实测通过，7.3s 完成加载+3 个真实转码任务）：
 *   1. 把官方 worker.js 源码内联为字符串：去掉 `import ... from "./const.js"`
 *      相对导入（blob worker 里无法解析），常量直接内联；
 *   2. 打成 Blob URL，通过 classWorkerURL 传入 —— 同源 blob worker，合法；
 *   3. core 必须用 ESM 版（@ffmpeg/core@0.12.6/dist/esm）：module worker 里
 *      没有 importScripts，只能走 `await import(coreURL)` 动态导入分支，
 *      而 UMD core 没有 default export 会失败；
 *   4. wasm 通过 mainScriptUrlOrBlob 的 hash hack 传给 emscripten locateFile。
 *
 * 注意：writeFile(name, data) 会把 data 的 ArrayBuffer transfer 给 worker，
 * 调用侧原变量会变空（length=0）——需要复用数据时先 .slice() 复制。
 */

const FFMPEG_VERSION = "0.12.10";
const UTIL_VERSION = "0.12.1";
const CORE_VERSION = "0.12.6";
const CORE_URL = `https://unpkg.com/@ffmpeg/core@${CORE_VERSION}/dist/esm/ffmpeg-core.js`;
const WASM_URL = `https://unpkg.com/@ffmpeg/core@${CORE_VERSION}/dist/esm/ffmpeg-core.wasm`;

/** 内联化的官方 worker（module worker，无 import 语句） */
const WORKER_SOURCE = `
const FFMessageType = {
  LOAD: "LOAD", EXEC: "EXEC", WRITE_FILE: "WRITE_FILE", READ_FILE: "READ_FILE",
  DELETE_FILE: "DELETE_FILE", RENAME: "RENAME", CREATE_DIR: "CREATE_DIR",
  LIST_DIR: "LIST_DIR", DELETE_DIR: "DELETE_DIR", ERROR: "ERROR", DOWNLOAD: "DOWNLOAD",
  PROGRESS: "PROGRESS", LOG: "LOG", MOUNT: "MOUNT", UNMOUNT: "UNMOUNT"
};
const ERROR_UNKNOWN_MESSAGE_TYPE = "unknown message type";
const ERROR_NOT_LOADED = "ffmpeg is not loaded";
const ERROR_IMPORT_FAILURE = "failed to import ffmpeg-core.js";
let ffmpeg;
const load = async ({ coreURL, wasmURL, workerURL }) => {
  const first = !ffmpeg;
  self.createFFmpegCore = (await import(coreURL)).default;
  if (!self.createFFmpegCore) throw ERROR_IMPORT_FAILURE;
  const _wasmURL = wasmURL || coreURL.replace(/.js$/, ".wasm");
  const _workerURL = workerURL || coreURL.replace(/.js$/, ".worker.js");
  ffmpeg = await self.createFFmpegCore({
    mainScriptUrlOrBlob: coreURL + "#" + btoa(JSON.stringify({ wasmURL: _wasmURL, workerURL: _workerURL }))
  });
  ffmpeg.setLogger((data) => self.postMessage({ type: FFMessageType.LOG, data }));
  ffmpeg.setProgress((data) => self.postMessage({ type: FFMessageType.PROGRESS, data }));
  return first;
};
const exec = ({ args, timeout = -1 }) => {
  ffmpeg.setTimeout(timeout);
  ffmpeg.exec(...args);
  const ret = ffmpeg.ret;
  ffmpeg.reset();
  return ret;
};
const writeFile = ({ path, data }) => { ffmpeg.FS.writeFile(path, data); return true; };
const readFile = ({ path, encoding }) => ffmpeg.FS.readFile(path, { encoding });
const deleteFile = ({ path }) => { ffmpeg.FS.unlink(path); return true; };
const rename = ({ oldPath, newPath }) => { ffmpeg.FS.rename(oldPath, newPath); return true; };
const createDir = ({ path }) => { ffmpeg.FS.mkdir(path); return true; };
const listDir = ({ path }) => {
  const names = ffmpeg.FS.readdir(path);
  const nodes = [];
  for (const name of names) {
    const stat = ffmpeg.FS.stat(path + "/" + name);
    nodes.push({ name, isDir: ffmpeg.FS.isDir(stat.mode) });
  }
  return nodes;
};
const deleteDir = ({ path }) => { ffmpeg.FS.rmdir(path); return true; };
const mount = ({ fsType, options, mountPoint }) => {
  const fs = ffmpeg.FS.filesystems[fsType];
  if (!fs) return false;
  ffmpeg.FS.mount(fs, options, mountPoint);
  return true;
};
const unmount = ({ mountPoint }) => { ffmpeg.FS.unmount(mountPoint); return true; };
self.onmessage = async ({ data: { id, type, data: _data } }) => {
  const trans = [];
  let data;
  try {
    if (type !== FFMessageType.LOAD && !ffmpeg) throw ERROR_NOT_LOADED;
    switch (type) {
      case FFMessageType.LOAD: data = await load(_data); break;
      case FFMessageType.EXEC: data = exec(_data); break;
      case FFMessageType.WRITE_FILE: data = writeFile(_data); break;
      case FFMessageType.READ_FILE: data = readFile(_data); break;
      case FFMessageType.DELETE_FILE: data = deleteFile(_data); break;
      case FFMessageType.RENAME: data = rename(_data); break;
      case FFMessageType.CREATE_DIR: data = createDir(_data); break;
      case FFMessageType.LIST_DIR: data = listDir(_data); break;
      case FFMessageType.DELETE_DIR: data = deleteDir(_data); break;
      case FFMessageType.MOUNT: data = mount(_data); break;
      case FFMessageType.UNMOUNT: data = unmount(_data); break;
      default: throw ERROR_UNKNOWN_MESSAGE_TYPE;
    }
  } catch (e) {
    self.postMessage({ id, type: FFMessageType.ERROR, data: e.toString() });
    return;
  }
  if (data instanceof Uint8Array) trans.push(data.buffer);
  self.postMessage({ id, type, data }, trans);
};
`;

export interface FFmpegBundle {
  ffmpeg: any;
  fetchFile: (file: File | Blob | string) => Promise<Uint8Array | string>;
}

let cached: Promise<FFmpegBundle> | null = null;

/** 加载（单例）。首次约 7 秒（下载 ~25MB wasm），之后秒开。 */
export function loadFFmpeg(): Promise<FFmpegBundle> {
  if (typeof window === "undefined") return Promise.reject(new Error("ffmpeg.wasm requires a browser"));
  if (cached) return cached;
  cached = (async () => {
    const blob = new Blob([WORKER_SOURCE], { type: "text/javascript" });
    const classWorkerURL = URL.createObjectURL(blob);
    const ffmpegMod = await import(/* webpackIgnore: true */ `https://unpkg.com/@ffmpeg/ffmpeg@${FFMPEG_VERSION}/dist/esm/index.js`);
    const utilMod = await import(/* webpackIgnore: true */ `https://unpkg.com/@ffmpeg/util@${UTIL_VERSION}/dist/esm/index.js`);
    const ffmpeg = new ffmpegMod.FFmpeg();
    await ffmpeg.load({ classWorkerURL, coreURL: CORE_URL, wasmURL: WASM_URL });
    return { ffmpeg, fetchFile: utilMod.fetchFile };
  })();
  cached.catch(() => { cached = null; });
  return cached;
}

/** 文件下载辅助 */
export function downloadBlob(data: Uint8Array | Blob, filename: string, mime: string) {
  // TS 5.7+ 把 Uint8Array 变成 Uint8Array<ArrayBufferLike> 泛型，与 BlobPart 要求的
  // ArrayBufferView<ArrayBuffer> 不兼容；运行时 Uint8Array 本身就是合法 BlobPart。
  const blob = data instanceof Blob ? data : new Blob([data as unknown as BlobPart], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1024 / 1024).toFixed(2) + " MB";
}
