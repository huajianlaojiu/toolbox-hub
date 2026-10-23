"use client";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

/**
 * 嵌入第三方单文件工具（public/embed/*.html）。
 * 这些工具是 MIT 许可的独立静态页，用 iframe 隔离样式与脚本。
 */
export default function EmbedFrame({
  src,
  credit,
  height = "min(78vh, 820px)",
}: {
  src: string;
  credit: string;
  /** 全屏级应用（如视频剪辑器）传更高的值 */
  height?: string;
}) {
  const { L } = useI18n();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { setLoaded(false); }, [src]);

  return (
    <div className="space-y-3">
      <div className="relative rounded-xl border bg-card overflow-hidden" style={{ height }}>
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
