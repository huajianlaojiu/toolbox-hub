/** 与 ffmpeg 加载器分开，避免只需要体积显示的工具把 worker 源码打进自己的包。 */

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
