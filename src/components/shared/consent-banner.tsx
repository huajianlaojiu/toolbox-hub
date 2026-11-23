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
    "inline-flex min-h-11 items-center justify-center rounded-lg border px-2 py-2 text-center text-xs font-medium leading-tight text-foreground transition-colors hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground sm:px-4 sm:text-sm sm:leading-5";
  const primary =
    "inline-flex min-h-11 items-center justify-center rounded-lg bg-foreground px-2 py-2 text-center text-xs font-medium leading-tight text-background transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground sm:px-4 sm:text-sm sm:leading-5";
  const notice = t("Ad slots on this site are empty, and Google Analytics is off. Optional scripts still wait until you agree. You can change that from the footer.");

  return (
    <div
      role="region"
      aria-label={t("Cookie preferences")}
      className="fixed inset-x-0 bottom-0 z-[100] max-h-[85vh] overflow-y-auto border-t bg-card p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.14)] sm:p-4"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        {/* 手机上说明仍收成一行，避免同意条再次大过主标题变成 LCP。
            三个按钮并排且至少 44px，不再折成三行盖住工具操作区。
            全文仍在 DOM 里，桌面完整展示，点 Customize 也能读到。 */}
        <div className="min-w-0 text-xs leading-4 text-muted-foreground sm:max-w-2xl sm:text-sm sm:leading-6">
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-semibold text-foreground">{t("Your privacy choices")}</p>
            <a
              href={localizePath("/privacy/", lang)}
              className="shrink-0 text-foreground underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:hidden"
            >
              {t("Privacy Policy")}
            </a>
          </div>
          <p className="consent-summary mt-1 line-clamp-1 sm:line-clamp-none">{notice}</p>
          <a
            href={localizePath("/privacy/", lang)}
            className="mt-1 hidden text-foreground underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:inline-block"
          >
            {t("Privacy Policy")}
          </a>
        </div>
        <div className="grid shrink-0 grid-cols-3 gap-2 sm:flex sm:flex-wrap">
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
          <p className="text-sm leading-6 text-muted-foreground sm:col-span-2">
            {t("An AdSense account and ads.txt exist. The visible ad slots are empty, so agreeing does not place an ad unit. Google Analytics is not configured, so agreeing does not load a measurement tag. You can change this choice from the footer.")}{" "}
            <a href={localizePath("/privacy/", lang)} className="text-foreground underline underline-offset-4">
              {t("Privacy Policy")}
            </a>
          </p>
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
                {t("Allows the AdSense script after you agree. Ad slots are empty, so this does not place a visible ad. Off by default.")}
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
                {t("Google Analytics is not configured, so this choice does not load a measurement tag. Off by default.")}
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
