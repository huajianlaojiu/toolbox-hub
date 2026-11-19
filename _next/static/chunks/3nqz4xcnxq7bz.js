(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,90775,e=>{"use strict";let t="0.12.6",a=`https://unpkg.com/@ffmpeg/core@${t}/dist/esm/ffmpeg-core.js`,s=`https://unpkg.com/@ffmpeg/core@${t}/dist/esm/ffmpeg-core.wasm`,r=`
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
`,o=null;e.s(["loadFFmpeg",0,function(){return o||(o=(async()=>{let e=new Blob([r],{type:"text/javascript"}),t=URL.createObjectURL(e),o=await import("https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/esm/index.js"),n=await import("https://unpkg.com/@ffmpeg/util@0.12.1/dist/esm/index.js"),p=new o.FFmpeg;return await p.load({classWorkerURL:t,coreURL:a,wasmURL:s}),{ffmpeg:p,fetchFile:n.fetchFile}})()).catch(()=>{o=null}),o}])}]);