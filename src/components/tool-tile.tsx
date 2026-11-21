import type { ReactNode } from "react";
import I18nLink from "@/components/i18n-link";
import { I18nText } from "@/components/i18n-text";
import type { HomeTone } from "@/lib/file-catalog";

const TONE: Record<HomeTone, string> = {
  pdf: "bg-[var(--tone-pdf-bg)] text-[var(--tone-pdf)]",
  image: "bg-[var(--tone-image-bg)] text-[var(--tone-image)]",
  video: "bg-[var(--tone-video-bg)] text-[var(--tone-video)]",
};

export function ToneWell({ tone, children, round = false }: { tone: HomeTone; children: ReactNode; round?: boolean }) {
  return (
    <span className={`grid shrink-0 place-items-center ${round ? "h-7 w-7 rounded-full" : "h-10 w-10 rounded-xl"} ${TONE[tone]}`}>
      {children}
    </span>
  );
}

export default function ToolTile({
  href,
  hash,
  label,
  description,
  tone,
  icon,
  vars,
}: {
  href: string;
  hash?: string;
  label: string;
  description: string;
  tone: HomeTone;
  icon: ReactNode;
  vars?: Record<string, string>;
}) {
  return (
    <I18nLink
      href={href}
      hash={hash}
      className="tool-tile flex min-h-[116px] flex-col gap-2.5 rounded-[18px] border bg-card px-3.5 pb-3.5 pt-4 min-[900px]:min-h-32"
    >
      <ToneWell tone={tone}>{icon}</ToneWell>
      <span className="min-w-0">
        <span className="block text-sm font-semibold tracking-[-0.02em] text-foreground">
          <I18nText id={label} vars={vars} />
        </span>
        <span className="mt-[3px] block text-xs leading-[1.4] text-muted-foreground line-clamp-3">
          <I18nText id={description} />
        </span>
      </span>
    </I18nLink>
  );
}
