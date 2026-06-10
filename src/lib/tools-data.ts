import { Braces, Binary, Link, QrCode, Fingerprint, Key, Clock, Hash, Type, Palette, FileText, Code, HardDrive, Eye, Image } from "lucide-react";
import type { ComponentType } from "react";

export interface ToolMeta {
  slug: string;
  title: string;
  description: string;
  category: string;
  icon: ComponentType<{ className?: string }>;
  keywords: string[];
  isPureFrontend: boolean;
}

export const tools: ToolMeta[] = [
  {
    slug: "json-formatter",
    title: "JSON Formatter",
    description: "Format, validate, and beautify JSON data. Minify or prettify JSON with a single click.",
    category: "Developer",
    icon: Braces,
    keywords: ["json formatter", "json beautifier", "json validator", "json prettier", "format json", "json minify"],
    isPureFrontend: true,
  },
  {
    slug: "base64-encoder",
    title: "Base64 Encoder / Decoder",
    description: "Encode text to Base64 or decode Base64 strings back to plain text. Supports UTF-8.",
    category: "Developer",
    icon: Binary,
    keywords: ["base64 encode", "base64 decode", "base64 encoder", "base64 decoder", "base64 converter"],
    isPureFrontend: true,
  },
  {
    slug: "url-encoder",
    title: "URL Encoder / Decoder",
    description: "URL-encode or decode text for safe use in query strings and web addresses.",
    category: "Developer",
    icon: Link,
    keywords: ["url encode", "url decode", "url encoder", "url decoder", "url encode decode", "percent encoding"],
    isPureFrontend: true,
  },
  {
    slug: "qr-code-generator",
    title: "QR Code Generator",
    description: "Generate QR codes from text or URLs. Download as PNG image for sharing or printing.",
    category: "Utility",
    icon: QrCode,
    keywords: ["qr code generator", "qr code maker", "qr code creator", "generate qr code", "qr code online", "qr code from text"],
    isPureFrontend: true,
  },
  {
    slug: "uuid-generator",
    title: "UUID Generator",
    description: "Generate random UUIDs (v4). Create single UUIDs or batches with optional formatting.",
    category: "Developer",
    icon: Fingerprint,
    keywords: ["uuid generator", "uuid v4", "guid generator", "generate uuid", "random uuid", "uuid online"],
    isPureFrontend: true,
  },
  {
    slug: "password-generator",
    title: "Password Generator",
    description: "Generate strong, secure random passwords. Customize length, character sets, and complexity.",
    category: "Utility",
    icon: Key,
    keywords: ["password generator", "strong password", "random password", "password maker", "secure password generator"],
    isPureFrontend: true,
  },
  {
    slug: "timestamp-converter",
    title: "Timestamp Converter",
    description: "Convert Unix timestamps to human-readable dates and vice versa. Supports seconds and milliseconds.",
    category: "Developer",
    icon: Clock,
    keywords: ["timestamp converter", "unix timestamp", "epoch converter", "unix time converter", "timestamp to date", "date to timestamp"],
    isPureFrontend: true,
  },
  {
    slug: "md5-generator",
    title: "MD5 Hash Generator",
    description: "Generate MD5, SHA-1, SHA-256, and SHA-512 hashes from text input. Fast and client-side only.",
    category: "Developer",
    icon: Hash,
    keywords: ["md5 generator", "md5 hash", "sha256 generator", "hash generator", "md5 online", "sha1 generator"],
    isPureFrontend: true,
  },
  {
    slug: "word-counter",
    title: "Word Counter",
    description: "Count words, characters, sentences, paragraphs, and estimate reading time for any text.",
    category: "Text",
    icon: Type,
    keywords: ["word counter", "character count", "word count tool", "text counter", "character counter", "reading time calculator"],
    isPureFrontend: true,
  },
  {
    slug: "color-converter",
    title: "Color Converter",
    description: "Convert colors between HEX, RGB, HSL, and HSV formats. Interactive color picker with live preview.",
    category: "Design",
    icon: Palette,
    keywords: ["color converter", "hex to rgb", "rgb to hex", "hsl converter", "color picker", "hex to hsl"],
    isPureFrontend: true,
  },
  {
    slug: "text-to-slug",
    title: "Text to Slug",
    description: "Convert any text into a URL-friendly slug. Useful for blog posts, CMS entries, and file names.",
    category: "Text",
    icon: FileText,
    keywords: ["text to slug", "slug generator", "url slug", "slugify", "string to slug", "slug maker"],
    isPureFrontend: true,
  },
  {
    slug: "html-entity-encoder",
    title: "HTML Entity Encoder / Decoder",
    description: "Encode or decode HTML entities. Convert special characters to HTML entities and back.",
    category: "Developer",
    icon: Code,
    keywords: ["html entity encoder", "html entity decoder", "html encode", "html decode", "html entities", "escape html"],
    isPureFrontend: true,
  },
  {
    slug: "file-size-converter",
    title: "File Size Converter",
    description: "Convert between bytes, KB, MB, GB, TB, and PB. Quick file size unit conversion tool.",
    category: "Utility",
    icon: HardDrive,
    keywords: ["file size converter", "bytes to mb", "kb to mb", "file size calculator", "byte converter", "gb to mb"],
    isPureFrontend: true,
  },
  {
    slug: "markdown-preview",
    title: "Markdown Preview",
    description: "Write Markdown and see a live HTML preview. Great for drafting README files and documentation.",
    category: "Text",
    icon: Eye,
    keywords: ["markdown preview", "markdown editor", "markdown to html", "md preview", "markdown live preview", "markdown viewer"],
    isPureFrontend: true,
  },
  {
    slug: "image-compressor",
    title: "Image Compressor",
    description: "Compress JPEG, PNG, and WebP images right in your browser. Reduce file size without uploading.",
    category: "Image",
    icon: Image,
    keywords: ["image compressor", "compress image", "compress jpg", "compress png", "image optimizer", "reduce image size"],
    isPureFrontend: true,
  },
];

export const categories = Array.from(new Set(tools.map((t) => t.category)));

export function getTool(slug: string): ToolMeta | undefined {
  return tools.find((t) => t.slug === slug);
}