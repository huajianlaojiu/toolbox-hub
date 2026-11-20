/**
 * Pro 方案的纯配置与判断。
 * 不含密钥、不在模块加载时读 localStorage，服务端页面和测试都可以直接 import。
 * 结账链接和许可证校验地址在构建时从 NEXT_PUBLIC_* 注入；留空表示尚未接通，页面不得发起扣款。
 */

export const PRO_STORAGE_KEY = "tbh-pro-v1";
export const JOB_HISTORY_KEY = "tbh-jobs-v1";

export const PRO_MONTHLY_USD = 6;
export const PRO_YEARLY_USD = 48;

/** 免费档一次可处理的文件数。1–3 个文件仍走免费路径。 */
export const FREE_FILE_BATCH = 3;
/** PDF 合并、图片转 PDF、压缩包。浏览器内存的实际上限，不是无限。 */
export const PRO_FILE_BATCH = 50;
/** 视频合并沿用工具里已有的上限。 */
export const PRO_VIDEO_MERGE_BATCH = 10;
/** 默认抽帧是 6，低于此值，所以常见的单次抽帧不会撞上限。 */
export const FREE_FRAME_BATCH = 8;
export const PRO_FRAME_BATCH = 30;

export const PRO_CHECKOUT_MONTHLY_URL = process.env.NEXT_PUBLIC_PRO_CHECKOUT_MONTHLY_URL ?? "";
export const PRO_CHECKOUT_YEARLY_URL = process.env.NEXT_PUBLIC_PRO_CHECKOUT_YEARLY_URL ?? "";
export const LICENSE_VERIFY_URL = process.env.NEXT_PUBLIC_LICENSE_VERIFY_URL ?? "";

/** 定价页打开时，若上次校验早于这个间隔，再问一次校验端点。 */
export const ENTITLEMENT_REFRESH_MS = 7 * 24 * 60 * 60 * 1000;

export type BatchDecision = {
  status: "ok" | "over-free" | "over-pro";
  take: number;
  selected: number;
  limit: number;
};

export function isHttpsUrl(value: string | undefined | null): value is string {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

export function checkoutUrl(kind: "monthly" | "yearly"): string | null {
  const raw = kind === "monthly" ? PRO_CHECKOUT_MONTHLY_URL : PRO_CHECKOUT_YEARLY_URL;
  return isHttpsUrl(raw) ? raw : null;
}

/**
 * 选出本次真正处理的数量。
 * 超过免费上限时 take 仍是免费额度，调用方用它继续跑，而不是停掉整个工具。
 */
export function decideBatch(count: number, isPro: boolean, freeLimit: number, proLimit: number): BatchDecision {
  const selected = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  const limit = isPro ? proLimit : freeLimit;
  if (selected <= limit) return { status: "ok", take: selected, selected, limit };
  if (!isPro) return { status: "over-free", take: freeLimit, selected, limit: freeLimit };
  return { status: "over-pro", take: proLimit, selected, limit: proLimit };
}

export function entitlementActive(value: unknown, now = Date.now()): boolean {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  if (record.plan !== "pro") return false;
  if (record.expiresAt == null) return true;
  if (typeof record.expiresAt !== "string") return false;
  const expires = Date.parse(record.expiresAt);
  return Number.isFinite(expires) && expires > now;
}

/** 校验端点只应返回这几个字段。拒绝带上顾客邮箱的原始 Lemon 响应。 */
export function parseVerifyResponse(body: unknown): { active: boolean; expiresAt: string | null } | null {
  if (!body || typeof body !== "object") return null;
  const record = body as Record<string, unknown>;
  if (typeof record.active !== "boolean") return null;
  if (record.expiresAt == null) return { active: record.active, expiresAt: null };
  if (typeof record.expiresAt !== "string" || !Number.isFinite(Date.parse(record.expiresAt))) return null;
  return { active: record.active, expiresAt: record.expiresAt };
}
