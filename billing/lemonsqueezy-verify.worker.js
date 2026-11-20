/**
 * Cloudflare Worker 示例。不要把真实密钥写进这个文件。
 *
 * 静态站不能安全地代持 Lemon Squeezy 的商店 API key。许可证校验接口本身不需要 API key，
 * 许可证字符串就是凭证。这个 Worker 只做三件事：
 *   1. 代为调用公开的 licenses/validate（避免浏览器跨域，并丢掉顾客邮箱）；
 *   2. 核对 store_id，以及可选的 product id，避免别的店的 key 打开 Pro；
 *   3. 只回 { active, expiresAt }。
 *
 * 部署时设置的变量（都在 Worker 的环境里，不进 Git）：
 *   LEMONSQUEEZY_STORE_ID      必填，数字商店 ID
 *   LEMONSQUEEZY_PRODUCT_IDS   可选，逗号分隔的 product id
 *   ALLOWED_ORIGIN             可选，默认 https://toolbox-hub.io
 *
 * 站点构建时把 Worker 的 HTTPS 地址写进 NEXT_PUBLIC_LICENSE_VERIFY_URL。
 * 不需要、也不要设置 LEMONSQUEEZY_API_KEY。
 */
const worker = {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return cors(env, new Response(null, { status: 204 }));
    const url = new URL(request.url);
    if (url.pathname !== "/verify" || request.method !== "POST") {
      return cors(env, json({ active: false, error: "not_found" }, 404));
    }
    if (!env.LEMONSQUEEZY_STORE_ID) {
      return cors(env, json({ active: false, error: "store_not_configured" }, 503));
    }

    let licenseKey = "";
    try {
      const body = await request.json();
      licenseKey = typeof body.licenseKey === "string" ? body.licenseKey.trim() : "";
    } catch {
      licenseKey = "";
    }
    if (licenseKey.length < 8 || licenseKey.length > 200) {
      return cors(env, json({ active: false, expiresAt: null }, 400));
    }

    let upstream;
    try {
      upstream = await fetch("https://api.lemonsqueezy.com/v1/licenses/validate", {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ license_key: licenseKey }),
      });
    } catch {
      return cors(env, json({ active: false, error: "upstream_unreachable" }, 502));
    }

    if (upstream.status === 429 || upstream.status >= 500) {
      return cors(env, json({ active: false, error: "upstream_unavailable" }, 503));
    }

    const data = await upstream.json().catch(() => null);
    const storeId = data && data.meta ? String(data.meta.store_id) : "";
    const productId = data && data.meta ? String(data.meta.product_id) : "";
    const status = data && data.license_key ? data.license_key.status : "";
    const allowedProducts = String(env.LEMONSQUEEZY_PRODUCT_IDS || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    const productOk = allowedProducts.length === 0 || allowedProducts.includes(productId);
    const active = !!(data && data.valid === true && status === "active" && storeId === String(env.LEMONSQUEEZY_STORE_ID) && productOk);
    const expiresAt = data && data.license_key ? data.license_key.expires_at || null : null;
    return cors(env, json({ active, expiresAt: active ? expiresAt : null }, active ? 200 : 403));
  },
};

export default worker;

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function cors(env, response) {
  const origin = env.ALLOWED_ORIGIN || "https://toolbox-hub.io";
  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Accept");
  response.headers.set("Vary", "Origin");
  return response;
}
