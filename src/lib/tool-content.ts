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
  "text-case-converter": {
    intro:
      "The Text Case Converter rewrites text as UPPERCASE, lowercase and Title Case in one pass, so you can compare the three and pick the one a style guide actually wants. The tricky one is Title Case: every style guide capitalises it differently. This tool applies the common rule, capitalising each word and lowercasing the rest, which means it will also capitalise short words such as and, of and the. If your house style keeps those lowercase, run the result through your own list of exceptions afterwards.",
    howTo: [
      { step: "Paste your text", detail: "Whole headings, a list of names, or a paragraph all work. Line breaks are preserved in each version." },
      { step: "Convert", detail: "All three variants are produced at once rather than making you choose in advance." },
      { step: "Pick the variant you need", detail: "Copy just the block you want, or take the whole output and delete what you do not need." },
      { step: "Fix title-case exceptions", detail: "If your style keeps articles, short prepositions and conjunctions lowercase, correct those words by hand. It is usually a handful per heading." },
    ],
    faq: [
      { q: "Which Title Case rule is used?", a: "The simple rule: capitalise the first letter of every word and lowercase the rest. That matches neither AP nor Chicago exactly, because both keep short function words lowercase. Use SENTENCE CASE or correct the small words afterwards if you are publishing to a strict style guide." },
      { q: "Why did the word iPhone come out as Iphone?", a: "Because capitalisation rules operate on letters, not brands. Any word with deliberate internal capitalisation, such as iPhone, eBay or monday.com, needs restoring by hand." },
      { q: "Does it handle accents and non-Latin scripts?", a: "Latin letters with diacritics are handled by the browser's own case mapping. Scripts without case, such as Chinese, Japanese and Arabic, pass through unchanged, which is correct." },
      { q: "Can I convert only part of the text?", a: "Paste only that part. The tool has no selection mode, so the input is treated as one block." },
      { q: "Is the text uploaded anywhere?", a: "No. Case conversion uses the browser's own toUpperCase and toLowerCase, so the text never leaves your device." },
    ],
    useCases: [
      "Converting a list of headings into the casing a style guide requires.",
      "Turning SHOUTING text from a legacy system into something readable.",
      "Normalising a batch of database values before importing them.",
      "Preparing alt text or labels that need consistent capitalisation.",
    ],
    tips: [
      "For SEO titles, sentence case reads better and avoids the exception list entirely.",
      "Avoid ALL CAPS for anything longer than a few words; it measurably slows reading.",
      "Convert before you insert text into a design tool, so you do not have to redo it per frame.",
    ],
  },
  "duplicate-line-remover": {
    intro:
      "The Duplicate Line Remover deletes repeated lines from a block of text, keeping the first occurrence of each line and dropping every later copy. Order is preserved, so the remaining list keeps the sequence you originally had, which matters when the list is a set of steps or a timeline. Comparison is exact: two lines that differ by a single trailing space are two different lines, so trimming whitespace first is the usual fix when the result looks wrong.",
    howTo: [
      { step: "Paste your list", detail: "One item per line. Anything separated by commas or spaces needs splitting into lines first." },
      { step: "Trim whitespace if needed", detail: "Run the text through Text Trimmer before deduplicating. A trailing space is enough to make two identical-looking lines count as different." },
      { step: "Remove duplicates", detail: "The output contains each distinct line exactly once, in the order it first appeared." },
      { step: "Compare the counts", detail: "Counting the lines before and after tells you how many duplicates there were, which is often the actual answer you wanted." },
    ],
    faq: [
      { q: "Which copy is kept?", a: "The first occurrence. Every later identical line is removed. If you need the last occurrence instead, reverse the list first, deduplicate, then reverse it back." },
      { q: "Why are two identical-looking lines still both there?", a: "Because they are not actually identical. Invisible differences such as a trailing space, a tab, or a Windows carriage return on one line only will keep them distinct. Trim first." },
      { q: "Is the comparison case-sensitive?", a: "Yes. Apple and apple are treated as two different lines. Convert the case first if you want them merged." },
      { q: "Can it remove duplicates within a single line?", a: "No. This works line by line. For repeated words inside one paragraph you need a different approach." },
      { q: "How large a list can it handle?", a: "It is bounded by the memory of your browser tab. Lists of tens of thousands of lines are fine; millions are not." },
    ],
    useCases: [
      "Cleaning a list of email addresses or IDs before a bulk import.",
      "Finding how many unique values a column actually contains.",
      "Removing repeated log lines before pasting them into a ticket.",
      "Deduplicating a list of URLs collected from several sources.",
    ],
    tips: [
      "Always trim whitespace before deduplicating, not after.",
      "Sort first if you want to see the duplicates grouped together; sort after if you want the original order preserved.",
      "Keep the original list until you have checked the line counts, because the operation cannot be undone.",
    ],
  },
  "url-encoder": {
    intro:
      "The URL Encoder converts text into percent-encoded form so it survives being put in a URL, and decodes it again when you are staring at something like %E4%BD%A0%E5%A5%BD and want to know what it says. Characters such as spaces, ampersands, question marks and non-ASCII letters all have special meaning inside a URL, so passing them through raw breaks the link or, worse, silently changes what the server receives. Encoding replaces each unsafe character with a percent sign followed by two hex digits.",
    howTo: [
      { step: "Choose a direction", detail: "Encode turns readable text into percent-encoded form; decode turns it back." },
      { step: "Paste the text", detail: "For encoding, paste the value you want to put in a query string. For decoding, paste the whole percent-encoded fragment." },
      { step: "Convert", detail: "The result appears immediately. If decoding fails, the input was not valid percent-encoded data." },
      { step: "Copy it into your URL", detail: "Encoded values go after the question mark as name=value pairs, joined with ampersands." },
    ],
    faq: [
      { q: "Why did a space become %20 instead of a plus sign?", a: "Because this uses encodeURIComponent, which follows the modern standard and produces %20. The plus sign meaning space is a form-submission convention that only applies to application/x-www-form-urlencoded bodies, not to path or query segments in general." },
      { q: "Why does decoding fail on my string?", a: "Usually because a percent sign is followed by something that is not two hex digits. That happens when a string was encoded twice, or when it was cut off mid-character. Decode one layer at a time." },
      { q: "Does it encode an entire URL at once?", a: "It encodes a component, not a whole URL. If you pass a complete URL through it, the slashes, colons and question marks will also be encoded, producing something the browser can no longer use. Encode individual parameter values instead." },
      { q: "What about UTF-8 characters such as Chinese or emoji?", a: "They are encoded as their UTF-8 bytes, so one character becomes several percent-escaped triplets. That is correct and every server that expects UTF-8 will read it back properly." },
      { q: "Is the slash encoded?", a: "Yes, encodeURIComponent encodes the slash. That is deliberate: a slash inside a parameter value must not be mistaken for a path separator." },
    ],
    useCases: [
      "Building a search or filter URL with a value containing spaces.",
      "Reading a percent-encoded string copied from an address bar or a log.",
      "Preparing a value for an API call that requires query encoding.",
      "Checking why a link with an ampersand in a parameter broke.",
    ],
    tips: [
      "Encode each parameter value separately, never the whole URL.",
      "If a value looks wrong on the server, check whether it was encoded twice.",
      "Remember the difference: %20 for URLs, plus for form bodies.",
    ],
  },
  "md5-generator": {
    intro:
      "The Hash Generator computes MD5, SHA-1, SHA-256 and SHA-512 digests of any text, in your browser, and shows all four at once so you can compare them. A hash is a fixed-length fingerprint: the same input always gives the same output, and changing one character produces a completely different digest. That makes it useful for verifying downloads and for reproducing a value a system expects. It is emphatically not encryption, because a hash cannot be reversed, and MD5 and SHA-1 are no longer considered safe against deliberate collision attacks.",
    howTo: [
      { step: "Enter the text", detail: "Paste anything from a single word to a whole document. Whitespace and capitalisation are part of the input, so an extra space changes the result." },
      { step: "Generate", detail: "All four digests are computed at once. MD5 runs locally in JavaScript; the SHA family uses the browser's own crypto.subtle implementation." },
      { step: "Compare against the published value", detail: "A checksum matches exactly or it does not. There is no partial match and no tolerance." },
      { step: "Copy the digest you need", detail: "Each row has its own copy button, so you get the right algorithm without re-reading the list." },
    ],
    faq: [
      { q: "Can a hash be reversed?", a: "No. A digest throws away information: SHA-256 compresses arbitrarily long input into 256 bits. The only way back is to guess inputs and compare, which is why hashing is not encryption and must not be used to store recoverable secrets." },
      { q: "Is MD5 safe to use?", a: "Not for security. Practical collision attacks against MD5 have existed for years, and SHA-1 collisions have been demonstrated publicly. Use MD5 only for non-adversarial checksums, legacy compatibility, or matching a value an old system already produced. For anything security related use SHA-256 or SHA-512, and for passwords use bcrypt, scrypt or Argon2 with a salt." },
      { q: "Why does my hash not match the one on the download page?", a: "Almost always because the input differs. A trailing newline, a different line ending, or a BOM at the start of the file all change the digest. Hash the exact bytes, not a retyped copy." },
      { q: "How is a file checksum different from this?", a: "This tool hashes text you paste. A file checksum hashes the raw bytes on disk. For a large file, use a command-line tool such as sha256sum rather than pasting the contents." },
      { q: "Is the text sent to a server?", a: "No. MD5 is computed in JavaScript here and the SHA family uses the browser's Web Crypto API, so the input never leaves your device. That is why you can safely hash credentials you are testing with." },
      { q: "What does the hash length mean?", a: "It is fixed per algorithm: 32 hex characters for MD5, 40 for SHA-1, 64 for SHA-256 and 128 for SHA-512. A longer digest means a larger output space, not a stronger guarantee by itself." },
    ],
    useCases: [
      "Verifying a downloaded file against a published checksum.",
      "Reproducing a hash value that an API signature requires.",
      "Checking that two copies of a string are byte-identical.",
      "Learning how a single character change alters an entire digest.",
    ],
    tips: [
      "Never use a plain hash for passwords; use a salted, slow key-derivation function.",
      "Match the algorithm to what the other system expects; a correct SHA-256 is still wrong if MD5 was requested.",
      "Watch for trailing newlines when a checksum does not match.",
    ],
  },
  "bmi-calculator": {
    intro:
      "The BMI Calculator takes a weight in kilograms and a height in metres and returns the Body Mass Index along with the standard category. BMI is weight divided by height squared, so it is a screening number rather than a diagnosis: it says nothing about muscle, bone density or fat distribution, which is why a heavily muscled person can land in the overweight band while carrying very little fat. It remains useful as a population-level indicator and as a quick personal reference, and it is the number most health forms ask for.",
    howTo: [
      { step: "Choose your units", detail: "Switch between metric, kilograms and centimetres, and imperial, pounds, feet and inches. The result is the same either way." },
      { step: "Enter weight and height", detail: "Fill in the two or three fields. The result updates as you type, so there is no calculate button to press." },
      { step: "Read the category", detail: "Under 18.5 is underweight, 18.5 to 24.9 is normal, 25 to 29.9 is overweight, and 30 or above is obese. The thresholds are shown under the result." },
      { step: "Copy the summary", detail: "The result block contains the weight and height in metric along with the BMI and its category, ready to paste into a form or a note." },
    ],
    faq: [
      { q: "What is the formula?", a: "BMI equals weight in kilograms divided by height in metres squared. At 70 kilograms and 1.75 metres that is 70 divided by 3.0625, which is 22.9." },
      { q: "Why does BMI say I am overweight when I am fit?", a: "Because BMI cannot distinguish muscle from fat. Muscle is denser than fat, so people with high lean mass, particularly athletes, regularly score in the overweight band. Waist measurement or body-fat percentage is more informative for them." },
      { q: "Is the same scale used everywhere?", a: "The formula is the same worldwide, but some countries adjust the category thresholds for their population. Several Asian countries use lower cut-offs because health risks appear at lower BMI in those populations." },
      { q: "Does it work for children?", a: "No. Children need age and sex adjusted percentiles, because body composition changes through growth. Use a paediatric growth chart instead of an adult BMI number." },
      { q: "How precise is the result?", a: "To one decimal place, which is more precision than the input usually justifies. Body weight fluctuates by a kilogram or more over a day, so treat the number as a rough indicator rather than a measurement." },
      { q: "Is my data recorded?", a: "No. The arithmetic happens in your browser and nothing is transmitted or stored." },
    ],
    useCases: [
      "Checking a figure for a health or insurance form.",
      "Converting imperial measurements into a metric BMI.",
      "Tracking a general trend over months rather than days.",
      "Sanity-checking a number produced by another app.",
    ],
    tips: [
      "Measure in the morning under consistent conditions if you are tracking a trend.",
      "Treat BMI as one signal, not a verdict; waist-to-height ratio adds useful information.",
      "For clinical decisions, speak to a professional rather than relying on a screening number.",
    ],
  },
  "world-clock": {
    intro:
      "The World Clock shows the current time in your own timezone alongside UTC, New York, London and Tokyo, computed from your device clock and rendered in the target timezone. The point of having UTC in the list is that it is the unambiguous reference: when you arrange a meeting across three cities, agreeing on a UTC time and converting from there avoids the confusion of everyone naming their own local time. Daylight saving shifts are applied automatically, because the conversion uses the browser's timezone database rather than a fixed offset.",
    howTo: [
      { step: "Open the tool", detail: "It reads your device clock and updates every second, so make sure your own system time is correct first." },
      { step: "Read the cities you need", detail: "Your local time, UTC, New York, London, Paris, Berlin, Dubai, Beijing, Tokyo, Singapore, Sydney, Los Angeles and Sao Paulo are shown at once, each with its date and UTC offset." },
      { step: "Show or hide cities", detail: "Click any city button to hide it, and click again to bring it back. Useful when you only care about three of them." },
      { step: "Use UTC as the reference", detail: "When agreeing a time with people in several timezones, write down the UTC value and let everyone convert from that." },
      { step: "Re-read it when planning ahead", detail: "The clock shows the current time. For a future date, work out the offset from today and check it again closer to the day, because daylight saving may have shifted in between." },
    ],
    faq: [
      { q: "How is the time calculated?", a: "From your device clock, converted using the browser's built-in timezone database. That database includes historical and scheduled daylight saving rules, so the offsets are correct for the date in question." },
      { q: "Why is the time wrong?", a: "Because your own device clock is wrong. The tool has no independent time source; if your laptop is five minutes fast, every city shown will be five minutes fast." },
      { q: "Does it handle daylight saving automatically?", a: "Yes. New York and London move between standard and daylight time on their own schedules, and the conversion reflects that. This is exactly why a fixed offset such as UTC-5 is unreliable for future dates." },
      { q: "Why is Tokyo sometimes a day ahead?", a: "Because when it is Monday evening in London it is already Tuesday morning in Tokyo. Compare the date as well as the hour when scheduling across the Pacific." },
      { q: "Can I see a city that is not listed?", a: "Not here. The five shown cover the most commonly needed reference points; anything else needs a converter that accepts an arbitrary timezone." },
    ],
    useCases: [
      "Scheduling a call across Europe, North America and Asia.",
      "Checking whether it is already the next day somewhere before sending a message.",
      "Converting a UTC timestamp from a log into your local time.",
      "Working out whether a market or office abroad is open right now.",
    ],
    tips: [
      "Always state times as UTC in writing; it removes every ambiguity.",
      "Re-check a few days before a scheduled event if it crosses a daylight saving change.",
      "Compare dates, not just hours, when the cities are far apart.",
    ],
  },
  "pomodoro-timer": {
    intro:
      "The Pomodoro Timer runs the classic 25-minute focus block followed by a 5-minute break, and switches between the two automatically when one ends. The technique works because the fixed, short interval removes the decision of when to stop: you commit to 25 minutes, and the break is a scheduled reward rather than a lapse. The timer keeps counting in the tab it runs in, so leaving the page open while you work is what makes it useful.",
    howTo: [
      { step: "Start with the work block", detail: "The timer opens at 25 minutes in work mode. Press Start when you are ready to begin." },
      { step: "Work until it ends", detail: "Do not pause for anything that is not urgent. The point of the block is that it is uninterruptible." },
      { step: "Take the break", detail: "When the work block reaches zero, the timer switches itself to a 5-minute break. Actually stand up during it." },
      { step: "Switch manually if you prefer longer blocks", detail: "The Work and Break buttons jump straight to either mode. Many people settle on 50 and 10 once 25 feels too short." },
      { step: "Reset between sessions", detail: "Reset returns the current mode to its full length without switching modes." },
    ],
    faq: [
      { q: "Why 25 and 5?", a: "Those are the numbers from the original method, and they are short enough to feel non-threatening. They are not sacred; if your work has a longer natural rhythm, 50 and 10 or 90 and 20 work just as well." },
      { q: "Does it keep running if I switch tabs?", a: "Yes, as long as the tab stays open. Browsers throttle timers in background tabs, so do not close the tab or minimise the browser for a long period and expect it to stay accurate." },
      { q: "Is there a sound at the end?", a: "No. It changes state and stops at zero, so keep the tab visible if you rely on noticing the switch." },
      { q: "Does it count completed sessions?", a: "No. It is a timer, not a tracker. If you want a record of how many blocks you did, keep a tally separately." },
      { q: "Can I pause?", a: "Yes. Pause stops the countdown, and Start resumes from where it stopped rather than restarting." },
    ],
    useCases: [
      "Breaking a task you have been avoiding into one manageable block.",
      "Forcing regular breaks during a long coding or writing session.",
      "Timeboxing email or admin so it does not consume the morning.",
      "Working with a team that all starts and stops at the same moment.",
    ],
    tips: [
      "Write down the single task for the block before you start it.",
      "Take the break even when you are in flow; that is what makes the next block possible.",
      "If 25 minutes consistently feels too short, change the length rather than abandoning the method.",
    ],
  },
  "morse-code": {
    intro:
      "The Morse Code Translator converts text to Morse code and Morse code back to text, choosing the direction automatically by looking at what you typed: input containing dots or dashes is decoded, anything else is encoded. Letters are separated by spaces and words by a forward slash, which is the conventional written form. Characters outside the standard alphabet and digits are marked with a question mark in brackets rather than silently dropped, so you can see what did not translate.",
    howTo: [
      { step: "Paste text or Morse", detail: "Plain text is encoded. Anything containing a dot or a dash is treated as Morse and decoded." },
      { step: "Understand the separators", detail: "A space between letters, and a slash between words. When decoding, each space-separated group is read as one character." },
      { step: "Translate", detail: "The result appears immediately. Unknown characters appear as [?] rather than being removed." },
      { step: "Check the separators if decoding looks wrong", detail: "The most common failure is missing spaces between letters, which makes the whole string unreadable as a sequence of characters." },
    ],
    faq: [
      { q: "How does it decide which way to translate?", a: "It looks for a dot or a dash in your input. If either is present the input is treated as Morse; otherwise it is treated as text. That means ordinary text containing a hyphen may be misread, so remove punctuation if you get a strange result." },
      { q: "Why do some characters come out as [?]", a: "Because they are outside the supported set. Standard Morse covers A to Z, 0 to 9 and a handful of punctuation marks. Accented letters and most symbols are not part of the code, so they cannot be represented." },
      { q: "What does the slash mean?", a: "A word separator. In Morse, the pause between words is longer than the pause between letters, and the slash is the written equivalent of that longer pause." },
      { q: "Is Morse still used?", a: "Yes, in aviation and maritime navigation, in amateur radio, and as an accessibility input method. It remains in the international distress signal SOS, which is three dots, three dashes, three dots with no letter gaps." },
      { q: "Does it handle lowercase input?", a: "Yes. Input is lowercased before encoding, and decoded output is produced as lowercase letters, which you can then capitalise yourself." },
    ],
    useCases: [
      "Encoding a message for a radio or a themed design.",
      "Decoding a Morse sequence from a puzzle or a capture-the-flag challenge.",
      "Learning the alphabet by comparing letters with their patterns.",
      "Checking whether a Morse sequence you transcribed is well formed.",
    ],
    tips: [
      "Keep exactly one space between letters and a space-slash-space between words.",
      "Remove hyphens and punctuation from plain text before encoding, so the direction is detected correctly.",
      "Learn E (dot) and T (dash) first; they are the building blocks of everything else.",
    ],
  },
  "caesar-cipher": {
    intro:
      "The Caesar Cipher shifts every letter in a message by a fixed number of places through the alphabet, wrapping around at Z back to A. It is the oldest documented cipher and still the clearest way to understand what substitution means, because the whole system is one number. Here you supply both the text and the shift: type your message, then a vertical bar, then the shift, for example hello|3. If you omit the shift, 3 is used, which is the value Caesar himself is said to have used. Treat it as a teaching tool and a puzzle device only; it is trivially breakable.",
    howTo: [
      { step: "Paste your text", detail: "Use the text area. There is no special input format to remember." },
      { step: "Choose encode or decode", detail: "Encoding shifts letters forwards. Decoding shifts them backwards by the same amount, so you do not have to work out the reverse shift yourself." },
      { step: "Set the shift", detail: "Drag the slider from 0 to 25, or click one of the shortcut buttons for ROT1, ROT3, ROT13 and ROT25." },
      { step: "Read the result", detail: "The output appears as you change anything, along with a note telling you which shift would undo it." },
      { step: "Try every shift if you do not know it", detail: "There are only 25 meaningful shifts, so sweeping the slider until the text looks like language is the whole of breaking this cipher." },
    ],
    faq: [
      { q: "Why is 3 the default?", a: "Because a shift of 3 is the one attributed to Julius Caesar in surviving accounts. It is a convention, not a mathematical requirement; any value from 1 to 25 works." },
      { q: "How do I decrypt without knowing the shift?", a: "Try all 25 shifts and read the results. That takes seconds by hand and is why this cipher offers no real security. Frequency analysis, looking at which letters appear most often, is the systematic version of the same idea." },
      { q: "Are spaces and punctuation encrypted?", a: "No. Only letters are shifted; digits, spaces and punctuation pass through unchanged. That is one reason the result is so easy to read once you know the method." },
      { q: "Does case survive?", a: "Yes. Uppercase letters are shifted within the uppercase alphabet and lowercase within the lowercase one, so capitalisation is preserved." },
      { q: "Is this secure enough to send a real secret?", a: "No, not remotely. It has 25 possible keys and no protection against frequency analysis. It is fine for puzzles, teaching and hiding spoilers from a casual glance." },
    ],
    useCases: [
      "Explaining how substitution ciphers work to someone learning.",
      "Solving or setting a puzzle or a geocache clue.",
      "Hiding a spoiler in plain sight from someone not paying attention.",
      "Checking a manual ROT13 or ROT-n result.",
    ],
    tips: [
      "Remember that a shift of 13 is its own inverse, which is why ROT13 is used for spoilers.",
      "To reverse any shift n, apply 26 minus n.",
      "Leave spaces and punctuation in place; they are what makes the result readable as a puzzle.",
    ],
  },
  "binary-text": {
    intro:
      "The Binary to Text converter translates text into binary and binary back into text, choosing the direction from what you paste: input made only of ones, zeros and spaces is decoded, anything else is encoded. Each character becomes one byte, shown as eight binary digits, and groups are separated by spaces so you can see where one character ends and the next begins. The eight-bit form is the one that matches how text is actually stored, and it is why you will see a leading zero at the start of every ordinary letter.",
    howTo: [
      { step: "Paste text or binary", detail: "Anything containing only 1, 0 and spaces is decoded; everything else is encoded." },
      { step: "Convert", detail: "Encoded output is one eight-digit group per character, separated by spaces." },
      { step: "Decode by pasting the groups", detail: "Keep the spaces between groups. Without them the string cannot be split into bytes and the conversion will fail." },
      { step: "Check for characters outside the range", detail: "Values above 127 depend on how the text was encoded in the first place, so accented characters and emoji may not survive a round trip." },
    ],
    faq: [
      { q: "Why eight digits per character?", a: "Because one byte is eight bits, and a single byte is the unit most text encodings are built on. That is why the letter A, which is 65, is written 01000001." },
      { q: "Why does every letter start with 0?", a: "Because standard ASCII values run from 0 to 127, and 127 in binary is 01111111. The top bit stays zero, so every ASCII character has a leading 0 in its eight-bit form." },
      { q: "Does it handle UTF-8 characters?", a: "Partly. Encoding goes character by character using the Unicode code point, so characters above 255 produce groups longer than eight bits. Decoding expects byte-sized groups. For accented text and emoji the conversion may not round-trip cleanly." },
      { q: "How do I read a byte by hand?", a: "Add the place values of the positions holding a 1, from left to right: 128, 64, 32, 16, 8, 4, 2, 1. So 01000001 is 64 plus 1, which is 65, the code for A." },
      { q: "Is this the same as hexadecimal?", a: "No, but they represent the same underlying numbers. Hexadecimal is a more compact way to write the same bytes, which is why long binary strings are usually shown as hex instead." },
    ],
    useCases: [
      "Learning how characters are represented as bytes.",
      "Decoding a binary string from a puzzle or an exercise.",
      "Checking what a byte value means without opening a calculator.",
      "Demonstrating why text encodings need a defined character set.",
    ],
    tips: [
      "Keep one space between each eight-bit group when decoding.",
      "For long data, use hexadecimal; it is four times shorter and far easier to read.",
      "If a decode produces nonsense, check that no group has more than eight digits.",
    ],
  },
  "url-parser": {
    intro:
      "The URL Parser breaks a web address into its parts and labels each one: protocol, host, port, path, query string and fragment. Reading a URL as a single string is what makes query parameters so easy to get wrong, because the question mark, the ampersand and the hash each have a specific meaning and the order matters. Splitting it out shows you exactly what the server will receive and what the browser will keep to itself, which is usually the answer when a link behaves unexpectedly.",
    howTo: [
      { step: "Paste a complete URL", detail: "Include the scheme. A bare domain such as example.com is not a valid URL and will be rejected; use https://example.com." },
      { step: "Parse it", detail: "Each component appears on its own line with its name." },
      { step: "Read the query string separately", detail: "Everything after the question mark is the query. Parameters are separated by ampersands and each is a name=value pair." },
      { step: "Note what is missing from the output", detail: "An empty port or fragment simply means the URL did not specify one. The default port is implied by the scheme: 443 for https, 80 for http." },
    ],
    faq: [
      { q: "Why does it reject my URL?", a: "Because it has no scheme. Parsing needs http:// or https:// at the front; without it there is no way to tell a host from a path. Add the scheme and try again." },
      { q: "What is the difference between the query and the fragment?", a: "The query, after the question mark, is sent to the server. The fragment, after the hash, is not: the browser keeps it locally and uses it to scroll to an element. That is why parameters placed after a hash never reach your server." },
      { q: "Why is the port empty?", a: "Because the URL did not state one. Browsers use the default for the scheme, 443 for https and 80 for http, so an empty port is normal rather than an error." },
      { q: "Does it decode percent-encoded values?", a: "No. It reports the query string exactly as it appears. Decode individual values with the URL Encoder if you need to read them." },
      { q: "Why did my ampersand disappear from a parameter value?", a: "Because an ampersand separates parameters. A literal ampersand inside a value has to be percent-encoded as %26, otherwise the parser is correct to treat it as a boundary." },
    ],
    useCases: [
      "Working out why a parameter is not reaching the server.",
      "Checking which host a shortened or redirected URL actually points at.",
      "Splitting a query string before rewriting it.",
      "Confirming a fragment was mistakenly used where a query was needed.",
    ],
    tips: [
      "Anything after the hash never reaches the server; put parameters before it.",
      "Percent-encode ampersands and equals signs that belong inside a value.",
      "Always include the scheme when testing, even though browsers hide it.",
    ],
  },
  "phone-formatter": {
    intro:
      "The Phone Number Formatter strips everything that is not a digit from a number and rewrites it in a standard display form. It recognises the three lengths that cover most North American numbers: ten digits become the familiar (123) 456-7890, eleven digits starting with a country code become 1 (234) 567-8901, and seven digits become a local 123-4567. Anything longer or shorter is reported as an international number with its raw digit count, which is the honest answer when the format is not one this tool can safely assume.",
    howTo: [
      { step: "Paste the number", detail: "Any existing formatting is fine. Parentheses, dashes, spaces, dots and a leading plus are all ignored." },
      { step: "Run it", detail: "The output depends on how many digits were found, as described below." },
      { step: "Check the digit count", detail: "If the result says International, count the digits yourself. A number that is one digit short or long is the usual cause of a formatting surprise." },
      { step: "Store numbers as digits", detail: "Formatting belongs at display time. Keeping only digits in your database avoids every dialect of separator." },
    ],
    faq: [
      { q: "Why do I get an international result instead of a formatted number?", a: "Because the digit count is not 7, 10 or 11. That usually means a missing or extra digit, or a non-North-American number. The tool reports the raw digits and their count rather than guessing at a national format." },
      { q: "Does it validate that the number exists?", a: "No. It only rewrites the shape of the number. It cannot tell whether a number is assigned, whether it is a landline or a mobile, or whether it can receive SMS. That needs a carrier lookup service." },
      { q: "What about extensions?", a: "An extension is not a digit pattern this tool recognises. Remove it before formatting and append it afterwards, usually as ext. followed by the number." },
      { q: "Why is my plus sign dropped?", a: "Because the plus is not a digit, and it is part of the international notation rather than the number itself. The tool reports the digits so you can re-add the prefix in whatever notation your system expects, such as 00 or +." },
      { q: "Should I store formatted numbers?", a: "No. Store the digits, ideally in E.164 form with the country code, and format at the point of display. That keeps search and deduplication reliable." },
    ],
    useCases: [
      "Normalising a spreadsheet column of numbers typed in several formats.",
      "Producing consistent display text from raw digits in a database.",
      "Checking how many digits a number actually has before importing.",
      "Cleaning numbers pasted out of an email signature or a document.",
    ],
    tips: [
      "Strip extensions before formatting and re-attach them afterwards.",
      "Store digits only; format for humans at the last moment.",
      "For anything outside North America, keep the E.164 form with the country code.",
    ],
  },
  "contrast-checker": {
    intro:
      "The Contrast Checker measures the contrast ratio between a text colour and a background colour using the WCAG luminance formula, and tells you which accessibility levels that pair passes. This is the check that decides whether body text is actually readable: a ratio of 4.5 to 1 is the minimum for normal text, 3 to 1 for large text and for interface boundaries, and 7 to 1 for enhanced compliance. Judging contrast by eye is unreliable, because the eye is far more sensitive to green than to blue, which is why a yellow that looks bright and a blue that looks dark can score almost identically.",
    howTo: [
      { step: "Set the text colour", detail: "Type a hex value such as 1a1a1a, or use the colour picker. Three-digit shorthand such as f0a is accepted." },
      { step: "Set the background colour", detail: "Same for the background. The preview updates as you change either one." },
      { step: "Read the ratio", detail: "The number runs from 1:1, identical colours, to 21:1, black on white. Higher means more readable." },
      { step: "Check the level you need", detail: "Normal body text needs 4.5 to 1 for AA and 7 to 1 for AAA. Headings at 18pt or 14pt bold, and UI borders, need 3 to 1." },
      { step: "Look at the preview as well as the number", detail: "A pair can pass on paper and still look poor at a small size or on a low-quality screen. If it looks hard to read, it is hard to read." },
    ],
    faq: [
      { q: "What is the contrast ratio formula?", a: "Each colour is converted to relative luminance using the standard weights, 0.2126 for red, 0.7152 for green and 0.0722 for blue, after gamma correction. The ratio is then the lighter luminance plus 0.05 divided by the darker plus 0.05. The result ranges from 1:1 to 21:1." },
      { q: "Why does my brand colour fail?", a: "Because most saturated mid-tone colours cannot reach 4.5 to 1 against white. The usual fix is to darken the colour for text use while keeping the brighter version for large fills, which is exactly what most design systems do with their primary colour." },
      { q: "Is passing the ratio enough to be accessible?", a: "It is necessary but not sufficient. Very large or very small text, thin font weights, text over images, and certain forms of colour vision deficiency all affect readability beyond the ratio. Test with real users where you can." },
      { q: "Does the direction matter, light on dark or dark on light?", a: "No. The ratio is symmetrical, so black on white and white on black both score 21:1. What differs in practice is glare and perceived weight, which is a design judgement rather than a compliance one." },
      { q: "What counts as large text?", a: "In WCAG terms, 18pt or larger, or 14pt or larger when bold. In CSS pixels that is roughly 24px, or about 18.66px when bold." },
      { q: "Where does the calculation happen?", a: "Entirely in your browser. Nothing is uploaded, so you can check colours from a brand guideline that is not public yet." },
    ],
    useCases: [
      "Checking whether body text on a coloured background meets AA.",
      "Choosing between black and white text for a button colour.",
      "Auditing an existing palette before a redesign.",
      "Documenting an accessibility decision in a ticket.",
    ],
    tips: [
      "Darken a colour for text, keep the brighter version for fills.",
      "Check the smallest size the text will actually be used at.",
      "Borders and icons need 3 to 1 too, not just text.",
    ],
  },
  "color-palette": {
    intro:
      "The Color Palette Generator takes one base colour and derives the standard harmony schemes from it: complementary, analogous, triadic, split complementary and tetradic, plus a ramp of tints towards white and shades towards black. Harmonies are computed in HSL by rotating the hue while keeping saturation and lightness, which is why the results stay related to your base instead of drifting. The ramp is the part most palettes actually need, because a working interface needs several values of the same hue for hover, active and disabled states, not just one accent colour.",
    howTo: [
      { step: "Pick a base colour", detail: "Enter a hex value such as 4ECDC4, or use the picker. Everything else is derived from this one colour." },
      { step: "Read the harmony schemes", detail: "Each scheme is a different hue rotation. Complementary is 180 degrees, triadic is 120 and 240, and so on." },
      { step: "Take the tint and shade ramp", detail: "Five tints towards white and five shades towards black give you the states and elevations you will need in a real interface." },
      { step: "Copy the values", detail: "The full list of generated hex values is in one block, ready to paste into a stylesheet or a design token file." },
      { step: "Check contrast before shipping", detail: "Run any text and background pair from the palette through the Contrast Checker. Harmonious is not the same as readable." },
    ],
    faq: [
      { q: "What is the difference between the schemes?", a: "Complementary uses the opposite hue, which gives the strongest contrast and suits a call to action. Analogous uses neighbours 30 degrees either side, which is calm and safe. Triadic spreads three hues evenly, which is lively and harder to control. Split complementary softens the complementary clash by using the two hues either side of the opposite. Tetradic uses four hues at right angles, which suits complex dashboards." },
      { q: "Why do the generated colours share the same saturation and lightness?", a: "Because rotating only the hue is what keeps them recognisably related. Varying lightness at the same time produces colours that look unrelated, which defeats the point of a palette." },
      { q: "Are tints just the colour mixed with white?", a: "Effectively yes, but computed in HSL by raising lightness while holding hue and saturation. That keeps the hue stable, whereas naive mixing in RGB drifts towards grey." },
      { q: "How many colours should a palette have?", a: "For most interfaces, two or three hues plus a neutral ramp is plenty. A scheme with five saturated hues is difficult to use consistently and usually ends up looking accidental." },
      { q: "Does it check accessibility?", a: "No, it only generates colours. Use the Contrast Checker on any pairing you intend to use for text." },
    ],
    useCases: [
      "Building a palette around a single brand colour.",
      "Producing hover, active and disabled variants from one accent.",
      "Exploring alternatives to a colour that failed a contrast check.",
      "Generating a neutral ramp for surfaces and borders.",
    ],
    tips: [
      "Pick the base colour from the brand, then only adjust lightness for states.",
      "Reserve the complementary colour for the one action you want noticed.",
      "Always run the final pairing through a contrast check before shipping.",
    ],
  },
  "gradient-generator": {
    intro:
      "The CSS Gradient Generator builds a real linear or radial gradient from two colours and an angle, shows it full size, and hands you the CSS. The angle is the part people misread: in CSS, 0deg points upwards and the direction rotates clockwise, so 90deg runs left to right and 180deg runs top to bottom. Getting that wrong is why a gradient often looks upside down the first time. Both colours can carry an eight-digit alpha value, which is how you fade a gradient out over a hero image.",
    howTo: [
      { step: "Pick the start and end colours", detail: "Use the colour picker or type a hex value. The preview and the CSS update as you change them." },
      { step: "Choose linear or radial", detail: "Linear runs across the box at a chosen angle. Radial spreads outwards from the centre as a circle." },
      { step: "Set the angle", detail: "Drag the slider from 0 to 360 degrees. Remember 0deg points up, 90deg points right, 180deg points down, 270deg points left." },
      { step: "Copy the CSS", detail: "The rule is a background declaration you can paste straight into a stylesheet, or into a background-image property if you prefer." },
    ],
    faq: [
      { q: "Which way does the angle point?", a: "Zero degrees points towards the top of the element and the angle increases clockwise. So 90deg goes to the right and 180deg goes downwards. This is counter-intuitive if you are used to maths angles measured anticlockwise from the right." },
      { q: "Why does my gradient look banded?", a: "Because two colours that are close in luminance produce visible steps on an 8-bit display, especially across a large area. Adding a subtle third stop, or using a slightly wider luminance range, usually hides it." },
      { q: "Can I use transparency?", a: "Yes. Use an eight-digit hex value such as 667eea00 for fully transparent or 667eea80 for half, and the gradient will fade over whatever sits behind it." },
      { q: "Is the gradient supported everywhere?", a: "Linear and radial gradients are supported in every current browser without a prefix. Vendor prefixes are only needed for very old versions of Safari and Android, which in practice means nothing built after about 2015." },
      { q: "Why does my gradient not show up?", a: "Because the element has no height. A gradient is painted into the element's box, so an empty div collapses to zero height and shows nothing. Set a height or add content." },
      { q: "Does it generate more than two colour stops?", a: "No, this tool handles two. For a multi-stop gradient, take the CSS it produces and add stops by hand; the syntax is simply more colour and percentage pairs separated by commas." },
    ],
    useCases: [
      "Building a hero background that fades between two brand colours.",
      "Testing which angle looks right before committing to it in code.",
      "Producing a subtle vertical gradient for a card or a button.",
      "Creating a semi-transparent overlay that darkens a photograph.",
    ],
    tips: [
      "Prefer a small luminance difference for backgrounds that carry text; it reads as texture rather than distraction.",
      "For text over a gradient, check contrast at the lightest and darkest points, not just the average.",
      "Keep gradients to two or three stops; more tends to look muddy.",
    ],
  },
  "border-radius-generator": {
    intro:
      "The Border Radius Generator sets the four corners of a box independently, with a live preview, and gives you the CSS. The order of the shorthand is the thing everyone forgets: it is top left, top right, bottom right, bottom left, going clockwise from the top left. One value applies to all four corners, two values apply to the diagonal pairs, and four values address each corner in turn. When all four match, the tool emits the single-value form, which is the one you actually want most of the time.",
    howTo: [
      { step: "Drag a corner slider", detail: "Each corner has its own slider from 0 to 150 pixels. The preview box rounds as you move it." },
      { step: "Keep the corners linked or unlink them", detail: "With Link on, moving any slider moves all four together. Turn it off to shape individual corners, which is how you make a speech-bubble tail or a leaf shape." },
      { step: "Read the CSS", detail: "If all four match you get the single-value shorthand. If they differ you get the full four-value form in clockwise order." },
      { step: "Consider a percentage instead", detail: "A radius of 50 percent on a square element gives a circle. Swap the px unit for a percentage in your stylesheet if that is what you need." },
    ],
    faq: [
      { q: "What order are the four values in?", a: "Clockwise from the top left: top left, top right, bottom right, bottom left. A useful mnemonic is that it starts where you start reading and goes around like a clock face." },
      { q: "What do two or three values mean?", a: "Two values set the diagonals: the first is top left and bottom right, the second is top right and bottom left. Three values set top left, then top right and bottom left together, then bottom right." },
      { q: "How do I make a circle?", a: "Use 50 percent on an element that is already square. Using pixels only gives a circle if the radius happens to equal half the width, which breaks the moment the element resizes." },
      { q: "Can I round corners differently horizontally and vertically?", a: "The full syntax allows an elliptical radius written as horizontal values, a slash, then vertical values. This tool emits the simpler uniform form, so add the slash version by hand if you need that shape." },
      { q: "Why is my rounded corner clipped?", a: "Because the child content is not clipped to the rounded box. Add overflow hidden to the element, or the image or background inside it will still show square corners." },
    ],
    useCases: [
      "Matching a radius to a design spec without guessing at pixel values.",
      "Rounding only the top corners of a card or a modal.",
      "Shaping a pill button, which is a radius of half the element height.",
      "Finding the radius that turns a square avatar into a circle.",
    ],
    tips: [
      "Use percentages when the element resizes, pixels when it does not.",
      "A pill button is not a fixed radius; it is half the height, so 9999px is the lazy but robust answer.",
      "Keep the radius consistent across a component set; mixing 4px, 6px and 8px looks accidental.",
    ],
  },
  "box-shadow-generator": {
    intro:
      "The Box Shadow Generator builds a shadow from offset, blur, spread, colour and opacity, with a live preview and the CSS. The two settings people confuse are blur and spread: blur softens the edge outwards and inwards from the shadow's shape, while spread grows or shrinks the shadow's own size before any blurring happens. Negative spread is what keeps a soft shadow from looking like a halo, which is why the defaults here use a small negative value.",
    howTo: [
      { step: "Set the offsets", detail: "Offset X moves the shadow right, offset Y moves it down. Negative values move it the other way." },
      { step: "Set blur and spread", detail: "Blur softens the edge. Spread expands the shadow before blurring; use a small negative spread for a shadow that sits under the element rather than around it." },
      { step: "Choose colour and opacity", detail: "Pure black at full opacity looks harsh. A low opacity, somewhere between 8 and 20 percent, reads as depth rather than dirt." },
      { step: "Tick inset if you want an inner shadow", detail: "Inset draws the shadow inside the element instead of behind it, which suits pressed states and wells." },
      { step: "Copy the CSS", detail: "The rule includes the rgba colour, so it can be pasted straight into a stylesheet." },
    ],
    faq: [
      { q: "What is the difference between blur and spread?", a: "Spread changes the size of the shadow's shape before any softening, positive to grow and negative to shrink. Blur then softens the edge by the given radius. To get a tight shadow under a card you want a small blur and a slightly negative spread." },
      { q: "Why does my shadow look grey and dirty?", a: "Because it is pure black at a high opacity. Use a low alpha, around 0.08 to 0.2, and consider tinting the shadow towards the background hue, which reads much more naturally." },
      { q: "Can I have more than one shadow?", a: "Yes. Separate several shadows with commas in the same declaration; they stack front to back, so the first is on top. Layered shadows are how soft, realistic elevation is built." },
      { q: "Does a box shadow affect layout?", a: "No. Shadows are painted outside the element's box and take up no space, so they can be clipped by a parent with overflow hidden or by a tight container." },
      { q: "Is animating a box shadow expensive?", a: "Yes, relatively. Changing blur or spread forces the browser to repaint the shadow every frame. For smooth motion, animate opacity or transform instead, or cross-fade between two pre-rendered shadows." },
    ],
    useCases: [
      "Building an elevation scale for cards, modals and menus.",
      "Making a pressed or focused state with an inset shadow.",
      "Softening a border without adding a real border.",
      "Checking what a design spec's shadow values actually look like.",
    ],
    tips: [
      "Two layered shadows look far better than one heavy one.",
      "Keep the light source consistent: if one card casts down-right, all of them should.",
      "Watch for shadows being clipped by a parent with overflow hidden.",
    ],
  },
  "text-shadow-generator": {
    intro:
      "The Text Shadow Generator sets the offset, blur, colour and opacity of a shadow behind text, with a live preview and the CSS. Unlike box-shadow it has no spread value, which catches people out: the only way to make a text shadow heavier is to stack several shadows in one declaration. It is most useful for legibility, putting a subtle dark shadow behind light text on a photograph, and it should never be the thing that makes text readable, because it disappears the moment the background changes.",
    howTo: [
      { step: "Set the offsets", detail: "Offset X moves right, offset Y moves down. A one or two pixel offset reads as depth; anything larger starts to look like a drop shadow." },
      { step: "Set the blur", detail: "Blur softens the edge. Zero gives a hard duplicate of the text, which is how outline and retro effects are made." },
      { step: "Choose colour and opacity", detail: "Dark text on light backgrounds wants a light shadow and vice versa. Keep opacity low unless you want an obvious effect." },
      { step: "Copy the CSS", detail: "The rule includes the rgba colour, ready to paste." },
      { step: "Stack shadows if you need more weight", detail: "Add a second shadow separated by a comma in your stylesheet. That is the only way to thicken a text shadow, since there is no spread." },
    ],
    faq: [
      { q: "Why is there no spread value?", a: "Because text-shadow does not support one. Its syntax is offset X, offset Y, blur and colour only. To simulate spread you stack several identical shadows with slightly different offsets." },
      { q: "Can I use it to make text readable over an image?", a: "Only as a supplement. A shadow helps at the margins but fails on busy areas, and it does not count towards the WCAG contrast ratio, which is measured against the background colour. Add a scrim or a solid panel if legibility genuinely matters." },
      { q: "How do I outline text?", a: "Stack four shadows at plus and minus one pixel in each direction with zero blur. That produces an outline effect without needing -webkit-text-stroke, which is not supported everywhere." },
      { q: "Does it slow the page down?", a: "A single static shadow costs almost nothing. Animating a text shadow, or applying a large blurred one to a lot of text, is where repaint cost appears." },
      { q: "Is it inherited by child elements?", a: "Yes. Text shadow is inherited, so setting it on a container applies it to every descendant with text, which is occasionally surprising." },
    ],
    useCases: [
      "Adding a subtle shadow so a caption reads over a photograph.",
      "Making a pressed or engraved heading effect.",
      "Producing a retro or neon text treatment.",
      "Testing how heavy a shadow needs to be before it looks cheap.",
    ],
    tips: [
      "Less is more: one or two pixels at low opacity beats a heavy blur.",
      "Never rely on a shadow alone for accessibility; fix the contrast underneath.",
      "Remember the property is inherited, so scope it to the element you mean.",
    ],
  },
  "emoji-picker": {
    intro:
      "The Emoji Picker holds a searchable set of emoji with keyword names, so you can type a word such as love, fire, coffee or warning and get the matches rather than scrolling. Clicking any emoji copies it to your clipboard, and the ones you have used stay in a recently copied row. Each emoji also carries a title, so hovering shows its official name, which is handy when you need the right word for alt text or a commit message.",
    howTo: [
      { step: "Type a keyword", detail: "Search matches the name rather than the character, so love finds hearts, weather finds sun and rain, and food finds pizza and cake." },
      { step: "Click to copy", detail: "Clicking an emoji copies it immediately and adds it to the recently copied row. No need to select the character by hand." },
      { step: "Copy the whole recent row at once", detail: "The copy button above the recent row copies them all as one string, which is useful when you are building a reaction bar." },
      { step: "Clear the search to browse", detail: "Empty the search box and the full set comes back, grouped by the order it is stored in." },
    ],
    faq: [
      { q: "How does the search work?", a: "It matches against a keyword list attached to each emoji, not against the character itself. So searching face returns every face, and searching tick returns the check mark rather than a literal tick character." },
      { q: "Does clicking copy it?", a: "Yes, to your clipboard using the browser's clipboard API. If your browser blocks clipboard access, the emoji still appears in the recent row so you can select it manually." },
      { q: "Why does an emoji look different on another device?", a: "Because each platform ships its own emoji font. Apple, Google, Microsoft and Samsung all draw them differently, and an emoji added recently may not exist on older systems at all, where it shows as an empty box." },
      { q: "Is there a search for skin tone or gender variants?", a: "No. This set uses the base characters. Skin tone modifiers and other variation sequences are separate code points that you would append yourself." },
      { q: "Can I use these commercially?", a: "The emoji characters themselves are Unicode and free to use. The specific artwork belongs to each platform's font, so do not lift a vendor's images; use the characters and let the reader's own font render them." },
      { q: "Is anything uploaded?", a: "No. The set is bundled in the page and the search runs locally, so it works offline once loaded." },
    ],
    useCases: [
      "Finding the right emoji for a commit message or a changelog entry.",
      "Building a reaction bar or a survey scale.",
      "Looking up an emoji's real name for alt text.",
      "Checking which emoji exists before designing around it.",
    ],
    tips: [
      "Search by concept rather than by appearance; the names are the searchable part.",
      "Remember that rendering differs per platform, so never rely on one vendor's artwork.",
      "Use sparingly in professional copy; one emoji carries more weight than five.",
    ],
  },
  "temperature-converter": {
    intro:
      "The Temperature Converter translates between Celsius, Fahrenheit and Kelvin, and unlike most unit conversions these three do not share a zero point, which is why you cannot simply multiply. Celsius and Fahrenheit differ by both a scale factor and an offset, and Kelvin is an absolute scale starting at absolute zero, so it has no negative values and no degree sign. The one number worth remembering is minus 40, the point at which the Celsius and Fahrenheit scales cross and give the same reading.",
    howTo: [
      { step: "Enter a value", detail: "Type any temperature, including decimals and negative numbers." },
      { step: "Choose the unit you are converting from", detail: "Celsius, Fahrenheit or Kelvin." },
      { step: "Choose the unit you want", detail: "The result updates immediately, so you can flip the direction without retyping." },
      { step: "Sanity check the result", detail: "Water freezes at 0 Celsius, 32 Fahrenheit and 273.15 Kelvin, and boils at 100 Celsius and 212 Fahrenheit. Those anchors catch a swapped unit instantly." },
    ],
    faq: [
      { q: "What are the formulas?", a: "Fahrenheit equals Celsius times 9/5 plus 32. Celsius equals Fahrenheit minus 32, times 5/9. Kelvin equals Celsius plus 273.15. Everything else is a combination of those three." },
      { q: "At what temperature are Celsius and Fahrenheit equal?", a: "Minus 40. Below that the Fahrenheit number is larger, above it the Celsius number is larger. It is the only point where the two scales agree." },
      { q: "Why does Kelvin have no degree symbol?", a: "Because it is an absolute scale, not a degree of something. You write 273.15 K, not 273.15 degrees Kelvin. Absolute zero, 0 K, is the theoretical point at which molecular motion stops, roughly minus 273.15 Celsius." },
      { q: "Why is my conversion slightly off from another site?", a: "Usually rounding. The conversion factor between Celsius and Fahrenheit is exact, 9/5, so any difference comes from how many decimal places were kept, not from the formula." },
      { q: "Can I convert a temperature difference rather than a reading?", a: "Not with this tool, and the distinction matters. A change of 10 Celsius is a change of 18 Fahrenheit, with no 32 added, because the offset applies to readings, not to intervals." },
    ],
    useCases: [
      "Converting an oven temperature between a US and a European recipe.",
      "Reading a weather forecast in the scale you think in.",
      "Checking a scientific figure given in Kelvin.",
      "Working out whether a fever reading is concerning.",
    ],
    tips: [
      "Remember minus 40 as the crossover; it catches most unit mistakes.",
      "Use the freezing and boiling points of water as your sanity check.",
      "Do not add 32 when converting a temperature difference, only a reading.",
    ],
  },
  "password-strength": {
    intro:
      "The Password Strength Checker scores a password out of seven using plain, explainable rules: length thresholds, and the presence of lowercase, uppercase, digits and symbols. It reports which of those you satisfied, so you can see exactly what moved the score rather than getting a bare verdict. The point of showing the criteria is that length dominates everything else: a long passphrase without symbols beats a short password that ticks every character class. The check runs entirely in your browser and nothing is transmitted.",
    howTo: [
      { step: "Type a password", detail: "Use the single-line field. The score updates when you run it." },
      { step: "Read the score and the breakdown", detail: "You get a figure out of seven plus a list showing whether lowercase, uppercase, digits and symbols are present, and how long the password is." },
      { step: "Add length before anything else", detail: "Going from 8 to 16 characters is worth more to the score than adding a symbol. A four-word passphrase is both stronger and easier to remember." },
      { step: "Do not paste a password you actually use", detail: "Type a representative example of the same shape instead. The habit of pasting real credentials into websites is worth not practising." },
    ],
    faq: [
      { q: "How is the score calculated?", a: "One point each for at least 8 characters, at least 12, lowercase, uppercase, a digit, a symbol, and at least 16 characters. Seven points is Excellent. It is deliberately simple and transparent, not a statistical estimate." },
      { q: "Is a high score the same as a strong password?", a: "No. This checks character composition, not unpredictability. Password1! scores well here and is among the first things an attacker tries. Real strength means length plus randomness, and ideally uniqueness per site." },
      { q: "What matters more, length or symbols?", a: "Length, by a wide margin. Each extra character multiplies the search space, while a symbol adds a fixed amount. Twenty characters of lowercase letters beats ten characters of mixed classes, and is easier to type." },
      { q: "Do you store or send the password?", a: "No. Everything happens in your browser tab and nothing is logged or transmitted. Even so, the sensible habit is to test a representative example rather than the real thing." },
      { q: "Why is my long passphrase marked only Fair?", a: "Because it is missing character classes. If it is long and made of genuinely uncommon words, it is stronger than the score suggests; the scoring is a rough guide, not an entropy calculation." },
      { q: "Should I also use a password manager?", a: "Yes. A manager lets every password be long, random and unique, which does more for your security than any composition rule. This tool is a teaching aid, not a substitute." },
    ],
    useCases: [
      "Checking whether a password meets a minimum policy before submitting it.",
      "Showing someone why a short complex password is weaker than a long simple one.",
      "Testing a generated passphrase before adopting it.",
      "Auditing which character classes a legacy password is missing.",
    ],
    tips: [
      "Length first, symbols second; a four-word passphrase beats P@ssw0rd.",
      "Never reuse a password across sites, however strong it is.",
      "Turn on two-factor authentication; it matters more than password complexity.",
    ],
  },
  "length-converter": {
    intro:
      "The Length Converter translates between nine units: metres, kilometres, centimetres, millimetres, miles, yards, feet, inches and nautical miles. Every metric unit is a clean power of ten, while the imperial units are defined by exact modern values: an inch is exactly 2.54 centimetres and a mile is exactly 1609.344 metres, so there is no ambiguity or rounding in the factors themselves. Nautical miles are a separate system again, fixed at 1852 metres and derived from one minute of latitude.",
    howTo: [
      { step: "Enter a value", detail: "Type any number, including decimals." },
      { step: "Choose the unit you have", detail: "Pick from the nine available units." },
      { step: "Choose the unit you want", detail: "The result appears immediately and you can swap the direction without retyping." },
      { step: "Check the order of magnitude", detail: "Converting metres to feet should roughly triple the number, and feet to metres should roughly divide it by three. A result that is out by a factor of ten means the wrong unit was selected." },
    ],
    faq: [
      { q: "How many feet are in a metre?", a: "About 3.2808. Exactly, one foot is 0.3048 metres, so one metre is 1 divided by 0.3048 feet." },
      { q: "Are these conversions exact?", a: "The imperial units have exact modern definitions in metric terms: an inch is exactly 25.4 millimetres, a yard exactly 0.9144 metres and a mile exactly 1609.344 metres. Any difference between tools is rounding in the display, not in the factor." },
      { q: "What is a nautical mile for?", a: "Navigation. It is defined as 1852 metres and corresponds to one minute of latitude, which makes chart and chart-plotter arithmetic work in degrees. It is about 1.15 statute miles." },
      { q: "Why do US survey distances differ slightly?", a: "The US survey foot is marginally longer than the international foot, by about two parts per million. It matters only in surveying and geodesy; for everyday conversion use the international foot, which is what this tool uses." },
      { q: "Can I convert area or volume with this?", a: "No. Converting square or cubic units is not the same as converting lengths: one square metre is about 10.76 square feet, not 3.28. Use the area and volume converters for those." },
    ],
    useCases: [
      "Converting a height given in feet and inches into centimetres.",
      "Working out a running distance in miles from a figure in kilometres.",
      "Checking a dimension on a drawing supplied in imperial units.",
      "Converting depth soundings or chart distances in nautical miles.",
    ],
    tips: [
      "Metres to feet is roughly times three; use that as your quick sanity check.",
      "Do not use a length conversion for area or volume; the factor is squared or cubed.",
      "Convert feet and inches into inches first, then into metric, to avoid two-step errors.",
    ],
  },
  "weight-converter": {
    intro:
      "The Weight Converter translates between kilograms, grams, milligrams, metric tons, pounds, ounces and stone. The metric side is decimal, so those four are simple powers of a thousand, while the imperial side uses a pound defined as exactly 0.45359237 kilograms and an ounce as one sixteenth of a pound. Stone is the one that surprises people outside the UK and Ireland: it is 14 pounds, about 6.35 kilograms, and it is still how body weight is usually stated there.",
    howTo: [
      { step: "Enter a value", detail: "Type any number, including decimals." },
      { step: "Choose the unit you have", detail: "Pick from kilograms, grams, milligrams, metric tons, pounds, ounces or stone." },
      { step: "Choose the unit you want", detail: "The result updates immediately and the direction can be swapped without retyping." },
      { step: "Sanity check the result", detail: "Kilograms to pounds is roughly times 2.2, and pounds to kilograms is roughly divide by 2.2. A result in the wrong ballpark means the wrong unit was chosen." },
    ],
    faq: [
      { q: "How many pounds are in a kilogram?", a: "About 2.2046. Exactly, one pound is 0.45359237 kilograms, so one kilogram is 1 divided by 0.45359237 pounds." },
      { q: "Is a metric ton the same as a US ton?", a: "No. A metric ton, or tonne, is 1000 kilograms. A US short ton is 2000 pounds, about 907 kilograms, and a British long ton is 2240 pounds, about 1016 kilograms. This tool uses the metric ton." },
      { q: "What is a stone?", a: "Fourteen pounds, about 6.35 kilograms. It is still the conventional unit for body weight in the UK and Ireland, where someone might say eleven stone four rather than 72 kilograms." },
      { q: "Are ounces here the same as fluid ounces?", a: "No. This converts mass ounces, one sixteenth of a pound. A fluid ounce measures volume and its mass depends on what liquid you are measuring." },
      { q: "Should I use weight or mass?", a: "In everyday language weight is fine. Technically this converts mass: the same object has the same mass everywhere, while its weight changes with gravity. Scales that read in kilograms are measuring mass." },
    ],
    useCases: [
      "Converting body weight between kilograms and stone or pounds.",
      "Checking a shipping weight for a carrier limit.",
      "Converting a recipe quantity given in ounces into grams.",
      "Working out how many kilograms a pallet rated in pounds can hold.",
    ],
    tips: [
      "Kilograms to pounds is roughly times 2.2; use it as your quick check.",
      "Check which ton is meant before converting anything commercial.",
      "Mass ounces and fluid ounces are different things: do not mix them.",
    ],
  },
  "discount-calculator": {
    intro:
      "The Discount Calculator takes a price and a discount percentage and returns what you save and what you pay. It also quietly settles the question that comes up at every sale: whether two successive discounts are the same as one larger one. They are not. Twenty percent off followed by a further ten percent is a total of 28 percent, not 30, because the second discount applies to the already reduced price. The reverse direction is the other trap, where subtracting the percentage back off the sale price does not return you to the original.",
    howTo: [
      { step: "Enter the price and the discount", detail: "Type them as price, then a comma, then the percentage. For example 200, 20 means 200 with 20 percent off." },
      { step: "Read the breakdown", detail: "You get the original price, the discount rate, the amount saved and the final price." },
      { step: "Check a stacked discount separately", detail: "Run the tool once, then run it again on the new final price with the second percentage. Do not add the two percentages together." },
      { step: "Reverse a price if you need the original", detail: "Divide rather than subtract. If something costs 80 after 20 percent off, the original is 80 divided by 0.8, which is 100." },
    ],
    faq: [
      { q: "Is 20 percent off plus 10 percent off the same as 30 percent off?", a: "No, it is 28 percent. The first discount gives 80 percent of the price, and the second takes 90 percent of that, so 0.8 times 0.9 is 0.72, meaning you pay 72 percent. Percentages only add when they apply to the same base." },
      { q: "How do I find the original price from the sale price?", a: "Divide by the remaining fraction. A sale price of 80 after 20 percent off means 80 divided by 0.8, which is 100. Subtracting 20 percent from 80 gives 64, which is the common mistake." },
      { q: "Does this include tax?", a: "No. It converts a pre-tax price into a discounted pre-tax price. If tax is applied afterwards, calculate it on the discounted figure, not the original." },
      { q: "What does a discount over 100 percent mean?", a: "It is not a real discount. Anything at or above 100 percent means the item is free or the seller is paying you, which in practice means one of the numbers was entered wrong." },
      { q: "Why is my result a few cents different from the shop's?", a: "Rounding. The tool keeps two decimal places throughout, while a till may round each line, round only at the total, or round to the nearest five cents." },
    ],
    useCases: [
      "Checking whether a sale price is actually the discount advertised.",
      "Working out the real total of a stacked promotion.",
      "Comparing two offers, such as 25 percent off against 20 pounds off.",
      "Finding the pre-discount price when only the sale price is shown.",
    ],
    tips: [
      "Multiply successive discounts, never add them.",
      "Divide to reverse a discount; do not subtract.",
      "Compare the final price, not the headline percentage.",
    ],
  },
  "lorem-ipsum": {
    intro:
      "The Lorem Ipsum Generator produces placeholder text in the traditional scrambled Latin, so you can see how a layout behaves with real-looking paragraphs before any copy exists. It is worth knowing why designers use it rather than English: readable text draws the eye to the words, so people end up commenting on the content instead of the layout. Filler that cannot be read keeps the review focused on spacing, measure and hierarchy. The text traces back to a passage by Cicero, deliberately scrambled since the sixteenth century.",
    howTo: [
      { step: "Enter how many paragraphs you need", detail: "Type a number, for example 3. Up to 50 paragraphs are produced." },
      { step: "Generate", detail: "The paragraphs appear separated by blank lines, ready to paste." },
      { step: "Paste into your layout", detail: "Insert it where the real copy will eventually go, and keep the character count roughly similar to the real thing." },
      { step: "Replace it before you ship", detail: "Placeholder text that reaches production is an embarrassing and surprisingly common mistake. Search the project for lorem before release." },
    ],
    faq: [
      { q: "What does the text actually say?", a: "It is scrambled Latin derived from Cicero's De Finibus Bonorum et Malorum, written in 45 BC, with words removed and rearranged over centuries so that it looks like text without reading as text. It is not meant to mean anything." },
      { q: "Why not just use English filler?", a: "Because readable words pull attention away from the design. Reviewers start editing copy instead of judging spacing and hierarchy, which is the opposite of what a placeholder is for." },
      { q: "Does the length match real copy?", a: "Only approximately. Treat the output as a shape, not a volume. If you need to test a specific measure or a truncation rule, use text of a realistic length instead." },
      { q: "Can I use it in a real product?", a: "No. It is a placeholder. Searching a codebase for lorem before every release is a cheap habit that prevents a very public mistake." },
      { q: "Is anything uploaded?", a: "No. The passage is stored in the page and generated in your browser, so it works offline once loaded." },
    ],
    useCases: [
      "Filling a mockup before the copy is written.",
      "Testing how a column of text wraps at different widths.",
      "Checking line height and paragraph spacing in a real layout.",
      "Producing filler for a print or email template.",
    ],
    tips: [
      "Match the rough length of the real copy, not just the paragraph count.",
      "Always search for lorem before shipping.",
      "For testing truncation or character limits, use realistic text instead.",
    ],
  },
  "random-number": {
    intro:
      "The Random Number Generator returns one whole number within a range you choose, inclusive of both ends, using the JavaScript random function behind Math.random. That makes it fine for picking a winner, rolling a virtual die or choosing a sample, and not suitable for anything where predictability would cost you money, such as a raffle with a prize or a security token. For those you want a cryptographically secure generator, which the UUID tool uses instead.",
    howTo: [
      { step: "Enter the range", detail: "Type the minimum, then a comma, then the maximum. For example 1, 100 gives a number from 1 to 100 inclusive." },
      { step: "Generate", detail: "One number is produced each time you run it." },
      { step: "Run it again for another value", detail: "There is no memory between runs, so repeats are possible and expected." },
      { step: "Use a secure source for anything that matters", detail: "For prizes, tokens or anything adversarial, do not use this. Use a cryptographically secure generator instead." },
    ],
    faq: [
      { q: "Are both ends included?", a: "Yes. A range of 1 to 100 can produce 1 and it can produce 100. That is the behaviour most people expect, and it is why 1 to 6 works as a die." },
      { q: "Is it truly random?", a: "It is pseudo-random, produced by an algorithm from a seed. The distribution is even enough for games and sampling, but the sequence is in principle reproducible, which is why it must not be used where someone could profit from predicting it." },
      { q: "Can the same number come up twice in a row?", a: "Yes. Each run is independent, so repeats are normal. If you need distinct values, generate them one at a time and discard duplicates yourself." },
      { q: "How large can the range be?", a: "Very large in principle, but the result is a JavaScript number, so keep it within a safe integer range. Anything past about nine quadrillion loses precision." },
      { q: "Can I generate several numbers at once?", a: "No, one per run. Run it repeatedly, or use a script if you need a large batch." },
    ],
    useCases: [
      "Picking a winner from a numbered list of entries.",
      "Rolling a virtual die for a game.",
      "Choosing a random sample or a random start point.",
      "Generating a throwaway value for testing.",
    ],
    tips: [
      "Remember both ends are included when you set the range.",
      "Never use this for a prize draw or a token; use a secure generator.",
      "Expect repeats; independence means duplicates happen.",
    ],
  },
  "url-extractor": {
    intro:
      "The URL Extractor pulls every http and https link out of a block of text and lists them one per line. It is the fast way to collect links from a long email, a pasted document, a changelog or a chunk of HTML without clicking through them one at a time. Extraction stops at characters that cannot legally appear in a URL, such as whitespace, quotes and angle brackets, which is what keeps the results clean on messy input.",
    howTo: [
      { step: "Paste the text", detail: "Any block of text works: an email body, a document, a log, or even raw HTML." },
      { step: "Extract", detail: "Every link is listed on its own line, in the order it appeared." },
      { step: "Copy the list", detail: "The result is plain text, one URL per line, ready to paste into a spreadsheet or a download manager." },
      { step: "Watch for trailing punctuation", detail: "A URL at the end of a sentence can pick up the full stop. Glance over the list before using it." },
    ],
    faq: [
      { q: "Why are some links missing?", a: "Because they have no scheme. The extraction looks for http:// or https://, so a bare address such as example.com or www.example.com is not matched. Add the scheme, or search for the domain separately." },
      { q: "Why does a link end with a full stop or a bracket?", a: "Because the extractor stops only at characters that are illegal in a URL, and a full stop is legal. Trailing punctuation at the end of a sentence is therefore captured. Trim it, or wrap URLs in angle brackets when you write them." },
      { q: "Does it follow redirects or check whether links work?", a: "No. It only finds the text of the links. Checking whether they resolve needs a separate request to each one." },
      { q: "Does it remove duplicates?", a: "No, every occurrence is listed. If you want the unique set, run the list through the Duplicate Line Remover." },
      { q: "Is the text uploaded?", a: "No. The search happens in your browser, so pasted emails and internal documents never leave your device." },
    ],
    useCases: [
      "Collecting all the links from a long email or briefing document.",
      "Extracting URLs from a block of HTML or a sitemap fragment.",
      "Gathering download links listed in a changelog.",
      "Checking which links appear in a page before migrating it.",
    ],
    tips: [
      "Run the result through Duplicate Line Remover if you want the unique set.",
      "Watch for a trailing full stop when a URL ends a sentence.",
      "Bare domains without http:// will not be found; add the scheme first.",
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
