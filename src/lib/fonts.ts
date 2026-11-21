import { Plus_Jakarta_Sans } from "next/font/google";

/**
 * 预览稿用的是 Plus Jakarta Sans。next/font 在构建时把字体下载下来并随静态导出一起发布，
 * 浏览器不会再去请求 Google，GitHub Pages 也能直接用。
 * 拉丁、拉丁扩展和越南语走这套字；中日韩、阿拉伯文等缺字时落到系统字体。
 */
export const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext", "vietnamese"],
  display: "swap",
  variable: "--font-jakarta",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});
