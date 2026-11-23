/**
 * 高曝光页 SEO 覆盖表（GSC 数据驱动，2026-11-10）
 *
 * 背景：全站工具页 title 由 `generateToolMetadata` 统一拼成
 *   `${meta.title} - Free Online Tool` + 根布局 template `%s - Toolbox Hub`
 * → 最终是 `<本地化标题> - Free Online Tool - Toolbox Hub`。
 * 两个问题：
 *   1. 尾部 19 字符的通用英文后缀挤掉了 SERP 里唯一有信息量的位置；
 *   2. 西语等语言页变成「西语标题 + 英文后缀」的混血串。
 * description 则是 `content.intro.slice(0, 158)` 硬截断，常停在半个单词上。
 *
 * GSC 全量导出（过去 3 个月）显示有 10 个页面「展示 >= 200 且点击 = 0」，
 * 其中 6 个已排进前 2 页 —— 说明是 SERP 摘要没给利益点，不是排名问题。
 * 本表只对**有真实展示的 (slug, lang) 组合**定制 title / description，
 * 其余 1700+ 页保持原样，避免触发全站重爬。
 *
 * title 用 Metadata.title 的 `{ absolute }` 形式，绕过根布局 template，
 * 因此每条都自带品牌后缀 `| Toolbox Hub`。
 * 未覆盖的组合回退到原有拼法，行为完全不变。
 */
export interface ToolSeoOverride {
  title: string;
  description: string;
}

