import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTool, tools } from "@/lib/tools-data";
import { LOCALES } from "@/lib/locales";
import { getMeta, getContent } from "@/i18n/content";
import ToolPageContent from "@/components/tool-page-content";

import AdUnit from "@/components/shared/ad-unit";
import PasswordStrength from "@/components/tools/password-strength";
import HtmlPreview from "@/components/tools/html-preview";
import JsonValidator from "@/components/tools/json-validator";
import ImageResizer from "@/components/tools/image-resizer";
import UnicodeConverter from "@/components/tools/unicode-converter";
import UrlExtractor from "@/components/tools/url-extractor";
import PhoneFormatter from "@/components/tools/phone-formatter";
import JsonFormatter from "@/components/tools/json-formatter";
import Base64Encoder from "@/components/tools/base64-encoder";
import UrlEncoder from "@/components/tools/url-encoder";
import QrCodeGenerator from "@/components/tools/qr-code-generator";
import UuidGenerator from "@/components/tools/uuid-generator";
import PasswordGenerator from "@/components/tools/password-generator";
import TimestampConverter from "@/components/tools/timestamp-converter";
import Md5Generator from "@/components/tools/md5-generator";
import WordCounter from "@/components/tools/word-counter";
import ColorConverter from "@/components/tools/color-converter";
import TextToSlug from "@/components/tools/text-to-slug";
import HtmlEntityEncoder from "@/components/tools/html-entity-encoder";
import FileSizeConverter from "@/components/tools/file-size-converter";
import MarkdownPreview from "@/components/tools/markdown-preview";
import ImageCompressor from "@/components/tools/image-compressor";
import JsonToYaml from "@/components/tools/json-to-yaml";
import JsonToCsv from "@/components/tools/json-to-csv";
import XmlFormatter from "@/components/tools/xml-formatter";
import NumberBaseConverter from "@/components/tools/number-base-converter";
import RegexTester from "@/components/tools/regex-tester";
import TextCaseConverter from "@/components/tools/text-case-converter";
import DuplicateLineRemover from "@/components/tools/duplicate-line-remover";
import LineNumberAdder from "@/components/tools/line-number-adder";
import RandomString from "@/components/tools/random-string";
import ListRandomizer from "@/components/tools/list-randomizer";
import TextTrimmer from "@/components/tools/text-trimmer";
import LetterCounter from "@/components/tools/letter-counter";
import MorseCode from "@/components/tools/morse-code";
import TextRepeater from "@/components/tools/text-repeater";
import ListSorter from "@/components/tools/list-sorter";
import LengthConverter from "@/components/tools/length-converter";
import WeightConverter from "@/components/tools/weight-converter";
import TemperatureConverter from "@/components/tools/temperature-converter";
import SpeedConverter from "@/components/tools/speed-converter";
import AreaConverter from "@/components/tools/area-converter";
import VolumeConverter from "@/components/tools/volume-converter";
import TimeConverter from "@/components/tools/time-converter";
import DiscountCalculator from "@/components/tools/discount-calculator";
import TipCalculator from "@/components/tools/tip-calculator";
import AgeCalculator from "@/components/tools/age-calculator";
import DateDifference from "@/components/tools/date-difference";
import DaysUntil from "@/components/tools/days-until";
import BmiCalculator from "@/components/tools/bmi-calculator";
import RandomNumber from "@/components/tools/random-number";
import DiceRoller from "@/components/tools/dice-roller";
import LoanCalculator from "@/components/tools/loan-calculator";
import GradientGenerator from "@/components/tools/gradient-generator";
import BoxShadowGenerator from "@/components/tools/box-shadow-generator";
import BorderRadiusGenerator from "@/components/tools/border-radius-generator";
import ColorPalette from "@/components/tools/color-palette";
import EmojiPicker from "@/components/tools/emoji-picker";
import TextShadowGenerator from "@/components/tools/text-shadow-generator";
import ContrastChecker from "@/components/tools/contrast-checker";
import FaviconGenerator from "@/components/tools/favicon-generator";
import EmailValidator from "@/components/tools/email-validator";
import UrlParser from "@/components/tools/url-parser";
import MetaTagGenerator from "@/components/tools/meta-tag-generator";
import YoutubeThumbnail from "@/components/tools/youtube-thumbnail";
import OpenGraphGenerator from "@/components/tools/open-graph-generator";
import Stopwatch from "@/components/tools/stopwatch";
import WorldClock from "@/components/tools/world-clock";
import CaesarCipher from "@/components/tools/caesar-cipher";
import Rot13Encoder from "@/components/tools/rot13-encoder";
import BinaryText from "@/components/tools/binary-text";
import HexText from "@/components/tools/hex-text";
import PomodoroTimer from "@/components/tools/pomodoro-timer";
import RomanNumerals from "@/components/tools/roman-numerals";
import PrimeChecker from "@/components/tools/prime-checker";
import FactorialCalculator from "@/components/tools/factorial-calculator";
import ScientificNotation from "@/components/tools/scientific-notation";
import DecimalFraction from "@/components/tools/decimal-fraction";
import GcfCalculator from "@/components/tools/gcf-calculator";
import ImageToBase64 from "@/components/tools/image-to-base64";
import VideoCompressor from "@/components/tools/video-compressor";
import VideoConverter from "@/components/tools/video-converter";
import VideoMerger from "@/components/tools/video-merger";
import VideoSpeedChanger from "@/components/tools/video-speed-changer";
import VideoTransformer from "@/components/tools/video-transformer";
import VideoTrimmer from "@/components/tools/video-trimmer";
import VideoToGif from "@/components/tools/video-to-gif";
import VideoToAudio from "@/components/tools/video-to-audio";
import VideoFrameCapture from "@/components/tools/video-frame-capture";
import AudioConverter from "@/components/tools/audio-converter";
import AudioTrimmer from "@/components/tools/audio-trimmer";
import EmbedFrame from "@/components/tools/embed-frame";
import Teleprompter from "@/components/tools/teleprompter";
import SubtitleEditor from "@/components/tools/subtitle-editor";
import ToolCard from "@/components/tool-card";
import { I18nText } from "@/components/i18n-text";

