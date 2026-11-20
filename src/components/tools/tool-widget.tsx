"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

/**
 * 每个工具单独动态导入。
 * 以前 tool-page-body 静态 import 全部工具，任意一个工具页都会下载
 * 含 ffmpeg worker、pdf-lib、jszip、qrcode 的同一个大包。
 * next/dynamic 必须放在客户端组件里，服务端组件的 dynamic() 不会拆包。
 */
function lazyTool(loader: () => Promise<{ default: ComponentType }>) {
  return dynamic(loader, {
    loading: () => (
      <div className="flex min-h-40 items-center text-sm text-muted-foreground" role="status">
        Loading…
      </div>
    ),
  });
}

const TOOLS: Record<string, ComponentType> = {
  "age-calculator": lazyTool(() => import("./age-calculator")),
  "archive-tool": lazyTool(() => import("./archive-tool")),
  "area-converter": lazyTool(() => import("./area-converter")),
  "audio-converter": lazyTool(() => import("./audio-converter")),
  "audio-trimmer": lazyTool(() => import("./audio-trimmer")),
  "base64-encoder": lazyTool(() => import("./base64-encoder")),
  "binary-text": lazyTool(() => import("./binary-text")),
  "bmi-calculator": lazyTool(() => import("./bmi-calculator")),
  "border-radius-generator": lazyTool(() => import("./border-radius-generator")),
  "box-shadow-generator": lazyTool(() => import("./box-shadow-generator")),
  "caesar-cipher": lazyTool(() => import("./caesar-cipher")),
  "color-converter": lazyTool(() => import("./color-converter")),
  "compress-pdf": lazyTool(() => import("./compress-pdf")),
  "color-palette": lazyTool(() => import("./color-palette")),
  "contrast-checker": lazyTool(() => import("./contrast-checker")),
  "data-converter": lazyTool(() => import("./data-converter")),
  "date-difference": lazyTool(() => import("./date-difference")),
  "days-until": lazyTool(() => import("./days-until")),
  "decimal-fraction": lazyTool(() => import("./decimal-fraction")),
  "dice-roller": lazyTool(() => import("./dice-roller")),
  "discount-calculator": lazyTool(() => import("./discount-calculator")),
  "duplicate-line-remover": lazyTool(() => import("./duplicate-line-remover")),
  "email-validator": lazyTool(() => import("./email-validator")),
  "emoji-picker": lazyTool(() => import("./emoji-picker")),
  "excel-converter": lazyTool(() => import("./excel-converter")),
  "factorial-calculator": lazyTool(() => import("./factorial-calculator")),
  "favicon-generator": lazyTool(() => import("./favicon-generator")),
  "file-size-converter": lazyTool(() => import("./file-size-converter")),
  "gcf-calculator": lazyTool(() => import("./gcf-calculator")),
  "gitignore-generator": lazyTool(() => import("./gitignore-generator")),
  "gradient-generator": lazyTool(() => import("./gradient-generator")),
  "hex-text": lazyTool(() => import("./hex-text")),
  "html-entity-encoder": lazyTool(() => import("./html-entity-encoder")),
  "html-preview": lazyTool(() => import("./html-preview")),
  "image-format-converter": lazyTool(() => import("./image-format-converter")),
  "image-to-base64": lazyTool(() => import("./image-to-base64")),
  "image-to-text": lazyTool(() => import("./image-to-text")),
  "length-converter": lazyTool(() => import("./length-converter")),
  "letter-counter": lazyTool(() => import("./letter-counter")),
  "line-number-adder": lazyTool(() => import("./line-number-adder")),
  "list-randomizer": lazyTool(() => import("./list-randomizer")),
  "list-sorter": lazyTool(() => import("./list-sorter")),
  "loan-calculator": lazyTool(() => import("./loan-calculator")),
  "markdown-preview": lazyTool(() => import("./markdown-preview")),
  "md5-generator": lazyTool(() => import("./md5-generator")),
  "mermaid-diagram": lazyTool(() => import("./mermaid-diagram")),
  "meta-tag-generator": lazyTool(() => import("./meta-tag-generator")),
  "morse-code": lazyTool(() => import("./morse-code")),
  "number-base-converter": lazyTool(() => import("./number-base-converter")),
  "open-graph-generator": lazyTool(() => import("./open-graph-generator")),
  "organize-pdf": lazyTool(() => import("./organize-pdf")),
  "password-generator": lazyTool(() => import("./password-generator")),
  "password-strength": lazyTool(() => import("./password-strength")),
  "pdf-page-numbers": lazyTool(() => import("./pdf-page-numbers")),
  "pdf-toolkit": lazyTool(() => import("./pdf-toolkit")),
  "protect-pdf": lazyTool(() => import("./protect-pdf")),
  "phone-formatter": lazyTool(() => import("./phone-formatter")),
  "pomodoro-timer": lazyTool(() => import("./pomodoro-timer")),
  "prime-checker": lazyTool(() => import("./prime-checker")),
  "qr-code-generator": lazyTool(() => import("./qr-code-generator")),
  "random-number": lazyTool(() => import("./random-number")),
  "random-string": lazyTool(() => import("./random-string")),
  "regex-tester": lazyTool(() => import("./regex-tester")),
  "roman-numerals": lazyTool(() => import("./roman-numerals")),
  "rotate-pdf": lazyTool(() => import("./rotate-pdf")),
  "rot13-encoder": lazyTool(() => import("./rot13-encoder")),
  "scientific-notation": lazyTool(() => import("./scientific-notation")),
  "speed-converter": lazyTool(() => import("./speed-converter")),
  "stopwatch": lazyTool(() => import("./stopwatch")),
  "subtitle-editor": lazyTool(() => import("./subtitle-editor")),
  "teleprompter": lazyTool(() => import("./teleprompter")),
  "temperature-converter": lazyTool(() => import("./temperature-converter")),
  "text-case-converter": lazyTool(() => import("./text-case-converter")),
  "text-repeater": lazyTool(() => import("./text-repeater")),
  "text-shadow-generator": lazyTool(() => import("./text-shadow-generator")),
  "text-to-slug": lazyTool(() => import("./text-to-slug")),
  "text-trimmer": lazyTool(() => import("./text-trimmer")),
  "time-converter": lazyTool(() => import("./time-converter")),
  "timestamp-converter": lazyTool(() => import("./timestamp-converter")),
  "tip-calculator": lazyTool(() => import("./tip-calculator")),
  "unicode-converter": lazyTool(() => import("./unicode-converter")),
  "url-encoder": lazyTool(() => import("./url-encoder")),
  "url-extractor": lazyTool(() => import("./url-extractor")),
  "url-parser": lazyTool(() => import("./url-parser")),
  "uuid-generator": lazyTool(() => import("./uuid-generator")),
  "video-compressor": lazyTool(() => import("./video-compressor")),
  "video-converter": lazyTool(() => import("./video-converter")),
  "video-frame-capture": lazyTool(() => import("./video-frame-capture")),
  "video-merger": lazyTool(() => import("./video-merger")),
  "video-speed-changer": lazyTool(() => import("./video-speed-changer")),
  "video-to-audio": lazyTool(() => import("./video-to-audio")),
  "video-to-gif": lazyTool(() => import("./video-to-gif")),
  "video-transformer": lazyTool(() => import("./video-transformer")),
  "video-trimmer": lazyTool(() => import("./video-trimmer")),
  "volume-converter": lazyTool(() => import("./volume-converter")),
  "watermark-pdf": lazyTool(() => import("./watermark-pdf")),
  "weight-converter": lazyTool(() => import("./weight-converter")),
  "word-counter": lazyTool(() => import("./word-counter")),
  "world-clock": lazyTool(() => import("./world-clock")),
  "youtube-thumbnail": lazyTool(() => import("./youtube-thumbnail")),
};

const EmbedFrame = dynamic(() => import("./embed-frame"), {
  loading: () => (
    <div className="flex min-h-40 items-center text-sm text-muted-foreground" role="status">
      Loading…
    </div>
  ),
});

const EMBEDS: Record<string, { src: string; credit: string; auto?: boolean; height?: string }> = {
  "pilko-frame-studio": {
    src: "/embed/pilko-frame-studio.html",
    credit: "Pilko Frame Capture Studio",
    auto: false,
    height: "100dvh",
  },
  "viral-video-studio": {
    src: "/embed/viral-video-studio.html",
    credit: "Viral Video Studio",
    height: "min(90dvh, 1200px)",
  },
  "openreel-video-editor": {
    src: "/embed/openreel/index.html",
    credit: "OpenReel Video",
    auto: false,
    height: "100dvh",
  },
};

export default function ToolWidget({ slug }: { slug: string }) {
  const embed = EMBEDS[slug];
  if (embed) return <EmbedFrame {...embed} />;
  const Tool = TOOLS[slug];
  if (!Tool) return null;
  return <Tool />;
}
