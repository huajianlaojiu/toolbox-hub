import { notFound } from "next/navigation";
import type { Metadata } from "next";
import AdUnit from "@/components/shared/ad-unit";
import { getTool, tools } from "@/lib/tools-data";
import { getToolContent } from "@/lib/tool-content";
import ImageWatermarkRemover from "@/components/tools/image-watermark-remover";
import { ChevronLeft } from "lucide-react";

import ToolCard from "@/components/tool-card";
import PasswordStrength from "@/components/tools/password-strength";
import HtmlPreview from "@/components/tools/html-preview";
import JsonValidator from "@/components/tools/json-validator";
import ImageResizer from "@/components/tools/image-resizer";
import UnicodeConverter from "@/components/tools/unicode-converter";
import UrlExtractor from "@/components/tools/url-extractor";
import PhoneFormatter from "@/components/tools/phone-formatter";
import TextStats from "@/components/tools/text-stats";
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
import CssMinifier from "@/components/tools/css-minifier";
import JsMinifier from "@/components/tools/js-minifier";
import HtmlMinifier from "@/components/tools/html-minifier";
import JsonToYaml from "@/components/tools/json-to-yaml";
import YamlToJson from "@/components/tools/yaml-to-json";
import CsvToJson from "@/components/tools/csv-to-json";
import JsonToCsv from "@/components/tools/json-to-csv";
import XmlFormatter from "@/components/tools/xml-formatter";
import LoremIpsum from "@/components/tools/lorem-ipsum";
import NumberBaseConverter from "@/components/tools/number-base-converter";
import RegexTester from "@/components/tools/regex-tester";
import SqlFormatter from "@/components/tools/sql-formatter";
import JwtDecoder from "@/components/tools/jwt-decoder";
import DiffChecker from "@/components/tools/diff-checker";
import TextCaseConverter from "@/components/tools/text-case-converter";
import TextSorter from "@/components/tools/text-sorter";
import TextReverse from "@/components/tools/text-reverse";
import DuplicateLineRemover from "@/components/tools/duplicate-line-remover";
import LineNumberAdder from "@/components/tools/line-number-adder";
import RandomString from "@/components/tools/random-string";
import ListRandomizer from "@/components/tools/list-randomizer";
import TextTrimmer from "@/components/tools/text-trimmer";
import LetterCounter from "@/components/tools/letter-counter";
import MorseCode from "@/components/tools/morse-code";
import PalindromeChecker from "@/components/tools/palindrome-checker";
import TextRepeater from "@/components/tools/text-repeater";
import ListSorter from "@/components/tools/list-sorter";
import LengthConverter from "@/components/tools/length-converter";
import WeightConverter from "@/components/tools/weight-converter";
import TemperatureConverter from "@/components/tools/temperature-converter";
import SpeedConverter from "@/components/tools/speed-converter";
import AreaConverter from "@/components/tools/area-converter";
import VolumeConverter from "@/components/tools/volume-converter";
import TimeConverter from "@/components/tools/time-converter";
import DataStorageConverter from "@/components/tools/data-storage-converter";
import PercentageCalculator from "@/components/tools/percentage-calculator";
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
import PlaceholderImage from "@/components/tools/placeholder-image";
import EmojiPicker from "@/components/tools/emoji-picker";
import TextShadowGenerator from "@/components/tools/text-shadow-generator";
import ContrastChecker from "@/components/tools/contrast-checker";
import FaviconGenerator from "@/components/tools/favicon-generator";
import EmailValidator from "@/components/tools/email-validator";
import UrlParser from "@/components/tools/url-parser";
import MetaTagGenerator from "@/components/tools/meta-tag-generator";
import UserAgentParser from "@/components/tools/user-agent-parser";
import HttpStatus from "@/components/tools/http-status";
import YoutubeThumbnail from "@/components/tools/youtube-thumbnail";
import OpenGraphGenerator from "@/components/tools/open-graph-generator";
import Stopwatch from "@/components/tools/stopwatch";
import WorldClock from "@/components/tools/world-clock";
import CoinFlip from "@/components/tools/coin-flip";
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

