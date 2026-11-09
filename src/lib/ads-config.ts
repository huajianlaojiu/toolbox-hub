/**
 * 广告与同意管理的单一配置源（Server / Client 均可安全 import，无副作用、无密钥）。
 *
 * 背景：此前 `ad-unit.tsx` 把 data-ad-slot 写死为 "auto"，这不是合法广告单元 ID，
 * 手动广告位永远不会填充。这里把 slot 收拢成配置：
 *   - 留空（当前状态）= 不渲染任何 <ins>，等 AdSense 过审后开 Auto ads；
 *   - 填入后台真实数字 ID = 4 类页面广告位自动恢复，无需改任何页面代码。
 *
 * 脚本是否真正发起请求，由 document.tsx 里的引导脚本按「用户同意 + 当前路径允许广告」
 * 两道闸决定；本文件只提供配置与排除规则。
 */
import { tools } from "@/lib/tools-data";
import { LOCALES } from "@/lib/locales";

export const AD_CLIENT_ID = "ca-pub-7525547688409082";
export const AD_SCRIPT_URL = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CLIENT_ID}`;

/**
 * 真实广告单元 ID：AdSense 后台 → 广告 → 按广告单元 → 新建，复制 data-ad-slot 的纯数字。
 * 必须是数字字符串；留空表示「该位置暂不投放手动广告」。
 */
export const AD_SLOTS: Record<"home" | "directory" | "tool" | "post", string> = {
  home: "",
  directory: "",
  tool: "",
  post: "",
};

export type AdPlacement = keyof typeof AD_SLOTS;

/** 手动广告位是否已配置（4 个位置任一填了合法 ID 即为 true） */
export const MANUAL_ADS_ENABLED = Object.values(AD_SLOTS).some((s) => /^\d{6,}$/.test(s));

export function adSlot(placement: AdPlacement): string {
  return /^\d{6,}$/.test(AD_SLOTS[placement]) ? AD_SLOTS[placement] : "";
}

/**
 * 是否允许加载 adsbygoogle.js。默认 true：保留脚本供 AdSense 审核抓取，
 * 且过审后开启 Auto ads 时无需改代码。真正是否请求仍受同意闸与路径闸控制。
 * 若账号彻底停用广告，把它改成 false 即可全站零广告请求。
 */
export const ADS_SCRIPT_ENABLED = true;

/**
 * 审核期应急开关：true 时无条件静态输出 adsbygoogle.js 标签（绕过同意闸与路径闸）。
 * 仅用于 AdSense 后台提示「找不到广告代码」时临时排查；正式投放务必保持 false，
 * 否则会重新变成「未获同意即加载广告 + 信任页也有广告」的违规状态。
 */
export const ADS_REVIEW_STATIC_SCRIPT = false;

/** 同意状态存储 key（CMP 写入，document.tsx 引导脚本读取） */
export const CONSENT_STORAGE_KEY = "tb-consent-v2";

/** 禁止投放广告的信任页（已剥离 /<lang> 前缀后的路径） */
export const AD_EXCLUDED_PATHS = [
  "/about/",
  "/contact/",
  "/privacy/",
  "/terms/",
  "/disclaimer/",
  "/404/",
  "/404.html/",
];

/** noindex 中转工具页：从 tools-data 单一数据源取，以后新增 redirect 工具自动纳入 */
export const AD_EXCLUDED_TOOL_SLUGS = tools.filter((t) => t.redirect).map((t) => t.slug);

/** 非英文语言前缀（供引导脚本剥离 pathname 里的 /<lang>） */
export const AD_LANG_PREFIXES = LOCALES.filter((l) => l.code !== "en").map((l) => l.code);
