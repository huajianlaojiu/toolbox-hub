"use client";
import { useI18n, localizePath } from "@/lib/i18n";

/**
 * 语言感知链接：href 传英文规范路径，组件按当前语言加/换前缀。
 * 服务端页面（(public) 下的页被 [lang] 路由复用）用它来保证站内链接不跳出当前语言版本。
 */
export default function I18nLink({
  href,
  hash,
  className,
  children,
}: {
  href: string;
  /** 不加 #。PDF 工具包用它深链到具体操作，例如 hash="split"。 */
  hash?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { lang } = useI18n();
  const path = localizePath(href, lang);
  const to = hash ? `${path}#${hash.replace(/^#/, "")}` : path;
  return (
    <a href={to} className={className}>
      {children}
    </a>
  );
}
