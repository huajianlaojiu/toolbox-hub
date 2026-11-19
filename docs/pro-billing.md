# Toolbox Hub Pro 结账接通说明

站点是 GitHub Pages 上的 Next.js 静态导出，没有自己的长驻服务器，仓库里也不能放支付密钥。当前页面上的结账按钮在环境变量留空时不会跳到任何支付页，激活表单也不会因为粘贴一段文字就打开 Pro。

## 方案

- 免费：$0。现有工具的单次任务保持可用。PDF 合并、图片合成 PDF、ZIP/TAR、视频合并一次最多 3 个文件。视频抽帧一次最多 8 帧。本机浏览器里可以查看最近 20 条作业摘要。
- Pro：$6/月，或 $48/年（折合 $4/月）。PDF、图片、压缩包一次最多 50 个文件；视频合并最多 10 个（工具原本的上限）；抽帧最多 30 张；可下载作业列表 JSON；本机浏览器不再加载广告脚本。
- 优先邮件支持标为 coming next，现在没有专人队列。
- 两边都不包含：云端存储、账号、服务器端处理、API、团队席位。

价格对照（2026 年 11 月公开标价，Toolbox Hub 的处理发生在浏览器里，没有对方的服务器转换、电子签名或 AI 额度，所以标在它们的月付之下）：

- iLovePDF Premium：官网约 $9/月，或年付 $60（$5/月）。
- Smallpdf Pro：第三方对照约 $15/月，或年付 $120（$10/月）。
- TinyWow Premium：约 $20/月，或年付折合 $15/月。

## 服务商

用 Lemon Squeezy 作为 merchant of record。它提供托管结账页（静态站只需要一条 https 链接），并处理海外消费税。不要把 Lemon 的 API key 放进仓库、GitHub Actions 或 `NEXT_PUBLIC_*`。

许可证校验用的是 Lemon 的公开 License API（`POST /v1/licenses/validate`），凭证是用户自己的 license key，不是商店 API key。浏览器直接调用会受跨域限制，也会收到顾客邮箱。仓库里的 `billing/lemonsqueezy-verify.worker.js` 是一个 Cloudflare Worker 示例：代为校验、核对 `store_id`、丢掉邮箱，只返回 `{ active, expiresAt }`。

## 要设置的变量

构建静态站时（本地或 GitHub Actions）注入，均为公开链接，不是密钥：

| 变量 | 填什么 |
| --- | --- |
| `NEXT_PUBLIC_PRO_CHECKOUT_MONTHLY_URL` | Lemon 月付结账链接，必须是 `https://` |
| `NEXT_PUBLIC_PRO_CHECKOUT_YEARLY_URL` | Lemon 年付结账链接，必须是 `https://` |
| `NEXT_PUBLIC_LICENSE_VERIFY_URL` | Worker 的 `https://<worker>/verify` |

Worker 自己的环境变量（不进 Git）：

| 变量 | 填什么 |
| --- | --- |
| `LEMONSQUEEZY_STORE_ID` | 商店数字 ID，必填。不填则 Worker 拒绝所有 key |
| `LEMONSQUEEZY_PRODUCT_IDS` | 可选，逗号分隔的 product id。填写后，别的商品的 key 会被拒绝 |
| `ALLOWED_ORIGIN` | 可选，默认 `https://toolbox-hub.io` |

`.github/workflows/deploy.yml` 已经会在构建时读取同名 Actions secrets。秘密留空时，页面保持「未接通」状态，不会扣款。

## 接通顺序

1. 在 Lemon Squeezy 建一个商品、两个变体：Monthly $6 USD，Yearly $48 USD。打开 license keys。
2. 商品的成功回跳地址设为 `https://toolbox-hub.io/pricing/success/`（站点使用尾部斜杠）。
3. 把两个结账链接分别放进上面的两个 `NEXT_PUBLIC_PRO_CHECKOUT_*` 变量。
4. 部署 `billing/lemonsqueezy-verify.worker.js`，设好 `LEMONSQUEEZY_STORE_ID`。
5. 把 Worker 的 `/verify` 地址放进 `NEXT_PUBLIC_LICENSE_VERIFY_URL`。
6. 重新构建并发布静态站。发布后，定价页的按钮才会指向 Lemon。付款仍在 Lemon 的页面完成。
7. 用户从收据邮件复制 license key，在 `/pricing/#activate` 粘贴。Worker 确认 `valid === true`、`status === "active"` 且 `store_id` 匹配后，浏览器把 Pro 标记写进 `localStorage` 键 `tbh-pro-v1`。

取消和改卡在 Lemon 的收据邮件里完成。静态站收不到 webhook。定价页会在上次校验超过 7 天时再问一次 Worker；Worker 说 key 已失效就清掉本机标记。一直不打开定价页的浏览器会保留标记直到 `expiresAt`。这不是 DRM：访客可以改自己浏览器里的标记，只影响他自己的广告和批量上限，文件从不会上传。

成功页 `/pricing/success/` 不扣款，也不因为打开它就打开 Pro。
