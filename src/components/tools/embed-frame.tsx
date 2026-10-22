"use client";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

/**
 * 嵌入第三方单文件工具（public/embed/*.html）。
 * 这些工具是 MIT 许可的独立静态页，用 iframe 隔离样式与脚本。
 */
export default function EmbedFrame({ src, credit }: { src: string; credit: string }) {
  const { lang } = useI18n();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { setLoaded(false); }, [src]);

  return (
    <div className="space-y-3">
      <div className="relative rounded-xl border bg-card overflow-hidden" style={{ height: "min(78vh, 820px)" }}>
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-card">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm">{lang === "zh" ? "正在加载工具..." : "Loading tool..."}</p>
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
        {lang === "zh"
          ? `本工具基于开源项目 ${credit}（MIT 许可）构建，所有处理均在浏览器本地完成。`
          : `Powered by the open-source project ${credit} (MIT License). All processing happens locally in your browser.`}
      </p>
    </div>
  );
}