const OVERRIDES: Record<string, Record<string, ToolSeoOverride>> = {
  "loan-calculator": {
    en: {
      title: "Loan Calculator: Monthly Payment & Total Interest | Toolbox Hub",
      description:
        "Enter an amount, annual rate and term to see the fixed monthly payment, total repaid and total interest. Standard amortization formula, runs in your browser.",
    },
    es: {
      title: "Calculadora de préstamos: cuota mensual e intereses | Toolbox Hub",
      description:
        "Introduce importe, tipo anual y plazo para ver la cuota mensual, el total pagado y los intereses. Fórmula de amortización en tu navegador.",
    },
    zh: {
      title: "贷款计算器：月供、总还款与总利息 | Toolbox Hub",
      description:
        "输入贷款金额、年利率和年限，立即算出等额本息的每月还款额、总还款额与总利息，采用标准摊还公式。未填利率与年限时默认 5% 与 30 年，全部在浏览器本地运行，无需上传数据。",
    },
    "zh-TW": {
      title: "貸款計算器：月付額、總還款與總利息 | Toolbox Hub",
      description:
        "輸入貸款金額、年利率與年限，立即算出每月固定還款額、總還款額與總利息，採用標準攤還公式。未填利率與年限時預設 5% 與 30 年，完全在瀏覽器執行，資料不上傳。",
    },
  },
  "tip-calculator": {
    en: {
      title: "Tip Calculator: Tip, Total & Split Per Person | Toolbox Hub",
      description:
        "Enter a bill and a tip percentage to see the tip, the final total, and each person's share. The split divides the total, not the pre-tip bill.",
    },
    "zh-TW": {
      title: "小費計算器：即時算小費、總額與每人分攤 | Toolbox Hub",
      description:
        "輸入帳單金額與小費百分比，立即得到小費、最終總額與每人應付金額，輸入時即時更新。分攤是以含小費的總額計算，而不是原始帳單，這正是手動分帳最容易算錯的地方。免註冊，資料不上傳。",
    },
    nl: {
      title: "Fooirekenaar: fooi, totaal en verdeling per persoon | Toolbox Hub",
      description:
        "Voer een rekening en een fooipercentage in en zie direct de fooi, het totaal en het aandeel per persoon. De verdeling gebruikt het totaalbedrag.",
    },
    tr: {
      title: "Bahşiş Hesaplayıcı: bahşiş, toplam ve kişi başı pay | Toolbox Hub",
      description:
        "Hesap tutarını ve bahşiş yüzdesini girin; bahşiş, toplam ve kişi başına düşen pay anında görünsün. Bölme işlemi toplam tutar üzerinden yapılır.",
    },
    pt: {
      title: "Calculadora de Gorjeta: gorjeta, total e divisão | Toolbox Hub",
      description:
        "Informe o valor da conta e a porcentagem de gorjeta para ver a gorjeta, o total e a parte de cada pessoa. A divisão usa o valor total.",
    },
  },
  "discount-calculator": {
    en: {
      title: "Discount Calculator: Final Price & Amount You Save | Toolbox Hub",
      description:
        "Type a price and discount separated by a comma, e.g. 200, 20, to see the original price, what you save and what you pay. Runs locally, no upload.",
    },
    "zh-TW": {
      title: "折扣計算器：折後價與省下金額 | Toolbox Hub",
      description:
        "以逗號分隔輸入原價與折扣百分比，例如 200, 20，立即得到原價、省下金額與實付價格。購物比價與促銷設定都能用，免註冊、資料留在本機。",
    },
    zh: {
      title: "折扣计算器：折后价与省下金额 | Toolbox Hub",
      description:
        "以逗号分隔输入原价与折扣百分比，例如 200, 20，立即得到原价、省下金额与实付价格。购物比价与促销设置都能用，免注册、数据留在本机。",
    },
  },
  "word-counter": {
    en: {
      title: "Word Counter: Words, Characters & Reading Time | Toolbox Hub",
      description:
        "Live word, character, sentence, paragraph and line counts with a reading-time estimate. See exactly how whitespace, CJK text and punctuation affect the numbers.",
    },
    de: {
      title: "Wortzähler: Wörter, Zeichen, Sätze & Lesezeit | Toolbox Hub",
      description:
        "Wörter, Zeichen, Sätze, Absätze und Zeilen live zählen, inklusive Lesezeit. Nachvollziehbar, wie Leerzeichen, CJK-Text und Satzzeichen die Zahlen beeinflussen.",
    },
    ru: {
      title: "Счётчик слов: слова, символы и время чтения | Toolbox Hub",
      description:
        "Подсчёт слов, символов, предложений, абзацев и строк в реальном времени с оценкой времени чтения. Показываем, как пробелы и пунктуация влияют на результат.",
    },
    vi: {
      title: "Bộ đếm từ: số từ, ký tự và thời gian đọc | Toolbox Hub",
      description:
        "Đếm trực tiếp số từ, ký tự, câu, đoạn và dòng kèm ước tính thời gian đọc. Giải thích rõ khoảng trắng và dấu câu ảnh hưởng thế nào đến con số.",
    },
    es: {
      title: "Contador de palabras: palabras, caracteres y lectura | Toolbox Hub",
      description:
        "Cuenta palabras, caracteres, oraciones, párrafos y líneas en vivo, con tiempo de lectura. Explica cómo espacios y signos cambian el resultado.",
    },
    it: {
      title: "Contatore di parole: parole, caratteri e lettura | Toolbox Hub",
      description:
        "Conta in tempo reale parole, caratteri, frasi, paragrafi e righe con stima del tempo di lettura. Mostra come spazi e punteggiatura influiscono sui numeri.",
    },
  },
  // 英文搜索意图页（2026-11）。只覆盖 en，避免把机翻标题写进其他语言。
  // json-formatter 已 301/客户端跳到 data-converter，所以「json formatter online」落在这一页。
  "data-converter": {
    en: {
      title: "JSON Formatter Online — Pretty-Print & Validate JSON | Toolbox Hub",
      description:
        "Paste JSON to pretty-print it with 2-space indentation, or convert it to YAML, XML, and CSV. Free JSON formatter that runs in your browser.",
    },
  },
  "qr-code-generator": {
    en: {
      title: "QR Code Generator — Free QR Code Maker Online | Toolbox Hub",
      description:
        "Turn a URL or any text into a QR code and download a PNG. Free QR code generator with no sign-up, no watermark, and no upload.",
    },
  },
  "password-generator": {
    en: {
      title: "Password Generator — Strong Random Passwords Online | Toolbox Hub",
      description:
        "Create a strong random password with letters, numbers, and symbols. Generated in your browser and never uploaded or stored.",
    },
  },
  "base64-encoder": {
    en: {
      title: "Base64 Encoder & Decoder Online | Toolbox Hub",
      description:
        "Encode text to Base64 or decode a Base64 string back to text, including Unicode. Free Base64 encoder that runs in your browser.",
    },
  },
  "uuid-generator": {
    en: {
      title: "UUID Generator — Random UUID v4 Online | Toolbox Hub",
      description:
        "Generate version 4 UUIDs from cryptographically secure random bytes. Copy one or a batch into JSON, SQL, or a spreadsheet.",
    },
  },
  "regex-tester": {
    en: {
      title: "Regex Tester — Test Regular Expressions Online | Toolbox Hub",
      description:
        "Test a JavaScript regular expression against your own text and see every match and capture group. Free regex tester, nothing uploaded.",
    },
  },
  "timestamp-converter": {
    en: {
      title: "Unix Timestamp Converter — Epoch to Date Online | Toolbox Hub",
      description:
        "Convert a Unix timestamp to a readable date, or a date to epoch seconds and milliseconds. Free converter with local time and UTC.",
    },
  },
  "url-encoder": {
    en: {
      title: "URL Encoder & Decoder Online | Toolbox Hub",
      description:
        "URL-encode text for a query string or decode percent-encoding, including Unicode. Free URL encoder using encodeURIComponent in your browser.",
    },
  },
  "md5-generator": {
    en: {
      title: "MD5 Hash Generator — MD5, SHA-256 & SHA-512 | Toolbox Hub",
      description:
        "Generate MD5, SHA-1, SHA-256, and SHA-512 hashes from text in your browser. Free hash generator with nothing uploaded or stored.",
    },
  },
  "image-format-converter": {
    en: {
      title: "Image Converter — JPG, PNG, WebP, BMP, and ICO | Toolbox Hub",
      description:
        "Convert a picture between JPG, PNG, WebP, BMP, and ICO. The quality slider applies to JPG and WebP only. The file stays in the browser.",
    },
  },
  "image-compressor": {
    en: {
      title: "Compress Image Online — JPEG, PNG, and WebP | Toolbox Hub",
      description:
        "Shrink a JPEG, PNG, or WebP in the browser and compare the original size with the new file. PNG savings are often modest. Nothing is uploaded.",
    },
  },
  "image-resizer": {
    en: {
      title: "Resize Image Online — Presets and Custom Size | Toolbox Hub",
      description:
        "Change an image's width and height, with common widths and a locked aspect ratio. Upscaling does not add real detail. The file stays on your device.",
    },
  },
  "image-cropper": {
    en: {
      title: "Crop Image Online — 1:1, 16:9, and Custom | Toolbox Hub",
      description:
        "Crop a picture to 1:1, 4:5, 16:9, 9:16, or the box you drag. The download matches the preview. The file stays in your browser.",
    },
  },
  "image-rotator": {
    en: {
      title: "Rotate Image Online — 90° and Flip | Toolbox Hub",
      description:
        "Rotate a picture left or right in 90° steps, or flip it horizontally or vertically. The download keeps the format when it can.",
    },
  },
  "image-watermark": {
    en: {
      title: "Watermark Image Online — Text or Picture | Toolbox Hub",
      description:
        "Stamp text or another picture on an image, with size, color, opacity, rotation, and position. The preview is the file you download.",
    },
  },

  // Remaining English tool pages (2026-11). en only, so other locales keep their translations.
  // Absolute titles skip the shared "- Free Online Tool - Toolbox Hub" suffix.
  "html-entity-encoder": {
    en: {
      title: "HTML Entity Encoder & Decoder Online | Toolbox Hub",
      description:
        "Encode <, >, &, and quotes so they are safe inside HTML, or decode entities such as &amp; and &quot; back into characters.",
    },
  },
  "number-base-converter": {
    en: {
      title: "Binary, Octal, Decimal & Hex Converter | Toolbox Hub",
      description:
        "Type a value in one base and see binary, octal, decimal, and hexadecimal together. Handy for bit masks, permissions, and color channels.",
    },
  },
  "unicode-converter": {
    en: {
      title: "Unicode Escape Converter — Text and \\u Codes | Toolbox Hub",
      description:
        "Turn characters into JavaScript \\u escape sequences, or decode those sequences back into text, including CJK characters and emoji.",
    },
  },
  "html-preview": {
    en: {
      title: "HTML Preview — Live HTML Viewer Online | Toolbox Hub",
      description:
        "Paste a fragment of HTML and see it render immediately. Check markup before you save a file or open it in another tab.",
    },
  },
  "gitignore-generator": {
    en: {
      title: ".gitignore Generator for Node, Python & More | Toolbox Hub",
      description:
        "Select language, framework, editor, and operating-system templates, then copy or download one combined .gitignore file.",
    },
  },
  "mermaid-diagram": {
    en: {
      title: "Mermaid Live Editor — Flowcharts from Text | Toolbox Hub",
      description:
        "Write Mermaid and preview a flowchart, sequence, class, ER, Gantt, or pie chart. Download the diagram as SVG or PNG.",
    },
  },
  "excel-converter": {
    en: {
      title: "Excel to JSON & CSV Converter Online | Toolbox Hub",
      description:
        "Open an XLSX, XLS, or CSV file, choose a sheet, and export JSON, CSV, or XLSX. The workbook never leaves your browser.",
    },
  },
  "text-to-slug": {
    en: {
      title: "URL Slug Generator — Text to Slug Online | Toolbox Hub",
      description:
        "Turn a heading into a lowercase URL slug. Spaces and punctuation become hyphens, so the result can go straight into a path.",
    },
  },
  "text-case-converter": {
    en: {
      title: "Case Converter — Upper, Lower & Title Case | Toolbox Hub",
      description:
        "Rewrite text as uppercase, lowercase, and title case at once. Title case capitalizes every word, including short words such as of and the.",
    },
  },
  "duplicate-line-remover": {
    en: {
      title: "Remove Duplicate Lines from Text Online | Toolbox Hub",
      description:
        "Drop repeated lines and keep the first copy in its original order. Matching is exact, so trim spaces if two lines only look the same.",
    },
  },
  "line-number-adder": {
    en: {
      title: "Add Line Numbers to Text Online | Toolbox Hub",
      description:
        "Prefix every line with its number so you can point at a specific row in a code review, a paste, or a screenshot.",
    },
  },
  "random-string": {
    en: {
      title: "Random String Generator — Letters & Digits | Toolbox Hub",
      description:
        "Create a random string of letters and digits at the length you choose, up to 1,000 characters, for tokens, fixtures, and test data.",
    },
  },
  "list-randomizer": {
    en: {
      title: "List Randomizer — Shuffle Lines Online | Toolbox Hub",
      description:
        "Shuffle one item per line into a new order. Each line has the same chance of landing in any position, for a draw or a randomized checklist.",
    },
  },
  "text-trimmer": {
    en: {
      title: "Trim Whitespace & Blank Lines Online | Toolbox Hub",
      description:
        "Remove spaces at the start and end of each line, collapse repeated blank lines, and trim the whole block before you paste it.",
    },
  },
  "letter-counter": {
    en: {
      title: "Letter Frequency Counter Online | Toolbox Hub",
      description:
        "Count how often each letter appears and see its share of the text. Useful for puzzles, simple ciphers, and checking a sample.",
    },
  },
  "morse-code": {
    en: {
      title: "Morse Code Translator — Encode & Decode | Toolbox Hub",
      description:
        "Type letters to get Morse code, or paste dots and dashes to read them back. The direction follows whatever you entered.",
    },
  },
  "text-repeater": {
    en: {
      title: "Repeat Text Online — String Repeater | Toolbox Hub",
      description:
        "Repeat a word, a line, or a paragraph as many times as you ask, with a space between copies, for filler or test data.",
    },
  },
  "list-sorter": {
    en: {
      title: "Alphabetical List Sorter — A–Z and Z–A | Toolbox Hub",
      description:
        "Sort one item per line into alphabetical order and copy either A to Z or Z to A. Both directions are produced together.",
    },
  },
  "markdown-preview": {
    en: {
      title: "Markdown Preview — Live CommonMark Editor | Toolbox Hub",
      description:
        "Write Markdown and see CommonMark plus GitHub tables, task lists, and fenced code render beside the source. Copy the HTML if you need it.",
    },
  },
  "color-converter": {
    en: {
      title: "HEX to RGB Converter — HSL and HSV | Toolbox Hub",
      description:
        "Convert one color between HEX, RGB, HSL, and HSV, including an alpha channel, and check its contrast against black and white.",
    },
  },
  "gradient-generator": {
    en: {
      title: "CSS Gradient Generator — Linear & Radial | Toolbox Hub",
      description:
        "Pick two colors and an angle, preview a linear or radial gradient at full size, and copy the CSS background declaration.",
    },
  },
  "box-shadow-generator": {
    en: {
      title: "CSS Box Shadow Generator Online | Toolbox Hub",
      description:
        "Set horizontal and vertical offset, blur, spread, color, and opacity, preview the shadow, and copy the box-shadow rule.",
    },
  },
  "border-radius-generator": {
    en: {
      title: "CSS Border Radius Generator Online | Toolbox Hub",
      description:
        "Round each corner of a box separately, watch the shape update, and copy the border-radius CSS into a stylesheet.",
    },
  },
  "color-palette": {
    en: {
      title: "Color Palette Generator from One Hex | Toolbox Hub",
      description:
        "Start with a base color and get complementary, analogous, triadic, split-complementary, and tetradic schemes, plus tints and shades.",
    },
  },
  "emoji-picker": {
    en: {
      title: "Emoji Picker — Search by Keyword & Copy | Toolbox Hub",
      description:
        "Search emoji by a word such as fire, coffee, or warning, then copy the character instead of scrolling a full grid.",
    },
  },
  "text-shadow-generator": {
    en: {
      title: "CSS Text Shadow Generator Online | Toolbox Hub",
      description:
        "Choose offset, blur, color, and opacity for a shadow behind text, preview the result, and copy the text-shadow CSS.",
    },
  },
  "contrast-checker": {
    en: {
      title: "WCAG Color Contrast Checker Online | Toolbox Hub",
      description:
        "Compare a text color with a background using the WCAG luminance formula and see which contrast levels that pair passes.",
    },
  },
  "favicon-generator": {
    en: {
      title: "Favicon Generator — 64×64 Icon from an Image | Toolbox Hub",
      description:
        "Upload a logo or photo, crop a square from the center, and download a 64 by 64 favicon you can place in a site root.",
    },
  },
  "image-to-base64": {
    en: {
      title: "Image to Base64 Converter — Data URI | Toolbox Hub",
      description:
        "Convert a PNG, JPEG, or other image into a Base64 data URI you can paste into HTML, CSS, or JSON. The file stays on your device.",
    },
  },
  "image-to-text": {
    en: {
      title: "Image to Text — OCR a Photo in the Browser | Toolbox Hub",
      description:
        "Read printed text from a screenshot or photo with Tesseract in your browser. Handwriting is less reliable. The image is not uploaded.",
    },
  },
  "file-size-converter": {
    en: {
      title: "File Size Converter — Bytes, KB, MB, GB | Toolbox Hub",
      description:
        "Convert bytes through terabytes in both binary units (1024) and decimal units (1000), so a disk label and an OS report can be compared.",
    },
  },
  "length-converter": {
    en: {
      title: "Length Converter — Meters, Feet, Inches, Miles | Toolbox Hub",
      description:
        "Convert meters, kilometers, centimeters, millimeters, miles, yards, feet, inches, and nautical miles from a single measurement.",
    },
  },
  "weight-converter": {
    en: {
      title: "kg to lbs Converter — Grams, Ounces & Stone | Toolbox Hub",
      description:
        "Convert kilograms, grams, milligrams, metric tons, pounds, ounces, and stone. Enter one weight and read the others.",
    },
  },
  "temperature-converter": {
    en: {
      title: "Celsius to Fahrenheit & Kelvin Converter | Toolbox Hub",
      description:
        "Convert Celsius, Fahrenheit, and Kelvin. The scales do not share a zero, so the result includes the offset, not only a multiplier.",
    },
  },
  "speed-converter": {
    en: {
      title: "Speed Converter — km/h, mph, Knots & Mach | Toolbox Hub",
      description:
        "Convert meters per second, kilometers per hour, miles per hour, knots, and Mach. One speed fills in the other four.",
    },
  },
  "area-converter": {
    en: {
      title: "Area Converter — Acres, Hectares & Square Feet | Toolbox Hub",
      description:
        "Convert square meters, square kilometers, square feet, square yards, acres, hectares, and square inches from one area.",
    },
  },
  "volume-converter": {
    en: {
      title: "Volume Converter — Liters, Gallons, Cups & Pints | Toolbox Hub",
      description:
        "Convert liters, milliliters, cubic meters, gallons, quarts, pints, cups, fluid ounces, and tablespoons from one volume.",
    },
  },
  "time-converter": {
    en: {
      title: "Time Unit Converter — Seconds, Hours & Days | Toolbox Hub",
      description:
        "Convert seconds, minutes, hours, days, weeks, months, and years. Any pair goes through seconds, so you do not chain steps.",
    },
  },
  "age-calculator": {
    en: {
      title: "Age Calculator — Years, Months & Days | Toolbox Hub",
      description:
        "Enter a birth date and get age in years, months, and days, the total days lived, and how long until the next birthday.",
    },
  },
  "date-difference": {
    en: {
      title: "Days Between Two Dates Calculator | Toolbox Hub",
      description:
        "Pick two dates and see the gap as total days, weeks, weekdays, hours, and a calendar split into years, months, and days.",
    },
  },
  "days-until": {
    en: {
      title: "Days Until a Date — Countdown Calculator | Toolbox Hub",
      description:
        "Count the days from today until a future date, or back to a date that has already passed. One field covers both.",
    },
  },
  "bmi-calculator": {
    en: {
      title: "BMI Calculator — Metric and Imperial | Toolbox Hub",
      description:
        "Enter weight and height in kilograms and centimeters, or pounds and feet, and get Body Mass Index plus the standard category.",
    },
  },
  "random-number": {
    en: {
      title: "Random Number Generator with a Min and Max | Toolbox Hub",
      description:
        "Generate one whole number between a minimum and a maximum you set, including both ends. The draw uses Math.random, so keep it for games rather than secrets.",
    },
  },
  "dice-roller": {
    en: {
      title: "Online Dice Roller — d4, d6, d20 & d100 | Toolbox Hub",
      description:
        "Roll virtual dice from a d4 up to a d100. Each face is listed beside the total, so a multi-die result is easy to check.",
    },
  },
  "email-validator": {
    en: {
      title: "Email Validator — Check Address Syntax | Toolbox Hub",
      description:
        "Paste one address or many, separated by commas, spaces, or new lines, and mark each one valid or invalid on syntax alone.",
    },
  },
  "url-parser": {
    en: {
      title: "URL Parser — Split a Link into Parts | Toolbox Hub",
      description:
        "Paste a web address and read the protocol, host, port, path, query string, and fragment as separate labeled fields.",
    },
  },
  "meta-tag-generator": {
    en: {
      title: "HTML Meta Tag Generator — Title & Description | Toolbox Hub",
      description:
        "Type a title and a description separated by a vertical bar, then copy the title tag, meta description, and matching Open Graph tags.",
    },
  },
  "youtube-thumbnail": {
    en: {
      title: "YouTube Thumbnail Downloader — Full Resolution | Toolbox Hub",
      description:
        "Paste a YouTube link and copy the direct image URLs for that video's thumbnails, including the highest-resolution still.",
    },
  },
  "open-graph-generator": {
    en: {
      title: "Open Graph Tag Generator for Link Previews | Toolbox Hub",
      description:
        "Type a page URL, title, and description separated by vertical bars, then copy og:url, og:title, and og:description tags.",
    },
  },
  "url-extractor": {
    en: {
      title: "Extract URLs from Text Online | Toolbox Hub",
      description:
        "Paste an email, a log, or notes and list every http and https link on its own line, with the surrounding text left out.",
    },
  },
  "password-strength": {
    en: {
      title: "Password Strength Checker — Score out of 7 | Toolbox Hub",
      description:
        "Score a password from its length and whether it includes lowercase, uppercase, digits, and symbols. Each rule is shown beside the score.",
    },
  },
  "stopwatch": {
    en: {
      title: "Online Stopwatch with Lap Times | Toolbox Hub",
      description:
        "Time an interval to a hundredth of a second. Start, pause, record laps, and reset without installing a timer app.",
    },
  },
  "world-clock": {
    en: {
      title: "World Clock — UTC, New York, London, Tokyo | Toolbox Hub",
      description:
        "Compare the current time where you are with UTC, New York, London, and Tokyo. The clocks follow your device, not a remote server.",
    },
  },
  "caesar-cipher": {
    en: {
      title: "Caesar Cipher Encoder and Decoder Online | Toolbox Hub",
      description:
        "Shift every letter a fixed number of places through the alphabet, wrapping from Z to A, to encode a note or read one back.",
    },
  },
  "rot13-encoder": {
    en: {
      title: "ROT13 Encoder and Decoder Online | Toolbox Hub",
      description:
        "Shift letters thirteen places. The same step encodes and decodes, which is why ROT13 is used to hide spoilers in plain text.",
    },
  },
  "binary-text": {
    en: {
      title: "Binary to Text Converter Online | Toolbox Hub",
      description:
        "Convert text into binary bytes, or paste ones and zeros to recover the characters. The direction is detected from what you paste.",
    },
  },
  "hex-text": {
    en: {
      title: "Hex to Text Converter Online | Toolbox Hub",
      description:
        "Decode hexadecimal byte pairs into characters, or encode text as hex. Spaces between pairs are accepted on the way back.",
    },
  },
  "pomodoro-timer": {
    en: {
      title: "Pomodoro Timer — 25 Minute Focus Online | Toolbox Hub",
      description:
        "Run a 25-minute focus block, then a 5-minute break. The timer switches on its own when the current block ends.",
    },
  },
  "phone-formatter": {
    en: {
      title: "Phone Number Formatter — (123) 456-7890 | Toolbox Hub",
      description:
        "Strip punctuation from a phone number. Ten digits become (123) 456-7890; 7 and 11 digits use the matching North American form.",
    },
  },
  "archive-tool": {
    en: {
      title: "Create a ZIP or TAR & Unzip Online | Toolbox Hub",
      description:
        "Pack selected files into a ZIP or TAR, or open one of those archives and download the files inside. 7z and RAR are not supported.",
    },
  },
  "pdf-toolkit": {
    en: {
      title: "Merge, Split, and Convert a PDF in the Browser | Toolbox Hub",
      description:
        "Merge PDFs, extract page ranges, turn PNG or JPG files into a PDF, or export pages as PNG and text. No Word conversion. Files stay in the browser.",
    },
  },
  "compress-pdf": {
    en: {
      title: "Compress PDF Online — Smaller Files in Your Browser | Toolbox Hub",
      description:
        "Recompress embedded images and compare the original size, new size, and savings. Text-only PDFs often barely shrink. Nothing is uploaded.",
    },
  },
  "rotate-pdf": {
    en: {
      title: "Rotate PDF Online — 90, 180, or 270 Degrees | Toolbox Hub",
      description:
        "Rotate every page, or only the pages you pick, by 90, 180, or 270 degrees. The new PDF downloads from your browser.",
    },
  },
  "organize-pdf": {
    en: {
      title: "Organize PDF Online — Reorder and Delete Pages | Toolbox Hub",
      description:
        "Reorder PDF pages, delete the ones you do not need, and download the new document. Large buttons work on a phone. Files stay on your device.",
    },
  },
  "watermark-pdf": {
    en: {
      title: "Watermark PDF Online — Text or Image Stamp | Toolbox Hub",
      description:
        "Stamp text or a PNG or JPG on every page. Position, opacity, rotation, and size are written into the PDF. The file is not uploaded.",
    },
  },
  "pdf-page-numbers": {
    en: {
      title: "Add Page Numbers to PDF Online | Toolbox Hub",
      description:
        "Number PDF pages with a position, font size, typeface, and starting number. Choose a plain number, Page 1, or 1 of 4. Runs in the browser.",
    },
  },
  "protect-pdf": {
    en: {
      title: "Protect PDF Online — Password to Open | Toolbox Hub",
      description:
        "Encrypt a PDF so opening it requires a password you choose. Standard PDF protection, not a promise the file cannot be broken. Nothing is uploaded.",
    },
  },
  "roman-numerals": {
    en: {
      title: "Roman Numeral Converter — Numbers Both Ways | Toolbox Hub",
      description:
        "Convert an ordinary number to a Roman numeral, or a Roman numeral to a number. The direction follows what you type.",
    },
  },
  "prime-checker": {
    en: {
      title: "Prime Number Checker — Divisor If Composite | Toolbox Hub",
      description:
        "Enter a whole number and see whether it is prime. When it is not, the checker names a divisor so you can verify the result.",
    },
  },
  "factorial-calculator": {
    en: {
      title: "Factorial Calculator — Compute n! in Full | Toolbox Hub",
      description:
        "Calculate n factorial, the product of every whole number from 1 to n, with full precision instead of a rounded estimate.",
    },
  },
  "scientific-notation": {
    en: {
      title: "Scientific Notation Converter Online | Toolbox Hub",
      description:
        "Rewrite a number as a mantissa times ten to a power, and keep the plain decimal beside it so you can check the conversion.",
    },
  },
  "decimal-fraction": {
    en: {
      title: "Decimal to Fraction Calculator — Lowest Terms | Toolbox Hub",
      description:
        "Turn a decimal such as 0.625 into a fraction and reduce it to lowest terms. The digits you type set the starting denominator.",
    },
  },
  "gcf-calculator": {
    en: {
      title: "GCF and LCM Calculator Online | Toolbox Hub",
      description:
        "Enter two or more whole numbers and get both the greatest common factor and the least common multiple at once.",
    },
  },
  "video-compressor": {
    en: {
      title: "Compress Video Online — Smaller MP4 Files | Toolbox Hub",
      description:
        "Shrink a video with a quality, bitrate, or target-size setting. Encoding uses ffmpeg in the browser and the download is an MP4.",
    },
  },
  "video-converter": {
    en: {
      title: "Video Converter — MP4, WebM, MOV, MKV, AVI | Toolbox Hub",
      description:
        "Change a video between MP4, WebM, MOV, MKV, and AVI without uploading the file. Conversion runs on your device.",
    },
  },
  "video-merger": {
    en: {
      title: "Merge Videos Online — Join Clips into MP4 | Toolbox Hub",
      description:
        "Join two to ten video clips into a single MP4. The clips are combined in your browser, in the order you add them.",
    },
  },
  "video-speed-changer": {
    en: {
      title: "Change Video Speed Online — 0.25× to 4× | Toolbox Hub",
      description:
        "Speed a clip up or slow it down anywhere from 0.25× to 4×. The new file is encoded on your device and downloaded from the page.",
    },
  },
  "video-transformer": {
    en: {
      title: "Flip, Rotate & Reverse a Video Online | Toolbox Hub",
      description:
        "Flip a video horizontally or vertically, rotate it, or reverse the playback. The transformed file is produced in the browser.",
    },
  },
  "video-trimmer": {
    en: {
      title: "Trim Video Online — Cut by Start and End | Toolbox Hub",
      description:
        "Keep only the part of a video between two times. The cut happens in the browser and does not re-encode the kept segment.",
    },
  },
  "video-resizer": {
    en: {
      title: "Resize Video Online — 1080p, 720p, or Custom | Toolbox Hub",
      description:
        "Change a video's resolution in the browser and download an MP4. Presets include 1080p, 720p, 480p, and 360p. Upscaling does not add real detail.",
    },
  },
  "video-cropper": {
    en: {
      title: "Crop Video Online — Match the Preview | Toolbox Hub",
      description:
        "Crop a video to 16:9, 9:16, 1:1, 4:5, or a custom region. The MP4 matches the box on the preview. The file stays on your device.",
    },
  },
  "video-to-gif": {
    en: {
      title: "Video to GIF Converter Online | Toolbox Hub",
      description:
        "Turn the part of a video you select into a GIF and download the animation. Conversion runs in the browser, not on a server.",
    },
  },
  "video-to-audio": {
    en: {
      title: "Extract Audio from Video — MP3, WAV & More | Toolbox Hub",
      description:
        "Pull the soundtrack out of a video and save it as MP3, AAC, WAV, OGG, Opus, or FLAC. The source file stays on your device.",
    },
  },
  "video-frame-capture": {
    en: {
      title: "Capture Frames from a Video as Images | Toolbox Hub",
      description:
        "Step through a video and save still frames as images. Capture runs in the browser, so the footage is not uploaded.",
    },
  },
  "audio-converter": {
    en: {
      title: "Audio Converter — MP3, WAV, M4A & OGG | Toolbox Hub",
      description:
        "Convert an audio file between WAV, MP3, M4A, and OGG. Decoding and encoding use the Web Audio API in your browser.",
    },
  },
  "audio-trimmer": {
    en: {
      title: "Audio Trimmer — Cut a Track on a Waveform | Toolbox Hub",
      description:
        "Trim an audio file to the section you need. The waveform shows where the cut falls before you download the shorter track.",
    },
  },
  "pilko-frame-studio": {
    en: {
      title: "Video Frame Studio — Scenes & Contact Sheets | Toolbox Hub",
      description:
        "Grab frames by hand, on scene changes, or at subtitle timestamps, and lay them out as a contact sheet. Images stay on your device.",
    },
  },
  "viral-video-studio": {
    en: {
      title: "Short Video Script Workshop — Hooks and a Shot List | Toolbox Hub",
      description:
        "Fill a topic and get a hook, a shot list, and caption lines from templates. The 9:16 frame is a reading preview, not a rendered video.",
    },
  },
  "teleprompter": {
    en: {
      title: "Online Teleprompter — Auto-Scroll a Script | Toolbox Hub",
      description:
        "Paste a script or import a text or subtitle file and let it scroll at a speed you set. Mirror mode and fullscreen are built in.",
    },
  },
  "subtitle-editor": {
    en: {
      title: "SRT Editor — Convert VTT, ASS & Subtitles | Toolbox Hub",
      description:
        "Open an SRT, VTT, ASS, SSA, or SBV file, edit the cues and timing, and export SRT, VTT, or ASS. The file is not uploaded.",
    },
  },
  "add-subtitles": {
    en: {
      title: "Add Subtitles to a Video — Burn In SRT or VTT | Toolbox Hub",
      description:
        "Burn SRT, VTT, or ASS captions into a video and download an MP4. The bundled font covers Latin, Greek, and Cyrillic, not Chinese, Japanese, or Korean.",
    },
  },
  "openreel-video-editor": {
    en: {
      title: "OpenReel Video Editor — Timeline in the Browser | Toolbox Hub",
      description:
        "Cut on a multi-track timeline, add text, transitions, and audio, then export. Footage stays on your device. A current Chromium browser is the comfortable case.",
    },
  },
};

/** 取某 (lang, slug) 的 SEO 覆盖；未覆盖返回 undefined，调用方回退到原拼法 */
export function getToolSeoOverride(lang: string, slug: string): ToolSeoOverride | undefined {
  return OVERRIDES[slug]?.[lang];
}

/** 供校验脚本使用：列出全部覆盖项 */
export function listSeoOverrides(): { lang: string; slug: string }[] {
  return Object.entries(OVERRIDES).flatMap(([slug, byLang]) =>
    Object.keys(byLang).map((lang) => ({ lang, slug }))
  );
}
