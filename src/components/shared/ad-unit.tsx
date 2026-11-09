"use client";

import { useEffect, useRef } from "react";
import { AD_CLIENT_ID, adSlot, type AdPlacement } from "@/lib/ads-config";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * AdSense 手动广告位。
 *
 * - slot 未配置（当前默认，见 src/lib/ads-config.ts）→ 直接返回 null，
 *   不再输出 data-ad-slot="auto" 这种无法关联任何广告单元的非法标签。
 * - 在配置里填入后台真实数字 ID 后，4 类页面自动恢复渲染，无需改页面代码。
 * - AdSense 要求每个 <ins> 渲染后显式 push 一次，否则不填充；这里封装在一起。
 * - 是否真正发起广告请求由 document.tsx 的引导脚本按「用户同意 + 当前路径允许」
 *   两道闸统一控制，本组件不重复判断同意状态，避免水合与脚本加载竞态。
 */
export default function AdUnit({
  placement,
  className = "",
}: {
  placement: AdPlacement;
  className?: string;
}) {
  const insRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);
  const slot = adSlot(placement);

  useEffect(() => {
    if (!slot) return;
    const el = insRef.current;
    // 防御：同一元素重复 push 会触发 "All ins elements ... already been used"
    if (pushed.current || !el) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // 广告脚本被拦截、或访客尚未同意因而脚本未加载时，不阻塞页面
    }
  }, [slot]);

  if (!slot) return null;

  return (
    <ins
      ref={insRef}
      className={`adsbygoogle ${className}`.trim()}
      style={{ display: "block" }}
      data-ad-client={AD_CLIENT_ID}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
