"use client";

import type { ReactNode } from "react";
import { localizePath, useI18n } from "@/lib/i18n";

/** localizePath 会把 hash 收进路径段，所以带锚点的定价链接单独处理。 */
export default function HashLink({
  path,
  hash,
  className,
  children,
}: {
  path: string;
  hash: string;
  className?: string;
  children: ReactNode;
}) {
  const { lang } = useI18n();
  return (
    <a href={`${localizePath(path, lang)}#${hash}`} className={className}>
      {children}
    </a>
  );
}
