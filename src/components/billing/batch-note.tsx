"use client";

import { localizePath, useI18n } from "@/lib/i18n";
import { purchaseAvailable, type BatchDecision } from "@/lib/billing";

/**
 * 撞到上限时跟在文件列表下面，不是弹窗。
 * 主按钮仍然执行免费额度内的那一部分。
 */
export function BatchNote({
  decision,
  noun,
  proLimit,
}: {
  decision: BatchDecision;
  noun: string;
  proLimit: number;
}) {
  const { lang } = useI18n();
  if (decision.status === "ok") return null;

  if (decision.status === "over-pro") {
    return (
      <p className="rounded-lg border bg-muted/40 p-3 text-sm leading-6 text-muted-foreground" role="status">
        This run uses the first {decision.take} {noun}. {proLimit} is the most this browser handles at once.
      </p>
    );
  }

  return (
    <div className="rounded-lg border bg-muted/40 p-4 text-sm leading-6" role="status">
      <p>
        Free includes {decision.limit} {noun} at a time. You selected {decision.selected}. The button below runs the
        first {decision.take}. Pro raises that to {proLimit}.
      </p>
      <p className="mt-3">
        <a href={localizePath("/pricing/", lang)} className="font-medium text-foreground underline underline-offset-4">
          {purchaseAvailable() ? "See Pro" : "See the plans"}
        </a>
        <span className="text-muted-foreground"> — optional. The free run stays on this page.</span>
      </p>
    </div>
  );
}
