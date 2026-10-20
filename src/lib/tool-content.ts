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
  "regex-tester": {
    intro:
      "The Regex Tester runs a JavaScript regular expression against your own sample text and highlights every match as you type, so you can watch a pattern succeed or fail instead of guessing. Alongside the highlights it lists each match with its start position and its capture groups, which is the part that actually tells you whether group 2 is the value you wanted or an empty string. Three mistakes cause most broken regexes, and all three are visible here: a greedy quantifier quietly swallowing more text than intended, an unescaped dot matching anything, and a missing global flag that stops the search after the first hit.",
    howTo: [
      { step: "Paste the text you want to test", detail: "Use a real sample rather than an invented one. The edge cases in your actual data are what break the pattern, so include a line that should not match too." },
      { step: "Write the pattern", detail: "Enter the expression without the surrounding slashes, for example [a-z]+ rather than /[a-z]+/. Flags are separate toggles." },
      { step: "Turn flags on or off", detail: "g finds every match instead of stopping at the first, i ignores case, m makes anchors work per line, s lets a dot span newlines, u enables full Unicode mode and y anchors matches to lastIndex." },
      { step: "Read the match table", detail: "Each result shows the matched text, its character offset and every capture group. An unexpected empty group usually means an optional quantifier matched nothing." },
      { step: "Copy the finished pattern", detail: "When the highlights look right, copy the expression and paste it into your code, remembering to carry the flags across as well." },
    ],
    faq: [
      { q: "Which regex flavour does this use?", a: "JavaScript, via the browser's own RegExp engine. Syntax is close to PCRE and Python's re module, but not identical. Named groups, lookahead, lookbehind and Unicode property escapes all work in current browsers." },
      { q: "Why does my pattern match far more text than I expected?", a: "Because quantifiers are greedy by default. Something like .* or [0-9]+ will consume as much as it can while still allowing the rest of the pattern to match. Add a question mark to make it lazy, so .*? or [0-9]+? stops at the first opportunity." },
      { q: "Why do I only get one result?", a: "The global flag is off. Without g, the engine returns the first match and stops. Toggle g to collect every match in the input." },
      { q: "Why does my anchor not work on the second line?", a: "By default the caret and dollar anchors refer to the start and end of the whole string, not each line. Enable the m flag to make them line-aware." },
      { q: "Is my test data sent anywhere?", a: "No. Matching happens in your browser with the built-in RegExp object. Nothing is uploaded, which is why you can safely paste real log lines or configuration fragments." },
      { q: "Can I use this to validate input on a form?", a: "You can develop the pattern here, but always validate again on the server. Client-side regex is a convenience for the user, never a security control, because it can be skipped entirely." },
    ],
    useCases: [
      "Debugging a log-parsing pattern against a handful of real log lines.",
      "Working out a phone or postal-code rule before wiring it into a form.",
      "Extracting order numbers or IDs from a pasted block of text.",
      "Learning how quantifiers behave by changing one character and watching the highlights move.",
    ],
    tips: [
      "Test one rule per pattern. A regex doing three jobs is unreadable and impossible to debug.",
      "Include a line that must not match and confirm it stays unhighlighted.",
      "Prefer named groups such as year, month, day over numbered ones, so the pattern still means something when you return to it next month.",
    ],
  },
  "uuid-generator": {
    intro:
      "The UUID Generator produces version 4 universally unique identifiers using the browser's cryptographically secure random number generator, in the standard 8-4-4-4-12 form, for example 3f2504e0-4f89-41d3-9a0c-0305e82c3301. A version 4 UUID carries 122 random bits, so the chance of a collision across a few billion identifiers is far below the chance of a hardware failure in the same period. The tool generates in batches, so you can fill a fixture file or a seed table in one pass instead of clicking twenty times.",
    howTo: [
      { step: "Choose how many identifiers you need", detail: "Set the quantity from 1 up to a few hundred. Each one is generated independently from fresh random bytes." },
      { step: "Pick the format", detail: "Standard lowercase with hyphens is the default. Uppercase and hyphen-free forms are also available for systems that expect them." },
      { step: "Generate", detail: "Every identifier appears at once, one per line, ready to copy as a block." },
      { step: "Copy and paste into your data", detail: "Use the copy button to avoid trailing whitespace, then paste straight into SQL, JSON or a spreadsheet column." },
    ],
    faq: [
      { q: "Are these identifiers really random?", a: "Yes. They come from crypto.getRandomValues, the platform's cryptographically secure source, not Math.random. The version and variant bits are then set as the specification requires, leaving 122 bits of randomness." },
      { q: "Should I use version 4 or version 7?", a: "Version 4 if the identifier is only ever looked up by exact match. Version 7 if it is a primary key in a database, because its prefix is a timestamp, so inserts stay near the end of the index instead of scattering across it and fragmenting the B-tree." },
      { q: "Can I generate version 1, 3 or 5 here?", a: "No. Version 1 needs a MAC address and clock state, and versions 3 and 5 are deterministic hashes of a namespace and a name. Those are derived values rather than random ones, so they belong in code, not in a random generator." },
      { q: "Is a UUID safe to expose in a URL?", a: "It is unguessable, which is useful, but unguessable is not the same as authorised. Do not treat an unguessable identifier as an access control check; verify permissions separately." },
      { q: "What are the version and variant bits?", a: "The thirteenth hex digit is fixed at 4 for version 4, and the seventeenth is limited to 8, 9, a or b for the RFC 4122 variant. That is why the pattern always looks like 8-4-4-4-12 with a 4 in the third group." },
      { q: "Do I need to worry about duplicates?", a: "Not in practice. You would need to generate roughly 2.7 times ten to the eighteenth identifiers before a fifty percent chance of a single collision appears. Keep a unique constraint on the column anyway, since it costs almost nothing." },
    ],
    useCases: [
      "Filling a fixture file or a seed script with realistic identifiers.",
      "Creating request IDs for an API test suite.",
      "Generating primary keys for rows imported from a spreadsheet.",
      "Producing non-guessable filenames for uploads that are not yet behind authorisation.",
    ],
    tips: [
      "Store UUIDs in a native UUID column rather than a variable-length string type, which saves space and indexes faster.",
      "If you need sortable keys, generate version 7 in code instead of version 4 here.",
      "Never derive anything from a UUID by parsing it; the bits are random, not meaningful.",
    ],
  },
  "percentage-calculator": {
    intro:
      "The Percentage Calculator answers the three questions people constantly confuse: what is X percent of Y, X is what percent of Y, and what is the percentage change from one number to another. Getting the right one matters, because the wrong choice produces an answer that looks plausible and is wrong by a factor of the base. It also computes the reverse case, where you know the final value and the percentage and need the original number, which comes up whenever a price includes tax or a figure has already been marked down.",
    howTo: [
      { step: "Identify which question you are asking", detail: "A part of a whole, a ratio expressed as a percentage, or a change between two values. Each has its own field set." },
      { step: "Enter the two numbers", detail: "For a change, the first value is the starting point and the second is the ending point. Order matters here and reversing it flips the sign of the answer." },
      { step: "Read the result and the working", detail: "The tool shows the arithmetic as well as the answer, so you can check it against your own reasoning." },
      { step: "Check the direction of a change", detail: "An increase from 80 to 100 is 25 percent, while a decrease from 100 to 80 is 20 percent. The same 20 unit gap is a different percentage depending on which end you start from." },
    ],
    faq: [
      { q: "What is the difference between percent and percentage points?", a: "A change from 4 percent to 6 percent is an increase of 2 percentage points, but a 50 percent increase in the rate itself. News reporting mixes these up constantly. Use percentage points when comparing two rates, and percent when describing relative growth." },
      { q: "Why is a 20 percent discount followed by 20 percent tax not back to the original price?", a: "Because each percentage applies to a different base. Multiplying by 0.8 then 1.2 gives 0.96, so you end up 4 percent below where you started. Percentages only add and subtract cleanly when the base stays the same." },
      { q: "How do I find the original price before a discount?", a: "Divide rather than subtract. If something costs 80 after 20 percent off, the original is 80 divided by 0.8, which is 100. Subtracting 20 percent from 80 gives 64, which is the common mistake." },
      { q: "How do I calculate a percentage increase?", a: "Subtract the old value from the new one, divide by the old value, then multiply by 100. So a move from 250 to 300 is 50 divided by 250, which is 0.2, or 20 percent." },
      { q: "Why do percentages over 100 appear?", a: "They are legitimate whenever the new value exceeds the original. Sales rising from 10 to 25 is a 150 percent increase. A percentage above 100 only looks wrong when someone means a proportion of a whole, which cannot exceed 100." },
    ],
    useCases: [
      "Checking a discount against the price on the shelf.",
      "Working out the growth rate between two months of figures.",
      "Converting a test score into a percentage.",
      "Finding the pre-tax amount when only the gross figure is known.",
    ],
    tips: [
      "When comparing rates, say percentage points out loud to yourself before writing the sentence.",
      "For a chain of changes, multiply the factors rather than adding the percentages.",
      "Round only at the end; rounding each step compounds the error.",
    ],
  },
  "jwt-decoder": {
    intro:
      "The JWT Decoder splits a JSON Web Token into its three parts and shows the header and payload as readable JSON, with the timestamps in the claims converted to actual dates. It is the fastest way to answer the two questions that come up whenever a token misbehaves: which algorithm signed it, and when does it expire. The decoder is deliberately explicit about one thing, because it is the source of a great many security bugs: decoding a token is not verifying it. Anyone can read and modify the payload of a JWT, so the contents are only trustworthy after the signature has been checked against the issuer's key.",
    howTo: [
      { step: "Paste the token", detail: "Copy the whole string, including all three dot-separated parts. Tokens copied from a browser header often pick up a leading Bearer prefix, which the decoder strips automatically." },
      { step: "Read the header", detail: "The alg field names the signing algorithm and typ should be JWT. An alg of none means the token is unsigned, which no production service should accept." },
      { step: "Read the claims", detail: "Look at iss and aud to confirm the token was meant for your service, sub to see who it represents, and exp to see when it stops being valid." },
      { step: "Check the timestamps", detail: "exp, iat and nbf are seconds since the Unix epoch, not milliseconds. The decoder shows both the raw number and the readable date so you can tell a genuine expiry from an off-by-a-thousand error." },
      { step: "Verify, then trust", detail: "Use your library to validate the signature and the claims before acting on anything you read here." },
    ],
    faq: [
      { q: "Does decoding a token prove it is genuine?", a: "No, and this is the important point. Base64url is an encoding, not encryption. The payload is readable and editable by anyone holding the token. Only the signature check, performed with the issuer's key, establishes that the claims have not been altered." },
      { q: "Where is the signature checked?", a: "On the server, using the shared secret for HMAC algorithms or the public key for RSA and ECDSA. A browser has no business verifying a token it is also allowed to read, because it cannot keep a key secret." },
      { q: "Why does my token have only two parts?", a: "Because it is not a signed JWT. Some libraries issue unsecured tokens with an empty signature, which still leaves three segments separated by two dots. Two segments usually means the token was truncated when copied." },
      { q: "What is the difference between base64 and base64url?", a: "Standard base64 uses plus and slash, which are unsafe in URLs and headers. Base64url substitutes minus and underscore and drops the padding equals signs. A token that fails to decode is often one that was passed through a URL without this conversion." },
      { q: "Why is exp in the past on a token I just received?", a: "Either the issuer set a very short lifetime, or the value is in milliseconds when the consumer expects seconds. A token with exp around 1.7 billion is in seconds; a value with thirteen digits is in milliseconds." },
      { q: "Is it safe to paste a real token here?", a: "The decoding happens entirely in your browser and nothing is transmitted, so the technical risk is nil. The practical advice still stands: treat any token as a live credential, and prefer a test token over one belonging to a real user." },
    ],
    useCases: [
      "Diagnosing an unexpected 401 by checking exp and aud.",
      "Confirming which algorithm an identity provider actually signed with.",
      "Reading custom claims such as roles or tenant IDs during integration work.",
      "Teaching someone why a JWT payload is not a secret store.",
    ],
    tips: [
      "Never put anything sensitive in a JWT payload; it is readable by design.",
      "Reject the none algorithm explicitly rather than relying on a library default.",
      "Keep access token lifetimes short and refresh them, rather than issuing long-lived tokens with broad claims.",
    ],
  },
  "image-resizer": {
    intro:
      "The Image Resizer changes the pixel dimensions of an image by drawing it onto a canvas at the new size and exporting the result. Because the work happens in your browser, the file never leaves your machine, which makes it usable for screenshots and photos you would not upload to an unfamiliar server. Resizing down throws pixels away and generally makes a file smaller; resizing up invents pixels by interpolation and cannot add detail that was never captured, so a 400 pixel logo scaled to 1600 will look soft no matter which setting you choose.",
    howTo: [
      { step: "Choose an image", detail: "Drop a PNG, JPEG, WebP or GIF file onto the page. Each image is processed separately, so you can work through a batch one file at a time." },
      { step: "Set the target width or height", detail: "Enter one dimension and the other follows if the aspect ratio lock is on. Turning the lock off lets you force an exact box, which stretches the image." },
      { step: "Choose the output format", detail: "JPEG for photographs and anything where a small file matters, PNG when you need transparency or lossless edges, WebP for the best size-to-quality ratio on the modern web." },
      { step: "Adjust quality for lossy formats", detail: "For JPEG and WebP, somewhere between 75 and 85 is usually indistinguishable from the original at normal viewing size while cutting the file size dramatically." },
      { step: "Download the result", detail: "The resized file downloads with its original name and the new dimensions appended, so you can compare it against the source." },
    ],
    faq: [
      { q: "Is my image uploaded to a server?", a: "No. The file is read with the browser's FileReader API and drawn to a canvas element in memory. Nothing is transmitted, which is why the tool works on a plane and why there is no upload size limit beyond your available memory." },
      { q: "Why did my photo come out rotated?", a: "Cameras record orientation in an EXIF tag rather than rotating the pixels. Some viewers honour the tag and some ignore it. Modern browsers apply it when drawing to a canvas, so the output is usually upright, but if yours is not, the source file has an unusual orientation flag." },
      { q: "What size should an image be for a website?", a: "Roughly the largest size it will ever be displayed at, multiplied by two for high-density screens. A hero image displayed at 1200 pixels wide should be about 2400 pixels wide. Anything larger is bytes the visitor downloads and never sees." },
      { q: "Does resizing always reduce the file size?", a: "Almost always when shrinking, because there are fewer pixels to encode. It is not guaranteed: a resized PNG can grow if the new dimensions interact badly with its compression. Convert to WebP or lower the JPEG quality if the output is unexpectedly large." },
      { q: "Can I keep transparency?", a: "Yes, with PNG or WebP output. JPEG has no alpha channel, so transparent areas are filled with white and the edges become visible." },
      { q: "Why does the resized image look softer than the original?", a: "Because downscaling averages neighbouring pixels, which blurs fine detail slightly. That is normal and usually invisible at the intended display size. Only upscaling produces the obvious softness that cannot be fixed." },
    ],
    useCases: [
      "Shrinking a 4000 pixel camera photo before attaching it to an email.",
      "Producing a 1200 pixel wide version of a screenshot for documentation.",
      "Cutting product images down to a consistent size for a store listing.",
      "Reducing a heavy PNG to WebP so a page loads faster.",
    ],
    tips: [
      "Resize before compressing rather than after; there is no point spending quality on pixels you are about to discard.",
      "Keep the original. Every save of a lossy format loses a little more, so re-edit from the source, not from the export.",
      "Match the aspect ratio to the slot the image will occupy, so the browser does not have to crop it.",
    ],
  },
  "color-converter": {
    intro:
      "The Color Converter translates a single colour between HEX, RGB, HSL and HSV, and shows the WCAG contrast ratio against black and white so you can see immediately whether text in that colour is readable. HEX and RGB are the formats you copy between tools, but HSL is the one that is actually useful for design work: it separates hue from lightness, so you can produce a tint or a shade that keeps the same hue instead of drifting towards grey the way naive RGB maths does. Eight-digit hex and rgba values carry an alpha channel, and the converter handles those as well.",
    howTo: [
      { step: "Enter the colour in any format", detail: "Paste a hex value such as 2f6fed, or an rgb or hsl function, or use the picker. The other formats update as you type." },
      { step: "Read all the representations at once", detail: "Hex, RGB, HSL and HSV are shown together with the alpha channel separated out." },
      { step: "Check the contrast ratios", detail: "Ratios against black and white tell you whether the colour is usable as a text colour or a background. Body text needs 4.5 to 1, large text and interface borders need 3 to 1." },
      { step: "Copy the form your code needs", detail: "Each field has its own copy button, so you get exactly the syntax your stylesheet expects rather than reformatting by hand." },
    ],
    faq: [
      { q: "How is a hex colour converted to RGB?", a: "Each pair of hex digits is one channel, read as base 16. In 2f6fed, 2f is 47 red, 6f is 111 green and ed is 237 blue. Three-digit shorthand like f0a doubles each digit, so it becomes ff00aa." },
      { q: "Why is HSL lightness not the same as perceived brightness?", a: "Because the eye is far more sensitive to green than to blue. Pure blue and pure yellow can share a lightness value while yellow appears much brighter. That is why contrast has to be measured with a luminance formula rather than judged from the HSL number." },
      { q: "What does the fourth pair of digits in a hex colour mean?", a: "Alpha, from 00 fully transparent to ff fully opaque. Eight-digit hex is supported in all current browsers and is the hex equivalent of rgba." },
      { q: "Is the CMYK conversion accurate for print?", a: "No, and no browser tool can be. CMYK depends on the ink, the paper and the printer profile. Use this value as a starting point and convert through your print supplier's ICC profile for anything that matters." },
      { q: "How do I pick readable text for a coloured background?", a: "Compare the contrast ratio between the text colour and the background. If neither black nor white reaches 4.5 to 1, the background is too saturated for body text and needs to be darkened or lightened before it is used behind copy." },
      { q: "Why does the same hex look different on two screens?", a: "Because displays differ in gamut, calibration and brightness. A wide-gamut screen shows saturated colours that a standard sRGB panel cannot reproduce. Work in sRGB unless you have a specific reason not to." },
    ],
    useCases: [
      "Turning a brand hex value into the rgb syntax a design tool expects.",
      "Producing a consistent set of shades from one brand hue using HSL.",
      "Checking whether a link colour is readable on a dark background.",
      "Matching a colour picked from a screenshot to the nearest hex value.",
    ],
    tips: [
      "Adjust lightness in HSL rather than adding white or black in RGB; the hue stays intact.",
      "Test contrast at the smallest size the text will actually be used at, not at heading size.",
      "Keep a documented palette of five or six values instead of inventing a new one per component.",
    ],
  },
  "markdown-preview": {
    intro:
      "The Markdown Preview renders your Markdown as you type, in a side-by-side view, following CommonMark with the GitHub extensions most people actually use: tables, task lists, fenced code blocks, strikethrough and autolinks. It is the quickest way to check a README before committing it, because the differences between what Markdown looks like in source and what it looks like rendered are not obvious, and table syntax in particular fails silently when a single pipe or dash is wrong. The rendered HTML can also be copied out if you need it somewhere that does not process Markdown itself.",
    howTo: [
      { step: "Paste or write your Markdown", detail: "The editor accepts anything from a single paragraph to a full document with headings, lists, links and code fences." },
      { step: "Watch the rendered panel", detail: "The preview updates on every keystroke, so a broken table or an unclosed fence shows up immediately rather than after a publish step." },
      { step: "Fix the source, not the preview", detail: "The preview is read-only. When something renders wrongly, the cause is almost always a missing blank line before a list or a table header without a delimiter row." },
      { step: "Copy the HTML if you need it", detail: "Switch to the HTML view to take the generated markup, which is useful for pasting into a CMS that expects HTML rather than Markdown." },
    ],
    faq: [
      { q: "Which Markdown specification is used?", a: "CommonMark as the base, plus the GitHub Flavored Markdown extensions for tables, task lists, fenced code and strikethrough. That combination covers the README format on GitHub, GitLab and most documentation sites." },
      { q: "Why is my table not rendering?", a: "A table needs a header row followed immediately by a delimiter row of dashes, with a blank line before the block. Each row must have the same number of pipes as the header. Any one of those missing turns the whole thing into a paragraph of text with pipe characters in it." },
      { q: "Why did my list items merge into one paragraph?", a: "Markdown needs a blank line between a paragraph and a list that follows it. Without it, the list markers are treated as ordinary text." },
      { q: "Does it support LaTeX or math?", a: "No. Math rendering needs a separate library such as KaTeX or MathJax and a different syntax. A dollar-sign expression here will render as plain text." },
      { q: "Is raw HTML allowed?", a: "Yes, inline HTML passes straight through, which is what GitHub does as well. If you publish the output anywhere public, sanitise it first, because raw HTML is also how scripts get injected." },
      { q: "Where does my text go?", a: "Nowhere. Parsing and rendering happen in your browser with a JavaScript Markdown library. Nothing is saved or transmitted, so the draft is gone when you close the tab unless you copy it out." },
    ],
    useCases: [
      "Checking a README renders correctly before pushing it.",
      "Drafting release notes or a changelog with a live view of the result.",
      "Converting a Markdown document to HTML for a CMS that does not accept Markdown.",
      "Reviewing someone else's Markdown pull request and seeing what it will look like.",
    ],
    tips: [
      "Leave a blank line before and after every block element; most mystifying rendering bugs are a missing blank line.",
      "Use fenced code blocks with a language name so the code is highlighted rather than treated as plain text.",
      "Keep one sentence per line in long documents; it makes the diffs readable later.",
    ],
  },
  "diff-checker": {
    intro:
      "The Diff Checker compares two blocks of text line by line and marks what was added, what was removed and what stayed the same, using a longest-common-subsequence comparison to find the smallest sensible set of changes. It is built for the cases where eyeballing two versions stops working: a configuration file that drifted between staging and production, a contract where a paragraph moved, or two CSV exports that should be identical but are not. Because the comparison is line-based, a single edited character marks the whole line as changed, which is the right behaviour for code and the wrong one for prose.",
    howTo: [
      { step: "Paste the original text", detail: "The left pane is usually the older or reference version. Line endings are normalised, so Windows and Unix files can be compared directly." },
      { step: "Paste the changed text", detail: "The right pane holds the version you want to check against it. Order does not affect correctness, only the direction of the additions and removals." },
      { step: "Choose how strict to be", detail: "Ignore whitespace when indentation or trailing spaces have changed without meaning anything. Ignore case when the difference between Name and name is not the point." },
      { step: "Work through the marked lines", detail: "Green lines exist only on one side, red only on the other. Blank lines shifting position usually account for a large block of apparent changes, which is a sign that something was inserted above." },
    ],
    faq: [
      { q: "How is the comparison made?", a: "It is a line-based longest-common-subsequence diff, the same family of algorithm used by version control. It finds the largest set of lines the two texts share and everything outside that set is reported as removed or added." },
      { q: "Why does changing one character highlight the entire line?", a: "Because the comparison works at line granularity. Word-level diffs exist and are better for prose, but for code and configuration a whole-line marker is more honest about what changed." },
      { q: "Can I ignore whitespace or letter case?", a: "Yes, both are optional toggles. Ignoring whitespace is essential when comparing files produced on different operating systems or by editors that trim trailing spaces automatically." },
      { q: "Can I compare whole files?", a: "Paste their contents. Nothing is uploaded and no file is stored, which keeps the tool safe for configuration containing credentials, but it also means very large files are limited by the memory of the tab." },
      { q: "Can it compare binary files or images?", a: "No. Only text is meaningful here. Binary comparison needs a hash, which the hash generator produces for a quick equality check." },
    ],
    useCases: [
      "Confirming that staging and production configuration files match.",
      "Reviewing exactly what changed between two versions of a document.",
      "Finding the rows that differ between two exports of the same report.",
      "Checking that a find-and-replace did not touch anything unforeseen.",
    ],
    tips: [
      "Normalise both sides first, for example by sorting, so a reorder does not hide the real changes.",
      "Compare before and after a refactor to confirm only the intended lines moved.",
      "If the diff is enormous, the files probably differ in line endings rather than content.",
    ],
  },
  "csv-to-json": {
    intro:
      "The CSV to JSON converter turns a comma-separated file into an array of objects, using the header row as the property names. It handles the parts of the format that break naive splitting: fields wrapped in quotes that contain commas, embedded newlines inside quoted fields, escaped double quotes, and the byte-order mark that spreadsheet exports put at the start of the file. The output can be an array of objects, which is what most APIs want, or an array of arrays, which preserves column order and is better for feeding a chart library.",
    howTo: [
      { step: "Paste the CSV", detail: "Include the header row. Pasting from a spreadsheet works, as long as the cells are separated by commas, tabs or semicolons." },
      { step: "Set the delimiter if it is not a comma", detail: "European spreadsheet exports often use semicolons, and clipboard copies use tabs. Choosing the wrong one produces one column containing everything." },
      { step: "Decide on type coercion", detail: "Left off, every value stays a string, which preserves leading zeros in postcodes and account numbers. Turned on, numbers and booleans become real JSON types." },
      { step: "Choose the output shape", detail: "Objects keyed by header name for API payloads, or nested arrays for tools that expect rows without headers." },
      { step: "Copy the JSON", detail: "The result is pretty-printed, so you can scan it for an obviously mis-parsed column before using it." },
    ],
    faq: [
      { q: "Why did 007 become 7?", a: "Because numeric coercion turns the string into a number. Leading zeros are not part of a number, so they disappear. If the column holds identifiers, postcodes or phone numbers, leave coercion off and keep everything as strings." },
      { q: "How are commas inside a field handled?", a: "By quoting. The CSV format, defined in RFC 4180, allows a field to be wrapped in double quotes, and anything inside those quotes, including commas and line breaks, belongs to the field. A literal double quote inside a quoted field is written twice." },
      { q: "What if my CSV has no header row?", a: "Add one, or the first data row will be consumed as the property names. Naming columns explicitly is also useful when you want JSON keys that differ from the original headings." },
      { q: "Why does the first column name look strange?", a: "Almost always a byte-order mark left by Excel. It is invisible in the spreadsheet but becomes part of the first heading. Strip it, or re-save the file as UTF-8 without a BOM." },
      { q: "How large a file can this handle?", a: "It is limited by the memory available to the browser tab, so a few megabytes is comfortable and tens of megabytes starts to lag. For routine large conversions, a command-line tool is the better choice." },
    ],
    useCases: [
      "Turning a spreadsheet export into a payload an API will accept.",
      "Preparing seed data for a database from a client's list.",
      "Converting a report into a format a chart library can read.",
      "Checking that quoted fields were parsed the way you expected before importing.",
    ],
    tips: [
      "Keep identifiers as strings; coercion is only safe on columns you know are genuinely numeric.",
      "Normalise header names to camelCase or snake_case before converting, so downstream code does not have to deal with spaces.",
      "Validate the JSON before shipping it; a silently mis-parsed column is harder to find after import than before.",
    ],
  },
  "sql-formatter": {
    intro:
      "The SQL Formatter rewrites a query with consistent keyword casing, one clause per line and indented subqueries, which makes the structure of a long statement visible at a glance. That matters most when a query has several joins and a nested aggregate, because unformatted SQL hides the join conditions in a wall of text and mistakes there produce wrong results rather than errors. Formatting only touches whitespace and keyword case, so the query means exactly the same thing afterwards, but it does not validate the SQL: a query with a misspelled column name will still format perfectly.",
    howTo: [
      { step: "Paste the query", detail: "Any length works. Minified output from an ORM or a log line with escaped newlines is the usual input." },
      { step: "Choose a dialect", detail: "Dialects differ in identifier quoting, string concatenation and pagination syntax. Picking the right one keeps backticks or double quotes intact instead of escaping them." },
      { step: "Pick a keyword case", detail: "Uppercase keywords such as SELECT and WHERE with lowercase identifiers is the common convention, and it separates language from your own names at a glance." },
      { step: "Format, then read the structure", detail: "Each clause should start on its own line. If a join condition appears in the wrong place after formatting, it was in the wrong place before." },
    ],
    faq: [
      { q: "Does formatting validate my SQL?", a: "No. It is a lexical transformation that understands keywords and quoting rules but does not know your schema. Run the query against a database or a linter to check it is valid." },
      { q: "Will formatting change what the query does?", a: "It should not, because only whitespace outside string literals and the case of keywords are changed. Identifier case is significant in some databases, which is why the dialect setting matters." },
      { q: "Why did my string literal get mangled?", a: "Usually an unbalanced quote. If a single quote inside a string is not escaped by doubling it, the formatter treats the rest of the query as part of the literal." },
      { q: "Which dialect should I choose?", a: "The one the query will actually run on. MySQL uses backticks for identifiers, PostgreSQL and SQL Server use double quotes and brackets respectively, and pagination syntax differs between LIMIT and TOP." },
      { q: "Can I use this to make a query compact instead?", a: "Yes, the reverse direction exists. When a query is going into a log line or a URL, minifying removes the newlines without changing the semantics." },
    ],
    useCases: [
      "Making a query pasted from an application log readable before debugging it.",
      "Standardising formatting across a team so reviews focus on logic rather than whitespace.",
      "Expanding a one-line ORM-generated query to see which joins it actually produced.",
      "Preparing SQL for documentation or a ticket.",
    ],
    tips: [
      "Format first, then read the join order; a misplaced ON clause is much easier to see with one clause per line.",
      "Keep one statement per block so the formatted output is not ambiguous.",
      "Do not format inside a migration file that has already been applied; the diff will be noise.",
    ],
  },
  "age-calculator": {
    intro:
      "The Age Calculator gives your exact age in years, months and days, plus the total number of days lived and a countdown to the next birthday. The reason it is not simply a subtraction of two years is that months have different lengths and birthdays fall on different days, so a naive calculation is wrong by a day or a month for most of the year. It also answers the question that forms and legal documents actually ask: your age on a specific date, which is not the same as your age today and cannot be produced by subtracting years alone.",
    howTo: [
      { step: "Enter the date of birth", detail: "Use the calendar field rather than typing, which avoids ambiguity between day-first and month-first formats." },
      { step: "Optionally set a reference date", detail: "Leaving it empty uses today. Setting it answers questions such as age at a future exam date or on a historical date." },
      { step: "Read the breakdown", detail: "Years, months and days are shown separately, with the total days and weeks below. The year and month figures are what most forms want." },
      { step: "Check the next birthday", detail: "The countdown is useful for planning, and it also reveals the leap-day case: a 29 February birthday falls on 1 March in non-leap years in most jurisdictions." },
    ],
    faq: [
      { q: "Why is my age not just this year minus my birth year?", a: "Because that only counts completed years if your birthday has already passed this year. If it has not, you are one year younger than the subtraction suggests. The calculator compares month and day as well as year." },
      { q: "How are leap days handled?", a: "For someone born on 29 February, the birthday exists only every fourth year. Most legal systems treat 1 March as the anniversary in common years, some use 28 February. The countdown here uses 1 March, and the year count is unaffected either way." },
      { q: "What is the difference between chronological and corrected age?", a: "For a premature baby, chronological age counts from birth while corrected age counts from the expected due date. Paediatric growth charts use corrected age until about two years. This tool reports chronological age." },
      { q: "Does the first day count as day one?", a: "This calculator counts elapsed time, so the day of birth is day zero. Some East Asian traditions count the birth day as day one, which makes everyone a year older by that convention. Both are self-consistent; just be clear which one a form expects." },
      { q: "Why does the total day count differ from what I calculated?", a: "Because of leap years. Every four years adds a day, with century years skipped unless divisible by 400. The total here counts actual calendar days between the two dates rather than multiplying years by 365." },
      { q: "Can I use this for legal or medical purposes?", a: "As a cross-check, yes. For anything with a deadline attached, calculate from the statutes that apply, which sometimes define age differently for specific purposes, and confirm the result on the official form." },
    ],
    useCases: [
      "Filling in an age field on a form that wants years and months.",
      "Checking whether someone meets an age requirement on a given date.",
      "Working out how many days until a birthday for planning.",
      "Converting a date of birth into total days for a data migration.",
    ],
    tips: [
      "For a form, use the years figure only; adding months invites disagreement with the reviewer.",
      "When an age requirement applies on a specific date, set that date as the reference rather than using today.",
      "If two sources disagree by exactly one day, check whether one of them counts elapsed time and the other counts inclusive days.",
    ],
  },
  "loan-calculator": {
    intro:
      "The Loan Calculator works out the fixed monthly payment on an amortising loan, the total interest paid over the whole term, and how each payment splits between interest and principal. That split is the part people underestimate: on a long mortgage the early payments are mostly interest, so the balance barely moves for the first few years, and adding a small extra amount to each payment cuts the term by far more than the extra amount suggests. Entering a different term or rate shows immediately how much a shorter term saves in interest against how much more it costs per month.",
    howTo: [
      { step: "Enter the amount borrowed", detail: "The principal only, not the purchase price. If there is a deposit, subtract it first." },
      { step: "Enter the annual interest rate", detail: "Use the nominal annual rate the lender quotes, before any arrangement fee. A rate quoted as monthly should be multiplied by twelve." },
      { step: "Set the term in years", detail: "The term drives the payment size more than anything else. Doubling the term roughly halves the payment but increases total interest substantially." },
      { step: "Read the payment and the total", detail: "The monthly figure is what the lender will collect; the total interest is what the loan actually costs on top of the principal." },
      { step: "Compare two scenarios", detail: "Change one variable at a time and note the difference in both the monthly payment and the total interest. That trade-off is the actual decision." },
    ],
    faq: [
      { q: "What formula is used?", a: "The standard amortisation formula: payment equals principal times the monthly rate, divided by one minus one plus the monthly rate raised to the negative number of payments. The monthly rate is the annual rate divided by twelve." },
      { q: "Why is the total interest so much larger than the amount borrowed?", a: "Because interest is charged on the outstanding balance every month for the whole term. At 6 percent over 30 years, the total interest on a large loan approaches the principal itself. Shorter terms reduce it sharply, which is why the term matters as much as the rate." },
      { q: "Why are early payments mostly interest?", a: "Interest is calculated on the balance, and the balance is at its highest at the start. As the principal falls, the interest portion falls with it and more of each payment goes to principal. This is not a lender trick, it is how amortisation works." },
      { q: "What is the difference between the interest rate and the APR?", a: "The interest rate covers the cost of borrowing the money. The APR also includes mandatory fees, so it is the better number for comparing two offers. A low rate with a large arrangement fee can be worse than a slightly higher rate without one." },
      { q: "Does it account for extra payments?", a: "The scheduled payment calculation assumes none. To see the effect of overpaying, reduce the term until the payment matches what you would actually pay, which approximates the same outcome." },
      { q: "Why is my bank's payment slightly different?", a: "Rounding, fees added to the principal, daily rather than monthly interest accrual, and insurance bundled into the payment all shift the figure. Use this as a planning estimate and the lender's schedule as the authority." },
    ],
    useCases: [
      "Comparing a 20-year and a 30-year term on the same amount.",
      "Checking whether a refinance offer at a lower rate actually saves money after fees.",
      "Working out how much of the first year's payments goes to interest rather than principal.",
      "Estimating a monthly commitment before applying.",
    ],
    tips: [
      "Compare offers on APR, not on the headline rate.",
      "Look at total interest, not just the monthly payment; a longer term always looks cheaper per month and usually costs more overall.",
      "Even a small regular overpayment early in the term has a disproportionate effect, because it removes interest from every subsequent month.",
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