interface ToolPageProps { params: Promise<{ slug: string }> }
export function generateStaticParams() { return tools.map((tool) => ({ slug: tool.slug })) }
export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { slug } = await params; const tool = getTool(slug); if (!tool) return {};
  const c = getToolContent(slug, tool.title, tool.description);
  const desc = c.intro.slice(0, 158);
  return {
    title: `${tool.title} - Free Online Tool`,
    description: desc,
    keywords: tool.keywords,
    alternates: { canonical: `/tools/${slug}/` },
    openGraph: {
      title: `${tool.title} - Free Online Tool | Toolbox Hub`,
      description: desc,
      url: `/tools/${slug}/`,
      type: "article",
    },
  }
}
export default async function ToolPage({ params }: ToolPageProps) {
  const { slug } = await params; const tool = getTool(slug); if (!tool) notFound();
  const relatedTools = tools.filter((t) => t.category === tool.category && t.slug !== tool.slug).slice(0, 3);
  const c = getToolContent(slug, tool.title, tool.description);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: tool.title,
        description: c.intro.slice(0, 300),
        url: `https://toolbox-hub.io/tools/${slug}/`,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "HowTo",
        name: `How to use the ${tool.title}`,
        description: c.intro.slice(0, 200),
        totalTime: "PT1M",
        step: c.howTo.map((h, i) => ({ "@type": "HowToStep", position: i + 1, name: h.step, text: h.detail })),
      },
      {
        "@type": "FAQPage",
        mainEntity: c.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
    ],
  };
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <a href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"><ChevronLeft className="h-4 w-4" />All Tools</a><div className="mb-8"><h1 className="text-2xl font-bold">{tool.title}</h1><p className="mt-2 text-sm text-muted-foreground">{tool.description}</p></div><div className="rounded-xl border bg-card p-6">
        {slug === "password-strength" && <PasswordStrength />}
        {slug === "html-preview" && <HtmlPreview />}
        {slug === "json-validator" && <JsonValidator />}
        {slug === "image-resizer" && <ImageResizer />}
        {slug === "unicode-converter" && <UnicodeConverter />}
        {slug === "url-extractor" && <UrlExtractor />}
        {slug === "phone-formatter" && <PhoneFormatter />}
        {slug === "text-stats" && <TextStats />}
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
        {slug === "css-minifier" && <CssMinifier />}
        {slug === "js-minifier" && <JsMinifier />}
        {slug === "html-minifier" && <HtmlMinifier />}
        {slug === "json-to-yaml" && <JsonToYaml />}
        {slug === "yaml-to-json" && <YamlToJson />}
        {slug === "csv-to-json" && <CsvToJson />}
        {slug === "json-to-csv" && <JsonToCsv />}
        {slug === "xml-formatter" && <XmlFormatter />}
        {slug === "lorem-ipsum" && <LoremIpsum />}
        {slug === "number-base-converter" && <NumberBaseConverter />}
        {slug === "regex-tester" && <RegexTester />}
        {slug === "sql-formatter" && <SqlFormatter />}
        {slug === "jwt-decoder" && <JwtDecoder />}
        {slug === "diff-checker" && <DiffChecker />}
        {slug === "text-case-converter" && <TextCaseConverter />}
        {slug === "text-sorter" && <TextSorter />}
        {slug === "text-reverse" && <TextReverse />}
        {slug === "duplicate-line-remover" && <DuplicateLineRemover />}
        {slug === "line-number-adder" && <LineNumberAdder />}
        {slug === "random-string" && <RandomString />}
        {slug === "list-randomizer" && <ListRandomizer />}
        {slug === "text-trimmer" && <TextTrimmer />}
        {slug === "letter-counter" && <LetterCounter />}
        {slug === "morse-code" && <MorseCode />}
        {slug === "palindrome-checker" && <PalindromeChecker />}
        {slug === "text-repeater" && <TextRepeater />}
        {slug === "list-sorter" && <ListSorter />}
        {slug === "length-converter" && <LengthConverter />}
        {slug === "weight-converter" && <WeightConverter />}
        {slug === "temperature-converter" && <TemperatureConverter />}
        {slug === "speed-converter" && <SpeedConverter />}
        {slug === "area-converter" && <AreaConverter />}
        {slug === "volume-converter" && <VolumeConverter />}
        {slug === "time-converter" && <TimeConverter />}
        {slug === "data-storage-converter" && <DataStorageConverter />}
        {slug === "percentage-calculator" && <PercentageCalculator />}
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
        {slug === "placeholder-image" && <PlaceholderImage />}
        {slug === "emoji-picker" && <EmojiPicker />}
        {slug === "text-shadow-generator" && <TextShadowGenerator />}
        {slug === "contrast-checker" && <ContrastChecker />}
        {slug === "favicon-generator" && <FaviconGenerator />}
        {slug === "email-validator" && <EmailValidator />}
        {slug === "url-parser" && <UrlParser />}
        {slug === "meta-tag-generator" && <MetaTagGenerator />}
        {slug === "user-agent-parser" && <UserAgentParser />}
        {slug === "http-status" && <HttpStatus />}
        {slug === "youtube-thumbnail" && <YoutubeThumbnail />}
        {slug === "open-graph-generator" && <OpenGraphGenerator />}
        {slug === "stopwatch" && <Stopwatch />}
        {slug === "world-clock" && <WorldClock />}
        {slug === "coin-flip" && <CoinFlip />}
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
              {slug === "image-watermark-remover" && <ImageWatermarkRemover />}
      </div>
      <div className="mt-6 p-4 rounded-lg bg-muted/50 border"><p className="text-sm text-muted-foreground">{tool.description} All processing happens in your browser.</p></div>

      <section className="mt-10 max-w-3xl">
        <h2 className="text-xl font-semibold mb-3">About the {tool.title}</h2>
        <div className="space-y-4">
          {c.intro.split("\n\n").map((para, i) => (
            <p key={i} className="text-sm leading-7 text-muted-foreground">{para}</p>
          ))}
        </div>
      </section>

      {c.useCases && c.useCases.length > 0 && (
        <section className="mt-8 max-w-3xl">
          <h2 className="text-xl font-semibold mb-3">Where people use the {tool.title}</h2>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground leading-6">
            {c.useCases.map((u, i) => (<li key={i}>{u}</li>))}
          </ul>
        </section>
      )}

      <section className="mt-8 max-w-3xl">
        <h2 className="text-xl font-semibold mb-3">How to use the {tool.title}</h2>
        <ol className="space-y-4">
          {c.howTo.map((h, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">{i + 1}</span>
              <div>
                <p className="font-medium text-sm">{h.step}</p>
                <p className="text-sm text-muted-foreground leading-6 mt-1">{h.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {c.tips && c.tips.length > 0 && (
        <section className="mt-8 max-w-3xl">
          <h2 className="text-xl font-semibold mb-3">Tips and best practices</h2>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground leading-6">
            {c.tips.map((t, i) => (<li key={i}>{t}</li>))}
          </ul>
        </section>
      )}

      <section className="mt-8 max-w-3xl">
        <h2 className="text-xl font-semibold mb-3">Frequently asked questions</h2>
        <div className="space-y-5">
          {c.faq.map((f, i) => (
            <div key={i}>
              <h3 className="font-semibold text-sm">{f.q}</h3>
              <p className="text-sm text-muted-foreground leading-6 mt-1.5">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-10 max-w-3xl">
        <AdUnit />
      </div>

      {relatedTools.length > 0 && (<section className="mt-12"><h2 className="text-lg font-semibold mb-4">Related Tools</h2><div className="grid grid-cols-1 gap-4 sm:grid-cols-3">{relatedTools.map((t) => (<ToolCard key={t.slug} tool={t} />))}</div></section>)}
    </div>
  )
}
