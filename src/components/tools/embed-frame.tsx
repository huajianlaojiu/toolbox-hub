"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ExternalLink, Maximize2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";

/**
 * 嵌入第三方单文件工具（public/embed/*.html）。
 * 这些工具是 MIT 许可的独立静态页，用 iframe 隔离样式与脚本。
 *
 * 历史问题：OpenReel / Pilko 这类全屏级应用本按完整浏览器视口（100vh）设计，
 * 塞进固定高度的 iframe 后，应用把全部 UI 压缩进更小空间，底部按钮与提示文字
 * 重叠（用户反馈的「下部文字折叠」）。
 *
 * 根治：
 *  - `auto`（默认，流式内容页如 Viral）：加载后直接读取 iframe 内部文档真实高度
 *    （同源可读 contentDocument），把 iframe 撑到内容高度，底部不再被截断。
 *  - 视口级编辑器（openreel / pilko）传 `auto={false}` 且 `height="100dvh"`，
 *    给满屏高度，应用按设计布局，挤压/重叠消失。
 *  - 全屏按钮保留：让容器进入浏览器 Fullscreen 拿完整视口；不支持时降级新标签页。
 */
export default function EmbedFrame({
  src,
  credit,
  height = "min(78dvh, 820px)",
  /** 流式内容页传 true（自动撑高到真实内容高度）；视口级编辑器传 false */
  auto = true,
}: {
  src: string;
  credit: string;
  height?: string;
  auto?: boolean;
}) {
  const { L } = useI18n();
  const [loaded, setLoaded] = useState(false);
  const [isFs, setIsFs] = useState(false);
  const [autoH, setAutoH] = useState<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setLoaded(false);
    setAutoH(null);
  }, [src]);

  // 跟踪全屏状态——全屏时容器必须撑满，否则仍只有那一小块
  useEffect(() => {
    const onChange = () => setIsFs(document.fullscreenElement === wrapRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // 同源读取嵌入页真实内容高度，自动撑开 iframe（避免固定高度截断底部）
  useEffect(() => {
    if (!auto) return;
    const iframe = iframeRef.current;
    if (!iframe) return;
    let ro: ResizeObserver | null = null;
    const measure = () => {
      try {
        const doc = iframe.contentDocument;
        if (!doc || !doc.documentElement) return;
        const h = doc.documentElement.scrollHeight;
        if (h > 0) setAutoH((prev) => (prev === null ? h : Math.max(prev, Math.min(h, 3000))));
        if (!ro && window.ResizeObserver) {
          ro = new ResizeObserver(() => {
            try {
              const hh = iframe.contentDocument?.documentElement.scrollHeight ?? 0;
              if (hh > 0) setAutoH((prev) => (prev === null ? hh : Math.max(prev, Math.min(hh, 3000))));
            } catch {
              /* cross-origin */
            }
          });
          ro.observe(doc.documentElement);
        }
      } catch {
        /* 跨域或尚未就绪：保持 fallback 高度 */
      }
    };
    iframe.addEventListener("load", measure);
    measure();
    return () => {
      iframe.removeEventListener("load", measure);
      ro?.disconnect();
    };
  }, [src, auto]);

  const openFullscreen = useCallback(() => {
    const el = wrapRef.current;
    if (el && typeof el.requestFullscreen === "function") {
      el.requestFullscreen().catch(() => {
        window.open(src, "_blank", "noopener,noreferrer");
      });
      return;
    }
    window.open(src, "_blank", "noopener,noreferrer");
  }, [src]);

  const frameHeight = isFs ? "100dvh" : autoH ? `${autoH}px` : height;

  return (
    <div className="space-y-3">
      <div
        ref={wrapRef}
        className="relative rounded-xl border bg-card overflow-hidden"
        style={{ height: frameHeight }}
      >
        {/* z-20 压在加载遮罩之上，加载中也能点 */}
        <div className="absolute right-2 top-2 z-20 flex items-center gap-1.5">
          <button
            type="button"
            onClick={openFullscreen}
            className="inline-flex items-center gap-1.5 rounded-md border bg-background/85 px-2.5 py-1.5 text-xs font-medium text-foreground shadow-sm backdrop-blur transition-colors hover:bg-background"
          >
            <Maximize2 className="h-3.5 w-3.5" aria-hidden />
            {L("Fullscreen")}
          </button>
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            title={L("Open in new window")}
            aria-label={L("Open in new window")}
            className="inline-flex items-center rounded-md border bg-background/85 p-1.5 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-background"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
        </div>
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-card">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm">{L("Loading tool...")}</p>
            </div>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={src}
          title={credit}
          onLoad={() => setLoaded(true)}
          className="h-full w-full border-0"
          style={{ background: "transparent" }}
        />
      </div>
      <p className="text-xs text-muted-foreground text-center">
        {L("Powered by the open-source project {credit} (MIT License). All processing happens locally in your browser.").replace("{credit}", credit)}
      </p>
    </div>
  );
}
