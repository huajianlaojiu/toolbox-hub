"use client";

import { useCallback, useEffect, useState } from "react";
import { useI18n, localizePath } from "@/lib/i18n";
import { CONSENT_STORAGE_KEY } from "@/lib/ads-config";

/**
 * 第一方同意管理（CMP）横幅，零依赖、零后端，兼容 output:"export"。
 *
 * 数据契约（与 src/components/document.tsx 的引导脚本严格一致）：
 *   localStorage[CONSENT_STORAGE_KEY] = { v: 2, ad: boolean, an: boolean, ts: number }
 *   保存后派发 window 事件 "tb-consent-change"，引导脚本据此做
 *   Google Consent Mode v2 的 consent update 并按需加载 adsbygoogle.js。
 *   Footer 的「Cookie settings」派发 "tb-consent-open" 重新打开本面板。
 *
 * 未作选择之前：引导脚本的 default 是 denied，全站不会发起广告请求。
 * 注意：面向 EEA/UK/CH 投放个性化广告，Google 要求使用其认证的 CMP（IAB TCF v2.2）；
 * 本组件解决的是「未获同意即加载广告」这个硬伤，认证 CMP 接入见交付简报的遗留项。
 */
interface ConsentState {
  v: 2;
  ad: boolean;
  an: boolean;
  ts: number;
}

const OPEN_EVENT = "tb-consent-open";
const CHANGE_EVENT = "tb-consent-change";

function readConsent(): ConsentState | null {
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw);
    return v && v.v === 2 && typeof v.ad === "boolean" ? (v as ConsentState) : null;
  } catch {
    return null;
  }
}

export default function ConsentBanner() {
  // 所有文案走 t()：字典缺 key 时回退英文，后续跑翻译脚本可自动补齐 15 语言
  const { t, lang } = useI18n();
  const [visible, setVisible] = useState(false); // SSR 恒 false，避免水合不一致
  const [customize, setCustomize] = useState(false);
  const [ads, setAds] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    const current = readConsent();
    if (current) {
      setAds(current.ad);
      setAnalytics(!!current.an);
    } else {
      setVisible(true);
    }
    const reopen = () => {
      const c = readConsent();
      if (c) {
        setAds(c.ad);
        setAnalytics(!!c.an);
      }
      setCustomize(true);
      setVisible(true);
    };
    window.addEventListener(OPEN_EVENT, reopen);
    return () => window.removeEventListener(OPEN_EVENT, reopen);
  }, []);

  const save = useCallback((ad: boolean, an: boolean) => {
    const next: ConsentState = { v: 2, ad, an, ts: Date.now() };
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // 隐私模式下 localStorage 不可用：本次会话仍按「未同意」处理，不加载广告
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
    setVisible(false);
    setCustomize(false);
  }, []);

  if (!visible) return null;

  const secondary =
    "rounded-lg border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";
  const primary =
    "rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

  return (
    <div
      role="region"
      aria-label={t("Cookie preferences")}
      className="fixed inset-x-0 bottom-0 z-[100] border-t bg-card p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.14)]"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl text-sm leading-6 text-muted-foreground">
          <p className="font-semibold text-foreground">{t("Your privacy choices")}</p>
          <p className="mt-1">
            {t("We use Google AdSense to fund this site. Advertising cookies are only set after you agree. You can change your choice at any time from the footer.")}{" "}
            <a
              href={localizePath("/privacy/", lang)}
              className="text-foreground underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {t("Privacy Policy")}
            </a>
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button type="button" className={secondary} onClick={() => save(false, false)}>
            {t("Reject non-essential")}
          </button>
          <button type="button" className={secondary} onClick={() => setCustomize((v) => !v)} aria-expanded={customize}>
            {t("Customize")}
          </button>
          <button type="button" className={primary} onClick={() => save(true, true)}>
            {t("Accept all")}
          </button>
        </div>
      </div>

      {customize && (
        <div className="mx-auto mt-4 grid max-w-6xl gap-3 border-t pt-4 sm:grid-cols-2">
          <label htmlFor="tb-consent-ads" className="flex cursor-pointer items-start gap-3 text-sm text-foreground">
            <input
              id="tb-consent-ads"
              type="checkbox"
              checked={ads}
              onChange={(e) => setAds(e.target.checked)}
              className="mt-1 h-4 w-4 shrink-0 accent-foreground"
            />
            <span>
              <span className="font-medium">{t("Advertising cookies")}</span>
              <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                {t("Allows Google AdSense to show ads, including personalised ads. Off by default.")}
              </span>
            </span>
          </label>
          <label htmlFor="tb-consent-analytics" className="flex cursor-pointer items-start gap-3 text-sm text-foreground">
            <input
              id="tb-consent-analytics"
              type="checkbox"
              checked={analytics}
              onChange={(e) => setAnalytics(e.target.checked)}
              className="mt-1 h-4 w-4 shrink-0 accent-foreground"
            />
            <span>
              <span className="font-medium">{t("Analytics cookies")}</span>
              <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                {t("Reserved for future traffic measurement. No analytics provider is currently installed.")}
              </span>
            </span>
          </label>
          <div className="sm:col-span-2">
            <button type="button" className={primary} onClick={() => save(ads, analytics)}>
              {t("Save preferences")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
