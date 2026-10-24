"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ExternalLink, Maximize2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";

/**
 * 嵌入第三方单文件工具（public/embed/*.html）。
 * 这些工具是 MIT 许可的独立静态页，用 iframe 隔离样式与脚本。
 *
 * 注意：OpenReel 这类全屏级应用本是按完整浏览器视口设计的，塞进固定高度的
 * iframe 后，底部按钮会和「Skip on startup · Press Esc」之类提示文字挤在一起
 * 重叠（用户反馈的「下部文字折叠」）。iframe 再高也只是接近视口，治不了本——
 * 所以提供全屏入口：让 iframe 容器进入 Fullscreen，应用拿到完整视口重新布局，
 * 挤压消失且用户不离开页面；浏览器不支持时降级为新标签页打开。
 */
export default function EmbedFrame({
  src,
  credit,
  height = "min(78dvh, 820px)",
}: {
  src: string;
  credit: string;
  /** 全屏级应用（如视频剪辑器）传更高的值 */
  height?: string;
}) {
  const { L } = useI18n();
  const [loaded, setLoaded] = useState(false);
  const [isFs, setIsFs] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setLoaded(false); }, [src]);

  // 跟踪全屏状态——全屏时容器必须撑满，否则仍只有 78dvh 那一小块
  useEffect(() => {
    const onChange = () => setIsFs(document.fullscreenElement === wrapRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

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

  return (
    <div className="space-y-3">
      <div
        ref={wrapRef}
        className="relative rounded-xl border bg-card overflow-hidden"
        style={{ height: isFs ? "100dvh" : height }}
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
