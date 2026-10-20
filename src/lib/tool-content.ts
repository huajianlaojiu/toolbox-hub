import type { ComponentType } from "react";
import { tools } from "@/lib/tools-data";

export interface ToolContent {
  intro: string;
  howTo: { step: string; detail: string }[];
  faq: { q: string; a: string }[];
  tips?: string[];
  useCases?: string[];
}

const generic = (title: string, desc: string): ToolContent => ({
  intro: `${title} is a free browser-based tool on Toolbox Hub. ${desc}. It exists to remove a small but annoying task from your workflow: instead of installing an app, writing a script, or hunting through a settings panel, you open one page and get the answer.\n\nEverything runs locally in your browser using JavaScript. Nothing you type is uploaded to a server, no account is required, and the tool keeps working on a slow or intermittent connection. That makes it equally useful for a quick one-off check and for repeated daily use.\n\nTypical uses include checking a value before sending it to a client, converting a batch of numbers for a spreadsheet, cleaning up text before pasting it into a ticket, or verifying a result produced by a script. If you keep landing on this page for the same task, bookmark it.`,
  howTo: [
    { step: "Enter your data", detail: `Paste or type the input into the ${title.toLowerCase()} field above. You can edit the value before running it, so there is no need to prepare anything in advance.` },
    { step: "Run the tool", detail: "Click the action button. The result appears immediately, because all of the work happens in your browser rather than on a remote server." },
    { step: "Copy the result", detail: "Use the Copy button next to the output to place the result on your clipboard, then paste it wherever you need it." },
    { step: "Verify and reuse", detail: "Spot-check the result against your own expectations. The tool stays on this page, so you can run it again with new input as often as you need." },
  ],
  faq: [
    { q: `Is this ${title.toLowerCase()} free to use?`, a: "Yes. It is completely free, with no sign-up, no trial period, no usage limit and no watermark. There is also no paid tier that holds back basic functionality." },
    { q: "Is my data uploaded to a server?", a: "No. The tool runs entirely in your browser, so your input never leaves your device. This is also why there is no file size limit and why the tool still works offline once the page has loaded." },
    { q: "Does it work on a phone or tablet?", a: "Yes. The layout is responsive and adapts to phones, tablets and desktops. On a small screen the controls stack vertically so the input stays readable." },
    { q: "Do I need to create an account?", a: "No. There is no registration, no email confirmation and no login. Bookmark the page instead, and it will behave like any other utility you use daily." },
    { q: "Can I use it for commercial work?", a: "Yes. The output is yours to use in client work, products and publications. There is no attribution requirement and no restriction on commercial use." },
    { q: "How accurate is the result?", a: "The tool applies a deterministic rule rather than an estimate, so repeated runs on the same input always give the same output. For anything legally or financially consequential, double-check against your own source of truth." },
  ],
  useCases: [
    "Checking a value before you send it to a client, a colleague, or an API.",
    "Cleaning up a batch of values so they paste cleanly into a spreadsheet or ticket.",
    "Verifying the output of a script so you know what you are shipping.",
    "Doing a one-off task without installing software or filling in a form.",
  ],
  tips: [
    "Bookmark the tool page so you skip the search next time you need it.",
    "Run the tool again with a different input to compare results side by side.",
    "Use the copy button rather than selecting text manually, which avoids stray whitespace.",
  ],
});

