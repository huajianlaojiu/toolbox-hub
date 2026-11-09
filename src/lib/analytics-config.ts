/**
 * GA4（Google Analytics 4）单一配置源。
 *
 * 拿到衡量 ID 后有两种填法，任选其一，无需改任何组件：
 *   1. 直接填下面 CONFIGURED_ID（例："G-ABCD123456"），提交即可全站生效；
 *   2. 在 CI 里配 NEXT_PUBLIC_GA_MEASUREMENT_ID 环境变量（会覆盖常量），
 *      适合不想把 ID 写进公开仓库的情况。
 *
 * 获取路径：GA4 后台 → 管理 → 数据流 → 对应的 Web 数据流 → 复制「衡量 ID」。
 * ID 以 G- 开头，不是旧的 UA- 属性，也不是 GTM 的 GTM- 容器 ID。
 *
 * 留空（当前默认）= 完全不加载 gtag.js、不发任何统计请求。
 * 绝不填一个猜测的 ID：那会把本站流量错误地记到别人的媒体资源里。
 *
 * 加载时机由 document.tsx 的同意引导脚本控制：只有用户在 CMP 里允许
 * 「Analytics cookies」后才会注入脚本；撤回同意后由 Consent Mode v2
 * 的 consent update 阻止后续统计 cookie 与完整事件。
 */

const CONFIGURED_ID = "";

export const GA_MEASUREMENT_ID = (
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || CONFIGURED_ID
).trim();

/** 只接受形如 G-XXXXXXXXXX 的 GA4 衡量 ID，防止误填 UA- / GTM- / 乱码 */
export const GA_ENABLED = /^G-[A-Z0-9]{6,}$/.test(GA_MEASUREMENT_ID);

/**
 * 是否在工具详情页自动发一个 tool_view 事件（带 tool_slug / page_language）。
 * 零侵入：在引导脚本里按 pathname 判断，不必改 100+ 工具组件，
 * 用于在 GA4 里看到「哪个工具真的有人用」，而不只是总 PV。
 * 同样只在用户同意统计、且 GA4 已配置时才会发送。
 */
export const GA_TRACK_TOOL_VIEWS = true;
