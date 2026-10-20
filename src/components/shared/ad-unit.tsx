"use client";

import { useEffect, useRef } from "react";

const AD_CLIENT = "ca-pub-7525547688409082";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * AdSense 广告位。
 *
 * AdSense 要求每个 `<ins class="adsbygoogle">` 渲染后必须显式 push 一次，
 * 否则即使审核通过也不会填充广告。
 * 这里把 ins + push 封装在一起，避免在静态导出的页面里漏掉 push。
 */
export default function AdUnit({ className = "" }: { className?: string }) {
  const insRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    const el = insRef.current;
    // 防御：同一元素重复 push 会触发 "All ins elements ... already been used"
    if (pushed.current || !el) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // 广告脚本被拦截或未加载时不阻塞页面
    }
  }, []);

  return (
    <ins
      ref={insRef}
      className={`adsbygoogle ${className}`.trim()}
      style={{ display: "block" }}
      data-ad-client={AD_CLIENT}
      data-ad-slot="auto"
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