/** Per-tool content overrides. Keys are tool slugs. */
const overrides: Record<string, ToolContent> = {
  "json-formatter": {
    intro:
      "The JSON Formatter validates your JSON and pretty-prints it with consistent indentation, so you can actually read it. It highlights the exact position of a syntax error instead of only telling you that something is broken, which is what makes it useful for debugging an API response or a config file. It is also the fastest way to spot the two mistakes that account for most invalid JSON: a trailing comma and unescaped quotes inside string values.",
    howTo: [
      { step: "Paste your JSON", detail: "Drop a .json file, or paste the raw text straight from your API response or editor." },
      { step: "Validate and format", detail: "The formatter parses the document. Valid input is re-indented with 2 spaces and highlighted; invalid input shows the line and column of the error." },
      { step: "Copy the result", detail: "Copy the formatted JSON back into your editor, request body, or terminal." },
    ],
    faq: [
      { q: "Why does my JSON fail to parse?", a: "The most common causes are a trailing comma after the last item in an object or array, single quotes instead of double quotes, and unescaped double quotes inside a string value." },
      { q: "Can this formatter handle very large JSON files?", a: "Yes. Because parsing happens in your browser, files of several megabytes are handled fine, with no upload size limit imposed by a server." },
      { q: "Does it re-encode or change my values?", a: "No. Numbers, strings, booleans and null keep their original values. Only whitespace and key order are left untouched." },
      { q: "Is this a JSON minifier too?", a: "The output is already minified when you use the Minify button, which strips all optional whitespace for payloads that need to be compact." },
    ],
    tips: ["Use the Minify button before sending a payload to a rate-limited API.", "Validate generated JSON before it reaches production."],
    useCases: [
      "Validating a JSON payload before you POST it to an API.",
      "Debugging a failing response from a third-party endpoint.",
      "Cleaning up a config file before it goes into version control.",
      "Turning a one-line JSON blob into something a human can read.",
    ],
  },
  "base64-encoder": {
    intro:
      "The Base64 Encoder and Decoder converts text or binary data to and from Base64, the encoding scheme used for data URIs, HTTP Basic authentication headers, and most email attachments. Encoding is done with the browser's built-in btoa/atob primitives, which means the transformation is byte-exact and Unicode text is handled correctly instead of producing mojibake. Use it when you need to embed a small image in CSS, decode a Basic auth token, or move binary data through a channel that only accepts text.",
    howTo: [
      { step: "Paste the text or data URI", detail: "Type into the input box, or paste a string that is already Base64 encoded." },
      { step: "Choose encode or decode", detail: "Encode turns plain text into Base64. Decode turns a Base64 string back into readable text." },
      { step: "Copy the output", detail: "Copy the result and use it in your URL, header, or file." },
    ],
    faq: [
      { q: "Is Base64 encryption?", a: "No. Base64 is an encoding, not encryption. Anyone can decode it without a key, so never use it to hide passwords or secrets." },
      { q: "Why did my decoded output look like garbage?", a: "That usually means the input was encoded as UTF-8 text and then treated as binary. Decoding a UTF-8 payload requires a byte-level round trip, not a plain text decode." },
      { q: "Can I encode an image to a data URI?", a: "Yes. Encode the file and prefix the result with data:image/png;base64, to embed it directly in HTML or CSS." },
      { q: "Does encoding change the file size?", a: "Base64 always increases size by about one third, since every three bytes become four characters. Plan for that when you set size limits." },
    ],
    useCases: [
      "Encoding a small image so it can be inlined in CSS or HTML.",
      "Creating a data URI for an email template that supports only certain assets.",
      "Decoding a Basic authentication header to see what it contains.",
      "Moving binary data through a field that only accepts plain text.",
    ],
  },
  "qr-code-generator": {
    intro:
      "The QR Code Generator turns any text or URL into a scannable QR code that you can download as a PNG. The code is rendered locally in your browser and never uploaded, so you can encode private data such as a Wi-Fi password or a serial number. Pick a pixel size and a margin that suits where the code will be printed, since a code that is too small or has too little quiet zone is the most common reason a phone camera refuses to scan it.",
    howTo: [
      { step: "Enter the content", detail: "Type a URL, a message, a phone number, or any plain text." },
      { step: "Choose the size", detail: "Select 128, 256 or 512 pixels. Larger codes scan more reliably, especially when printed small." },
      { step: "Generate and download", detail: "Click Generate, then download the PNG and place it where your audience can scan it." },
    ],
    faq: [
      { q: "Why will my phone not scan the code?", a: "Usually the quiet zone is too small or the code is too dense. Keep a margin of at least four modules around the code, and do not shrink it below about 2 cm in printed size." },
      { q: "Is there a scan limit on the number of characters?", a: "A standard QR code holds up to roughly 4,296 alphanumeric characters or 2,954 numeric digits. Very long URLs may need a higher error correction level, which makes the code denser." },
      { q: "Can I create a QR code for a Wi-Fi network?", a: "Yes. Enter the text in the form wifiname:WIFI;T:WPA;S:network;P:password;; and scanners will offer to join the network." },
    ],
    useCases: [
      "Printing a QR code on a poster, packaging, or a business card.",
      "Sharing a Wi-Fi password without typing it character by character.",
      "Linking to a menu, a ticket, or a product page from a printed sign.",
      "Adding a scannable code to a conference badge or slide.",
    ],
  },
  "password-generator": {
    intro:
      "The Password Generator creates strong random passwords using your browser's cryptographic random number generator, not Math.random. You control the length, and you decide whether to include lowercase letters, uppercase letters, digits and symbols. Because generation happens locally, the password is never transmitted, logged or stored anywhere, which is exactly how a password should be handled.",
    howTo: [
      { step: "Set the length", detail: "Pick a length of at least 12 characters. Longer is better, and a passphrase of several words is easier to remember than a short random string." },
      { step: "Choose the character set", detail: "Enable or disable uppercase, digits and symbols. Avoid disabling groups unless a specific system demands a particular format." },
      { step: "Generate and store", detail: "Click Generate and copy the result into your password manager. Do not store it in a plain text file." },
    ],
    faq: [
      { q: "How long should a password be?", a: "At least 12 characters for ordinary accounts, and 16 or more for email, banking and any account that protects other accounts." },
      { q: "Does this site store my generated password?", a: "No. The password is created in your browser and never leaves your device. Clearing the tab destroys it." },
      { q: "Should I use a passphrase instead?", a: "For long-term accounts you use daily, a multi-word passphrase is often better. It is far longer than a short random password and much easier to type." },
      { q: "Is a symbol-only password better?", a: "Not by itself. Length matters more than character variety, so a long passphrase of letters usually outperforms a short string of symbols." },
    ],
    useCases: [
      "Creating a password for a new account when your usual one is already used.",
      "Generating a separate strong password for your email account.",
      "Producing a long passphrase you can actually remember and type.",
      "Rotating a password after a service reports a breach.",
    ],
  },
  "image-compressor": {
    intro:
      "The Image Compressor reduces the file size of JPEG, PNG and WebP images directly in your browser using the Canvas API. Nothing is uploaded, so you can compress a photo of an ID document without it ever leaving your device. You choose the quality level and see the exact before-and-after size, which makes it easy to hit a specific limit such as a 2 MB email attachment cap or a 1 MB upload requirement on a job application portal.",
    howTo: [
      { step: "Select an image", detail: "Drop a file onto the tool or click to browse. JPG, PNG and WebP are supported." },
      { step: "Set the quality", detail: "Around 80 is visually lossless for most photos. Drop to 60 or below when you need a much smaller file." },
      { step: "Compare and download", detail: "Review the size difference, then download the compressed image." },
    ],
    faq: [
      { q: "Are my images uploaded to a server?", a: "No. Compression runs locally via the browser Canvas API. This is why there is no file size cap and why it works offline." },
      { q: "How much smaller will the file get?", a: "A typical photo shrinks by 60 to 80 percent at quality 80. Screenshots with large flat colour areas can compress even further." },
      { q: "Does compressing a photo reduce its resolution?", a: "No. The dimensions stay exactly the same; only the encoding quality changes. Use the Image Resizer when you need to change dimensions." },
      { q: "Why is my PNG bigger after compression?", a: "PNG is already lossless. Re-encoding it rarely helps, so convert it to JPEG or WebP instead, both of which the tool supports." },
    ],
    useCases: [
      "Getting a photo under an upload limit on a form or job portal.",
      "Reducing the size of images before emailing them to a client.",
      "Speeding up a web page by shrinking its hero images.",
      "Preparing images for upload to a marketplace that rejects large files.",
    ],
  },
  "timestamp-converter": {
    intro:
      "The Timestamp Converter translates between Unix timestamps and human-readable dates in both directions. It covers seconds, milliseconds and microseconds, and it reads dates in local time, UTC or a fixed offset. This is the tool to reach for when a log line contains 1712345678 and you need to know when that actually happened, or when a database column stores a datetime and a script needs a raw epoch value.",
    howTo: [
      { step: "Paste a timestamp or a date", detail: "Enter a 10-digit epoch value, a millisecond value, or a date string such as 2024-05-01 12:30:00." },
      { step: "Pick the timezone", detail: "Switch between your local timezone and UTC. The difference matters when you are reading a server log written in UTC." },
      { step: "Copy the value", detail: "Copy the formatted date for a report, or the epoch value for your code." },
    ],
    faq: [
      { q: "Is a Unix timestamp in seconds or milliseconds?", a: "Seconds. A 10-digit value is seconds, a 13-digit value is milliseconds. The tool detects this automatically." },
      { q: "Why is my timestamp off by eight hours?", a: "You are probably comparing a UTC log entry with a local time. Check which timezone the server writes in before assuming the timestamp is wrong." },
      { q: "Does it handle the year 2038 problem?", a: "Yes. The tool handles timestamps well beyond 2038, so it will not overflow the way a 32-bit signed integer does." },
    ],
    useCases: [
      "Reading a timestamp from a server log and understanding when it happened.",
      "Converting a stored date into an epoch value for a database query.",
      "Checking whether a timestamp came from a UTC or local clock.",
      "Converting an API expiry field into a human-readable date.",
    ],
  },
  "word-counter": {
    intro:
      "The Word Counter gives you a live count of words, characters, sentences and paragraphs as you type, along with reading time and speaking time estimates. It also surfaces the average word length and the count of unique words, which is what you need when a client specifies a limit and you want to know how far you are from it. Counting happens on every keystroke locally, so a 50,000-word document stays responsive.",
    howTo: [
      { step: "Type or paste your text", detail: "The counts update as you type, with no button to press." },
      { step: "Read the statistics", detail: "Check words, characters, sentences, paragraphs and the reading and speaking time estimates." },
      { step: "Use the reading time estimate", detail: "Speaking time is calculated at roughly 130 words per minute, which is close to a normal presentation pace." },
    ],
    faq: [
      { q: "How is reading time calculated?", a: "It assumes about 225 words per minute for silent reading and about 130 words per minute for speaking aloud." },
      { q: "Does it count spaces in the character count?", a: "Yes. The character count includes spaces, and a separate count without spaces is shown alongside it." },
      { q: "How are sentences counted?", a: "A sentence ends at a period, question mark or exclamation mark. Abbreviations such as e.g. or Dr. are counted as separate sentences." },
    ],
    useCases: [
      "Checking whether an article meets a client word limit.",
      "Estimating how long a speech or voice-over will take to read.",
      "Counting characters for a form field with a hard limit.",
      "Measuring the length of a meta description before publishing.",
    ],
  },
  "file-size-converter": {
    intro:
      "The File Size Converter translates between binary units such as bytes, kilobytes, megabytes, gigabytes and terabytes, and decimal units such as KB, MB, GB and TB. The difference is small but it matters: a file shown as 1 MB by an operating system is 1,048,576 bytes, while a vendor that advertises 1 GB of storage means 1,000,000,000 bytes. This tool shows both so you always know which one you are looking at.",
    howTo: [
      { step: "Enter the value", detail: "Type a number such as 512, 2.5 or 1024." },
      { step: "Choose the source unit", detail: "Select the unit your number is expressed in, binary or decimal." },
      { step: "Read the full table", detail: "All conversions are shown at once, from bytes up to terabytes." },
    ],
    faq: [
      { q: "Is 1 MB 1000 KB or 1024 KB?", a: "Both exist. Operating systems use 1024 (binary), while manufacturers use 1000 (decimal). That is why a 1 GB disk shows as 931 GB in Windows." },
      { q: "How many bytes are in a megabyte?", a: "1 megabyte is 1,048,576 bytes in binary units, and 1,000,000 bytes in decimal units." },
      { q: "Why does my file look smaller than the label?", a: "Because drive manufacturers use decimal units while the operating system reports binary units. The discrepancy is about 7 percent for a terabyte drive." },
    ],
    useCases: [
      "Checking whether a file fits an upload limit.",
      "Converting a vendor storage spec into the units your OS reports.",
      "Working out how much data a download or a backup will use.",
      "Explaining a storage discrepancy to someone else.",
    ],
  },
};

export function getToolContent(slug: string, title: string, description: string): ToolContent {
  return overrides[slug] ?? generic(title, description);
}

export const toolContentList = tools.map((t) => ({
  slug: t.slug,
  content: getToolContent(t.slug, t.title, t.description),
}));