function hreflangAlternates(slug: string) {
  const map: Record<string, string> = { en: `/tools/${slug}/` };
  for (const l of LOCALES) if (l.code !== "en") map[l.hreflang] = `/${l.code}/tools/${slug}/`;
  return map;
}

export function generateToolStaticParams() {
  return tools.map((tool) => ({ slug: tool.slug }));
}

export function generateLangToolStaticParams() {
  const out: { lang: string; slug: string }[] = [];
  for (const l of LOCALES) {
    if (l.code === "en") continue;
    for (const t of tools) out.push({ lang: l.code, slug: t.slug });
  }
  return out;
}

export function generateToolMetadata(lang: string, slug: string): Metadata {
  const tool = getTool(slug);
  if (!tool) return {};
  const meta = getMeta(lang, slug);
  const content = getContent(lang, slug);
  const desc = content.intro.slice(0, 158);
  const url = lang === "en" ? `/tools/${slug}/` : `/${lang}/tools/${slug}/`;
  return {
    title: `${meta.title} - Free Online Tool`,
    description: desc,
    keywords: meta.keywords,
    alternates: { canonical: url, languages: hreflangAlternates(slug) },
    openGraph: {
      title: `${meta.title} - Free Online Tool | Toolbox Hub`,
      description: desc,
      url,
      type: "article",
    },
  };
}

