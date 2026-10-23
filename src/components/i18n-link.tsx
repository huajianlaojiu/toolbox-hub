"use client";
import { useI18n, localizePath } from "@/lib/i18n";

/**
 * 语言感知链接：href 传英文规范路径，组件按当前语言加/换前缀。
 * 服务端页面（(public) 下的页被 [lang] 路由复用）用它来保证站内链接不跳出当前语言版本。
 */
export default function I18nLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { lang } = useI18n();
  return (
    <a href={localizePath(href, lang)} className={className}>
      {children}
    </a>
  );
}
