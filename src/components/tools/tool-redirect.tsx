"use client";
import { useEffect } from "react";

// 收编中转页：旧的零散工具已并入统一工具箱，自动跳转并保留可见链接（避免 404，保留外链与索引权重）
export default function ToolRedirect({ target, targetTitle, lang }: { target: string; targetTitle: string; lang: string }) {
  const href = lang === "en" ? `/tools/${target}/` : `/${lang}/tools/${target}/`;
  useEffect(() => {
    window.location.replace(href);
  }, [href]);
  return (
    <div className="mt-6 rounded-xl border bg-card p-10 text-center space-y-4">
      <h2 className="text-xl font-semibold text-foreground">This tool has moved</h2>
      <p className="text-muted-foreground">
        This tool is now part of <span className="font-medium text-foreground">{targetTitle}</span> — a single toolbox that covers it and more.
      </p>
      <p>
        <a href={href} className="tool-btn tool-btn-primary inline-flex">
          Continue to {targetTitle} →
        </a>
      </p>
    </div>
  );
}