export default async function ToolPageBody({ lang, slug }: { lang: string; slug: string }) {
  const tool = getTool(slug);
  if (!tool) notFound();
  const relatedTools = tools.filter((t) => t.category === tool.category && t.slug !== tool.slug).slice(0, 3);
  const meta = getMeta(lang, slug);
  const content = getContent(lang, slug);
  const url = lang === "en" ? `/tools/${slug}/` : `/${lang}/tools/${slug}/`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: meta.title,
        description: content.intro.slice(0, 300),
        url: `https://toolbox-hub.io${url}`,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "HowTo",
        name: `How to use the ${meta.title}`,
        description: content.intro.slice(0, 200),
        totalTime: "PT1M",
        step: content.howTo.map((h, i) => ({ "@type": "HowToStep", position: i + 1, name: h.step, text: h.detail })),
      },
      {
        "@type": "FAQPage",
        mainEntity: content.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
    ],
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <a href={lang === "en" ? "/tools/" : `/${lang}/tools/`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <span aria-hidden>‹</span> <I18nText id="All Tools" />
      </a>
      <ToolPageContent meta={tool} content={content} />
      <div className="rounded-xl border bg-card p-6 mt-6">
        {slug === "password-strength" && <PasswordStrength />}
        {slug === "html-preview" && <HtmlPreview />}
        {slug === "json-validator" && <JsonValidator />}
        {slug === "image-resizer" && <ImageResizer />}
        {slug === "unicode-converter" && <UnicodeConverter />}
        {slug === "url-extractor" && <UrlExtractor />}
        {slug === "phone-formatter" && <PhoneFormatter />}
        {slug === "json-formatter" && <JsonFormatter />}
        {slug === "base64-encoder" && <Base64Encoder />}
        {slug === "url-encoder" && <UrlEncoder />}
        {slug === "qr-code-generator" && <QrCodeGenerator />}
        {slug === "uuid-generator" && <UuidGenerator />}
        {slug === "password-generator" && <PasswordGenerator />}
        {slug === "timestamp-converter" && <TimestampConverter />}
        {slug === "md5-generator" && <Md5Generator />}
        {slug === "word-counter" && <WordCounter />}
        {slug === "color-converter" && <ColorConverter />}
        {slug === "text-to-slug" && <TextToSlug />}
        {slug === "html-entity-encoder" && <HtmlEntityEncoder />}
        {slug === "file-size-converter" && <FileSizeConverter />}
        {slug === "markdown-preview" && <MarkdownPreview />}
        {slug === "image-compressor" && <ImageCompressor />}
        {slug === "json-to-yaml" && <JsonToYaml />}
        {slug === "json-to-csv" && <JsonToCsv />}
        {slug === "xml-formatter" && <XmlFormatter />}
        {slug === "number-base-converter" && <NumberBaseConverter />}
        {slug === "regex-tester" && <RegexTester />}
        {slug === "text-case-converter" && <TextCaseConverter />}
        {slug === "duplicate-line-remover" && <DuplicateLineRemover />}
        {slug === "line-number-adder" && <LineNumberAdder />}
        {slug === "random-string" && <RandomString />}
        {slug === "list-randomizer" && <ListRandomizer />}
        {slug === "text-trimmer" && <TextTrimmer />}
        {slug === "letter-counter" && <LetterCounter />}
        {slug === "morse-code" && <MorseCode />}
        {slug === "text-repeater" && <TextRepeater />}
        {slug === "list-sorter" && <ListSorter />}
        {slug === "length-converter" && <LengthConverter />}
        {slug === "weight-converter" && <WeightConverter />}
        {slug === "temperature-converter" && <TemperatureConverter />}
        {slug === "speed-converter" && <SpeedConverter />}
        {slug === "area-converter" && <AreaConverter />}
        {slug === "volume-converter" && <VolumeConverter />}
        {slug === "time-converter" && <TimeConverter />}
        {slug === "discount-calculator" && <DiscountCalculator />}
        {slug === "tip-calculator" && <TipCalculator />}
        {slug === "age-calculator" && <AgeCalculator />}
        {slug === "date-difference" && <DateDifference />}
        {slug === "days-until" && <DaysUntil />}
        {slug === "bmi-calculator" && <BmiCalculator />}
        {slug === "random-number" && <RandomNumber />}
        {slug === "dice-roller" && <DiceRoller />}
        {slug === "loan-calculator" && <LoanCalculator />}
        {slug === "gradient-generator" && <GradientGenerator />}
        {slug === "box-shadow-generator" && <BoxShadowGenerator />}
        {slug === "border-radius-generator" && <BorderRadiusGenerator />}
        {slug === "color-palette" && <ColorPalette />}
        {slug === "emoji-picker" && <EmojiPicker />}
        {slug === "text-shadow-generator" && <TextShadowGenerator />}
        {slug === "contrast-checker" && <ContrastChecker />}
        {slug === "favicon-generator" && <FaviconGenerator />}
        {slug === "email-validator" && <EmailValidator />}
        {slug === "url-parser" && <UrlParser />}
        {slug === "meta-tag-generator" && <MetaTagGenerator />}
        {slug === "youtube-thumbnail" && <YoutubeThumbnail />}
        {slug === "open-graph-generator" && <OpenGraphGenerator />}
        {slug === "stopwatch" && <Stopwatch />}
        {slug === "world-clock" && <WorldClock />}
        {slug === "caesar-cipher" && <CaesarCipher />}
        {slug === "rot13-encoder" && <Rot13Encoder />}
        {slug === "binary-text" && <BinaryText />}
        {slug === "hex-text" && <HexText />}
        {slug === "pomodoro-timer" && <PomodoroTimer />}
        {slug === "roman-numerals" && <RomanNumerals />}
        {slug === "prime-checker" && <PrimeChecker />}
        {slug === "factorial-calculator" && <FactorialCalculator />}
        {slug === "scientific-notation" && <ScientificNotation />}
        {slug === "decimal-fraction" && <DecimalFraction />}
        {slug === "gcf-calculator" && <GcfCalculator />}
        {slug === "image-to-base64" && <ImageToBase64 />}
        {slug === "video-compressor" && <VideoCompressor />}
        {slug === "video-converter" && <VideoConverter />}
        {slug === "video-merger" && <VideoMerger />}
        {slug === "video-speed-changer" && <VideoSpeedChanger />}
        {slug === "video-transformer" && <VideoTransformer />}
        {slug === "video-trimmer" && <VideoTrimmer />}
        {slug === "video-to-gif" && <VideoToGif />}
        {slug === "video-to-audio" && <VideoToAudio />}
        {slug === "video-frame-capture" && <VideoFrameCapture />}
        {slug === "audio-converter" && <AudioConverter />}
        {slug === "audio-trimmer" && <AudioTrimmer />}
        {slug === "pilko-frame-studio" && <EmbedFrame src="/embed/pilko-frame-studio.html" credit="Pilko Frame Capture Studio" />}
        {slug === "viral-video-studio" && <EmbedFrame src="/embed/viral-video-studio.html" credit="Viral Video Studio" />}
        {slug === "teleprompter" && <Teleprompter />}
        {slug === "subtitle-editor" && <SubtitleEditor />}
        {slug === "openreel-video-editor" && <EmbedFrame src="/embed/openreel/index.html" credit="OpenReel Video" height="min(88vh, 1000px)" />}
      </div>

      {relatedTools.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-semibold mb-4"><I18nText id="Related Tools" /></h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {relatedTools.map((t) => (<ToolCard key={t.slug} tool={t} />))}
          </div>
        </section>
      )}
    </div>
  );
}
