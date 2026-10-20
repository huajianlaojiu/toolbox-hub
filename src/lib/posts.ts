export interface Block {
  /** 二级标题 */
  h?: string;
  /** 段落，支持 [[tool-slug|Tool Title]] 内链 */
  p?: string;
  /** 列表项，同样支持内链 */
  l?: string[];
  /** 提示框 */
  b?: string;
  /** 步骤标题（有序列表的小标题） */
  s?: string;
}

export interface Post {
  slug: string;
  title: string;
  metaTitle: string;
  description: string;
  date: string;
  updated: string;
  readingTime: string;
  category: string;
  blocks: Block[];
}

/** 把 [[slug|Title]] 渲染前拆分用 */
export function parseLinks(text: string): { text: string; href?: string }[] {
  const out: { text: string; href?: string }[] = [];
  const re = /\[\[([a-z0-9-]+)\|([^\]]+)\]\]/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push({ text: text.slice(last, m.index) });
    out.push({ text: m[2], href: `/tools/${m[1]}/` });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last) });
  return out;
}

export const posts: Post[] = [
  {
    slug: "browser-tools-for-developers",
    metaTitle: "24 Free Browser Tools Every Developer Should Bookmark (2026)",
    title: "The Developer's Toolkit: 24 Free Browser Tools That Replace Paid Apps",
    description:
      "A practical guide to formatting, converting, encoding and debugging data using free browser-based developer tools — no installs, no accounts, nothing uploaded.",
    date: "2026-10-20",
    updated: "2026-10-20",
    readingTime: "12 min read",
    category: "Developer Tools",
    blocks: [
      {
        p:
          "Most of the small jobs you do a hundred times a week — reformatting an API response, decoding a token, checking a hash, indenting a slug of SQL — do not need an IDE, a paid subscription or a team licence. They need one tab open for ninety seconds.\n\nThe collection below is twenty-four browser-based utilities covering formatting, conversion, encoding, hashing and debugging. Every one of them runs entirely in your page: your data is never sent to a server, which matters more than developers usually admit, because the payload you paste is usually a customer's.",
      },
      { h: "What browser-based tools can and cannot replace" },
      {
        p:
          "Be realistic about the boundary. These tools replace one-off, low-stakes, high-frequency chores. They do not replace your language server, your debugger, your test suite or anything you need to run against a real environment repeatedly.",
      },
      {
        l: [
          "**Good fit:** reading a response once, debugging a single value, converting a file for one import, checking a format before shipping.",
          "**Bad fit:** running the same check on every deploy, transforming hundreds of files, anything that must fail loudly in CI.",
          "**Never:** anything involving credentials you cannot rotate. Paste a revoked token, not a live one.",
        ],
      },
      {
        p:
          "With that said, the reason to keep these bookmarked is throughput. A task that takes forty seconds in a browser tab never gets scheduled, never gets delegated, and never becomes a reason to open an IDE at eight in the evening.",
      },

      { h: "Formatting and converting data" },
      {
        p:
          "The most common daily job is making data readable. An API returns a single-line blob, a colleague sends a config file with tabs mangled by a chat window, or you exported a spreadsheet to JSON and it came back as one enormous line.",
      },
      {
        l: [
          "[[json-formatter|JSON Formatter]] — indent, validate and read a payload. Use it before you debug: half of all \"the API is broken\" tickets are actually malformed JSON with a trailing comma.",
          "[[json-validator|JSON Validator]] — when you need a strict pass/fail answer rather than a pretty print.",
          "[[xml-formatter|XML Formatter]] — the same job for SOAP responses, RSS feeds and Maven POMs that nobody has touched since 2014.",
          "[[sql-formatter|SQL Formatter]] — paste an unreadable generated query and get something you can actually put in a pull request.",
          "[[css-minifier|CSS Minifier]], [[js-minifier|JS Minifier]] and [[html-minifier|HTML Minifier]] — shrink assets when you want a quick size win before you set up a real build step.",
          "[[json-to-yaml|JSON to YAML]], [[yaml-to-json|YAML to JSON]], [[csv-to-json|CSV to JSON]] and [[json-to-csv|JSON to CSV]] — moving data between the formats real systems actually use.",
        ],
      },
      {
        p:
          "Keep the last group in mind for one specific scenario: a client hands you a spreadsheet and expects it in their API. Going CSV to JSON directly is a two-minute job rather than an afternoon of scripting.",
      },

      { h: "Encoding and escaping" },
      {
        p:
          "Encoding bugs are disproportionately annoying because the data looks fine. The value \"San José & Sons\" arrives as \"San Jos%C3%A9 %26 Sons\" and your comparison against the database fails for reasons that are invisible in the logs.",
      },
      {
        l: [
          "[[url-encoder|URL Encoder / Decoder]] — settle immediately whether a query string is double-encoded.",
          "[[base64-encoder|Base64 Encoder / Decoder]] — decode a certificate fragment, or encode a small asset to inline in CSS.",
          "[[html-entity-encoder|HTML Entity Encoder / Decoder]] — find out whether that stray \"&amp;\" in your page came from your template or your data.",
          "[[unicode-converter|Unicode Converter]] — useful when a \"broken\" character turns out to be a legitimate one rendered in the wrong encoding.",
          "[[number-base-converter|Number Base Converter]] — check a colour, a permission bitmask or a memory address without a calculator app.",
        ],
      },
      {
        b:
          "A practical habit: when a value arrives garbled, decode it one layer at a time and paste each result into a blank field. If the first decode produces readable text, the problem is one extra encode somewhere upstream. If it produces mojibake, you have an encoding problem rather than an escaping problem, and those two need different fixes.",
      },

      { h: "Identifiers, hashes and tokens" },
      {
        p:
          "This group is where developers waste the most time hunting for the right local script that they wrote once and lost.",
      },
      {
        l: [
          "[[uuid-generator|UUID Generator]] — generate v4 identifiers for seed data, fixtures or a quick database row.",
          "[[md5-generator|MD5 / SHA Hash Generator]] — verify a download or confirm that two files that should be identical actually are.",
          "[[jwt-decoder|JWT Decoder]] — read the payload of a token to check a scope or an expiry without writing a script. Remember to treat the contents of any token you paste as sensitive.",
          "[[timestamp-converter|Timestamp Converter]] — the single most-used tool in this whole list. When a log line says 1761000000, this is what tells you whether the incident happened during the deploy or before it.",
        ],
      },
      {
        p:
          "The timestamp converter earns its keep for one specific reason: an epoch number is unambiguous and useless at the same time. You know exactly when something happened and you cannot tell a colleague. Converting once usually settles a louder argument than it should.",
      },

      { h: "Comparing and debugging" },
      {
        l: [
          "[[diff-checker|Diff Checker]] — find what changed between two payloads without opening a desktop diff tool.",
          "[[regex-tester|Regex Tester]] — the highest-leverage item here. A regular expression that looks correct and quietly matches nothing is one of the most expensive bugs in development, because it fails silently in the one place nobody reads.",
          "[[html-preview|HTML Preview]] — iterate on a fragment of markup to check how it actually renders.",
          "[[lorem-ipsum|Lorem Ipsum Generator]] — placeholder copy that is fast to generate and fast to strip out.",
        ],
      },
      {
        p:
          "Test your regular expressions against the input you actually expect, including the empty string, a Unicode name and a value with a newline. Most patterns break on the third case and nobody notices until production data arrives.",
      },

      { h: "A worked example: three tools, one boring incident" },
      {
        p:
          "Here is the sequence that convinced me to bookmark all of this. A customer reported that a record they submitted on Tuesday was missing from a report on Thursday.",
      },
      {
        l: [
          "**1. Convert the timestamp.** The report job logged the record's creation time as an epoch value. The [[timestamp-converter|Timestamp Converter]] showed the record was created at 11pm local, which is Tuesday — the job's timezone assumption was the problem, not the record.",
          "**2. Format the payload.** Taking the stored JSON through the [[json-formatter|JSON Formatter]] revealed the record was written with a null date field, because the client twice-called the same endpoint 200ms apart and the second write won.",
          "**3. Decode the token.** The [[jwt-decoder|JWT Decoder]] confirmed both calls used the same API key — it was a client retry, not two customers.",
        ],
      },
      {
        p:
          "Total elapsed time: four minutes. The prior attempt at this investigation, which looked for the same root cause in a logging platform, took an afternoon and produced a wrong conclusion.",
      },

      { h: "Privacy: why running locally is the actual feature" },
      {
        p:
          "Every tool in this library processes your input inside your own browser. Nothing is uploaded, which means no retention question, no processor agreement, and no uncomfortable conversation about the production payload you pasted three minutes ago.\n\nThis is the reason to prefer these tools over a hosted \"pastebin API\" or an online service that asks you to sign up. It also means they keep working on a flight, in a basement, or when the corporate VPN has decided to block yet another domain.",
      },
      {
        p:
          "One caveat worth stating plainly: an offline-capable page is only private if the page itself is the code you think it is. On a shared machine, use a private window and close it when you are done, especially if you have been decoding tokens.",
      },

      { h: "Building a workflow around them" },
      {
        p:
          "The tools are individually trivial. The value is in the habit of reaching for one immediately instead of \"getting to it later\", because later is when you write a throwaway script, or open an IDE, or decide it is not worth checking at all.",
      },
      {
        l: [
          "Bookmark the collection, not individual URLs, and put it in your browser's toolbar.",
          "When something looks wrong, check it before you form a theory. Costs fifteen seconds; kills whole classes of wrong conclusions.",
          "When you have checked the same thing twice, that is the signal to automate it — but do not automate on suspicion.",
          "Do not paste production secrets. Rotate anything you are unsure about.",
        ],
      },

      { h: "Frequently asked questions" },
      {
        p:
          "**Are these tools free?** Yes, entirely, with no account and no usage limit. There is no paid tier holding back anything basic.\n\n**Do they work offline?** Once a page has loaded, yes — everything runs in your browser. Reloading requires a connection.\n\n**Can I use them for commercial work?** Yes. The output is yours with no attribution requirement.\n\n**Is there an API?** No, and that is deliberate — the value is the interface. Export the output and process it however you like.\n\n**Why not just install a CLI tool instead?** Install one when you need it three times. Use a browser tab for the first two.",
      },
    ],
  },

  {
    slug: "text-tools-for-writers",
    metaTitle: "17 Free Text Tools for Writers, Students and Marketers",
    title: "17 Free Text Tools for Writers, Students and Marketers",
    description:
      "Clean up copy, count words accurately, format lists and turn rough drafts into something publishable — with free browser tools that never upload your text.",
    date: "2026-10-20",
    updated: "2026-10-20",
    readingTime: "10 min read",
    category: "Text Tools",
    blocks: [
      {
        p:
          "Writing for work involves a surprising amount of mechanical drudgery that has nothing to do with writing: stripping stray whitespace from a pasted paragraph, checking a word limit, de-duplicating a list of names, converting something into a URL slug.\n\nThese seventeen tools are for that part of the job. They all run locally in the browser, which is not a small detail — the draft you paste is often unpublished, and the list you are sorting is often somebody's personal data.",
      },

      { h: "Measuring what you have written" },
      {
        p:
          "Word count sounds solved until a client asks for exactly 800 words and your editor says 820, or a form rejects your text at 1,995 characters with no explanation of where the newline went.",
      },
      {
        l: [
          "[[word-counter|Word Counter]] — the standard measure. Paste, read, adjust.",
          "[[letter-counter|Letter Counter]] — counts characters and letter frequency. Useful when you are debugging why one paragraph feels wrong: it is usually a repeated letter pattern, not a dream.",
          "[[text-stats|Advanced Text Statistics]] — reading time, sentence count and average word length in one pass. This is the one to use before you commit to a length you have not tried.",
        ],
      },
      {
        p:
          "A note on what \"a word\" means: different counters disagree on hyphenation, numbers and URLs. If an exact number matters, use the same counter the person checking your work uses, and agree on it in advance. This is a genuinely common source of small, pointless arguments.",
      },

      { h: "Cleaning up copy you did not write" },
      {
        p:
          "Most text you receive is slightly damaged: double spaces from a copy-paste, a stray tab, inconsistent capitalisation from someone typing in a hurry. Fixing it by hand is slow and error-prone.",
      },
      {
        l: [
          "[[text-trimmer|Text Trimmer]] — remove leading and trailing whitespace from every line at once. This fixes more \"formatting looks broken\" reports than anything else on this list.",
          "[[text-case-converter|Text Case Converter]] — switch between sentence case, title case, upper and lower across a block. Also the fastest way to undo an accidental CAPS LOCK paragraph.",
          "[[text-to-slug|Text to Slug]] — turn a headline into a clean URL slug. Paste your title, get the slug, done.",
        ],
      },
      {
        p:
          "The slug generator has one use beyond URLs: it is a fast way to make a readable filename or anchor that a human can parse at a glance, which beats `final_final_v3`.",
      },

      { h: "Working with lists" },
      {
        p:
          "Listicles, inventories, mail merges, tag cleanups, survey responses, spreadsheet columns — at some point everything becomes a list and every list needs sorting, de-duplicating or randomising.",
      },
      {
        l: [
          "[[duplicate-line-remover|Duplicate Line Remover]] — compare two lists, or clean one. The output tells you how many duplicates were removed, which is useful when you are reporting the result.",
          "[[text-sorter|Text Sorter]] — sort alphabetically, by length, numerically. Handles the case where a naive sort puts item 10 before item 2.",
          "[[list-sorter|List Sorter]] — the same job for structured list input.",
          "[[list-randomizer|List Randomizer]] — shuffle a draw order, a quiz sequence or a ring-fenced shortlist so nobody suspects favouritism.",
          "[[line-number-adder|Line Number Adder]] — number lines for reference in a ticket or a code review comment.",
        ],
      },
      {
        b:
          "The classic trap here is a list that looks de-duplicated but is not: `Apple`, `apple ` and `Apple.` are three different lines to a computer. Trim whitespace and strip trailing punctuation before you dedupe, or you will merge nothing and conclude the data is clean.",
      },

      { h: "Previewing and formatting" },
      {
        p:
          "Markdown has won, but not uniformly. Half your tools render it, half do not, and the half that does not is usually the one someone senior has to paste into.",
      },
      {
        l: [
          "[[markdown-preview|Markdown Preview]] — live rendering, so you can check a table or a nested list actually looks right before it reaches a client.",
          "[[text-reverse|Text Reverser]] — reverse text by character or by word. Obscure until you need to check whether a template string is being reversed by a plugin.",
          "[[text-repeater|Text Repeater]] — repeat a string N times. Useful for generating padding, test data or, occasionally, making a point in a document.",
        ],
      },
      {
        p:
          "The Markdown preview is the tool that quietly saves the most time in this whole set, because a broken table in a rendered document is far more visible — and far more embarrassing — than a broken table in raw text.",
      },

      { h: "The rest, and when to reach for them" },
      {
        l: [
          "[[random-string|Random String Generator]] — generate readable nonces, placeholder IDs or short codes. Better than inventing something by hand, because you will not accidentally reuse it.",
          "[[morse-code|Morse Code Translator]] — genuinely fun, occasionally useful for a themed project or a puzzle.",
          "[[palindrome-checker|Palindrome Checker]] — a party trick that is also a legitimate string-processing sanity check.",
        ],
      },
      {
        p:
          "These are lower-frequency tools, but they cost nothing to keep bookmarked and they solve the specific problem of \"I need a random-looking value right now and I do not trust myself to make one up\".",
      },

      { h: "A realistic editing pass" },
      {
        p:
          "Here is the order that works when a draft arrives from someone else and needs to go out under your name.",
      },
      {
        l: [
          "**1. Trim.** Run the whole document through the [[text-trimmer|Text Trimmer]] first. Whitespace damage hides inside paragraphs where you will never see it.",
          "**2. Clean case.** Use the [[text-case-converter|Text Case Converter]] for the headline only. Never apply case conversion to a full draft — it destroys proper nouns.",
          "**3. Measure.** Check length with the [[word-counter|Word Counter]] and reading time with [[text-stats|Advanced Text Statistics]] so you know before writing what shape the piece is.",
          "**4. Preview.** If it contains Markdown, render it with the [[markdown-preview|Markdown Preview]].",
          "**5. Slug.** Generate the URL slug last, from the final headline, with [[text-to-slug|Text to Slug]] — changing the headline afterwards breaks the slug.",
        ],
      },
      {
        p:
          "The whole pass takes a few minutes and eliminates the category of mistake where a document is technically correct and visibly wrong.",
      },

      { h: "Writers' questions about privacy" },
      {
        p:
          "**Does my unpublished text leave my computer?** No. These tools process text in your browser and nothing is stored or transmitted.\n\n**Is there a length limit?** There is no server-side limit because there is no server call. Extremely large inputs are limited by your own device's memory.\n\n**Can I use the output commercially?** Yes, freely, with no attribution.\n\n**Do they work on a phone?** Yes. The layout adapts, and the same code runs.",
      },

      { h: "What these tools will not do for you" },
      {
        p:
          "Worth being blunt about the limits, because a tool that mechanises the wrong thing just produces a faster mistake.\n\nNone of these utilities can tell you whether a sentence is clear, whether a claim is sourced, or whether a tone is right for the audience. They count characters; they do not judge prose. A text that scores beautifully on every metric on this page can still be unreadable.\n\nNor do they edit. The moment you find yourself rewriting individual clauses by hand at scale, you have outgrown a text tool and you want either a proper editor, a find-and-replace with regex — which the [[regex-tester|Regex Tester]] is genuinely good for rehearsing — or a script. Use the browser for the mechanical layer, and keep your own judgement for everything above it.",
      },
      {
        p:
          "One more thing they will not do is fix a bad source. If your spreadsheet is full of inconsistent naming — \"Dr\", \"DR\", \"Dr.\" all in one column — a tool will sort and de-duplicate what you gave it faithfully, and you will still have three entries where there should be one. Cleaning the data is a decision, not a mechanical step. Decide the canonical form first, then apply it, then check.",
      },

      { h: "Keeping a working list usable" },
      {
        p:
          "If you maintain a list of leads, links, references or terms, it degrades quietly. The failure mode is always the same: entries that look identical are not, and one merge removes nothing.\n\nA maintenance pass that works is boring: trim whitespace, standardise capitalisation, strip trailing punctuation, then de-duplicate. In that order — trimming after de-duplicating loses entries. Doing this once a month on an active list turns a two-hour unrecoverable mess into a ten-minute chore.\n\nWhen two lists need reconciling — say, a registration list against an attendance list — sort both with the [[list-sorter|List Sorter]] first, so they line up, then compare by eye. Sorting both sides before comparing is the difference between a two-minute check and a twenty-minute hunt.",
      },

      { h: "The takeaway" },
      {
        p:
          "None of these tools is clever. That is the point: they remove the mechanical five percent of writing that is not writing, so the remaining ninety-five percent is actually about sentences. Bookmark the ones you use monthly, ignore the rest, and stop fixing whitespace by hand.",
      },
    ],
  },

  {
    slug: "calculators-and-converters-guide",
    metaTitle: "18 Free Calculators and Converters for Everyday Numbers",
    title: "18 Free Calculators and Converters for the Numbers You Actually Deal With",
    description:
      "Percentages, discounts, tips, loans, dates, BMI and unit conversions — free browser calculators that show their reasoning and never save your input.",
    date: "2026-10-20",
    updated: "2026-10-20",
    readingTime: "11 min read",
    category: "Calculators",
    blocks: [
      {
        p:
          "Everybody needs to split a bill, work out whether a discount is genuinely a discount, and convert a temperature or a file size without thinking about it. Everybody also, at least once, gets this wrong in public.\n\nThis is a collection of eighteen calculators and converters covering money, dates, health, and the unit conversions that show up in work and travel. All of them run in the browser: nothing is saved, so the numbers you type are nobody's business but yours.",
      },

      { h: "Money calculations" },
      {
        p:
          "The most common real-world math is a percentage of something. Sales tax, a tip, a discount stack, a commission, a growth rate. The formula is simple, and yet the reason people get it wrong is almost always the same: they apply a percentage to the wrong base.",
      },
      {
        l: [
          "[[percentage-calculator|Percentage Calculator]] — the general case, including \"what percent is X of Y\" and \"increase/decrease by\".",
          "[[discount-calculator|Discount Calculator]] — work out the final price and, more importantly, how much you saved. Useful for spotting a \"50% off\" that is really 20% after a raised list price.",
          "[[tip-calculator|Tip Calculator]] — split a bill, pick a percentage, round per person if you want to.",
          "[[loan-calculator|Loan Calculator]] — monthly payment and total interest, which is the number that actually decides whether a loan is affordable.",
        ],
      },
      {
        b:
          "On discounts: a 20% discount followed by another 20% discount is not 40% off — it is 36%. Sequential percentages compound on the reduced base. Any calculator in this list will confirm it in about two seconds, and it is the single most useful arithmetic fact in this article.",
      },
      {
        p:
          "The loan calculator deserves a specific note. The number that matters is not the monthly payment — it is the total interest paid over the life of the loan, because that is the real cost of borrowing. Two loans with identical monthly payments and different terms can differ by tens of thousands in total interest.",
      },

      { h: "Dates and countdowns" },
      {
        p:
          "Date arithmetic is where most people silently get it wrong, because human months have different lengths and the answer changes depending on whether you mean \"calendar months\" or \"30 days\".",
      },
      {
        l: [
          "[[date-difference|Date Difference Calculator]] — days (and total months, years) between two dates.",
          "[[days-until|Days Until Calculator]] — a countdown to a specific date, with the number of working days usually being what people actually want.",
          "[[age-calculator|Age Calculator]] — exact age in years and days, plus the next birthday.",
          "[[timestamp-converter|Timestamp Converter]] — a Unix timestamp into a real date, which matters if you touch logs, databases or API responses.",
        ],
      },
      {
        p:
          "The distinction that trips people up: the number of days between March 1 and April 1 is 31, but the number of *months* is one. If you are calculating a notice period or a subscription term, state which unit you mean, in writing.",
      },

      { h: "Health numbers, honestly" },
      {
        l: ["[[bmi-calculator|BMI Calculator]] — body mass index with the standard categories, and the caveats below."],
      },
      {
        p:
          "BMI is a population-level screening statistic. It says nothing about muscle mass, body composition, or any individual's health, and it is a poor proxy for fitness in athletes, in older adults, and across different ethnic groups. Use it as one data point among several, or as a way to track a change over time — not as a verdict. If you are making decisions that affect your health, the right tool is a clinician, not a browser tab.",
      },

      { h: "Unit conversion: the everyday ones" },
      {
        p:
          "Unit conversion is divided into two kinds: conversions you must get exactly right, and conversions you need roughly. These tools handle both, and the work is in remembering which is which.",
      },
      {
        l: [
          "[[length-converter|Length Converter]] — metric to imperial and back: millimetres, centimetres, metres, kilometres, inches, feet, yards, miles.",
          "[[weight-converter|Weight Converter]] — grams, kilograms, ounces, pounds, tonnes. The one to check before a recipe or a shipping label.",
          "[[temperature-converter|Temperature Converter]] — Celsius, Fahrenheit, Kelvin. Because -10°C is not 14°F, and the formula is not a multiplication.",
          "[[speed-converter|Speed Converter]] — km/h, mph, m/s, knots. Useful for a foreign speed limit or an engineering spec.",
          "[[area-converter|Area Converter]] — square metres, square feet, acres, hectares. This is the one people estimate badly when buying or renting property.",
          "[[volume-converter|Volume Converter]] — litres, millilitres, gallons, cups, cubic metres.",
          "[[time-converter|Time Converter]] — seconds, minutes, hours, days, weeks.",
          "[[data-storage-converter|Data Storage Converter]] — kilobytes to megabytes, and the question of whether the vendor means 1000 or 1024, which is the actual reason a 500 GB drive shows up as 465 GB.",
        ],
      },
      {
        b:
          "Two conversion traps worth knowing: the data-storage one above (marketers sell 10^3, operating systems report 2^10), and fuel economy — a car quoted at 40 mpg (imperial) is closer to 33 mpg (US) than 40, because the imperial gallon is larger. Getting the second one wrong makes a rental car look unrealistically efficient.",
      },

      { h: "The two you will not expect to need" },
      {
        l: [
          "[[random-number|Random Number Generator]] — draws within a range, for a raffle, a bracket, or a quick A/B split. Useful precisely because it removes the suspicion that you rigged it.",
          "[[dice-roller|Dice Roller]] — any die from a coin flip to a twenty-sided die, for a board game or a tabletop session where the real die has rolled off the table for the last time.",
        ],
      },

      { h: "Using a calculator properly" },
      {
        p:
          "A calculator only helps if you know which number you are asking it about. Three habits make the difference.",
      },
      {
        l: [
          "**Round first, compute second.** If the precise number does not change your decision, use a round one. Percentages of round numbers are checkable in your head, which catches input errors.",
          "**Sanity-check the magnitude.** Before believing a result, ask whether it should be bigger or smaller than the input, and by roughly how much. Most arithmetic mistakes survive every check except this one.",
          "**Photograph the inputs, not the output.** When you re-run the calculation later, what matters is knowing what you assumed, not what you concluded.",
        ],
      },

      { h: "Questions people actually ask" },
      {
        p:
          "**Are my numbers stored anywhere?** No. The calculations happen in your browser and nothing is transmitted or retained.\n\n**Do these work on a phone?** Yes, and the calculators are built for one-handed use.\n\n**Which conversion standard do you use for data storage?** Decimal (1 KB = 1000 bytes) by default, because that is how storage is sold. Operating systems report binary, which is why a drive appears to shrink — the tool explains the difference rather than silently picking a side.\n\n**Can I embed these on my own site?** No. Bookmark them instead; the cost of that is zero and the accuracy problem is yours to own.",
      },

      { h: "Percentages: the four mistakes that matter" },
      {
        p:
          "Almost every percentage error a person makes in daily life is one of the same four mistakes. Naming them makes them avoidable.",
      },
      {
        l: [
          "**Wrong base.** \"A 10% rise then a 10% fall leaves you where you started\" is false, because both apply to different bases. Ten per cent of 100 is 10; ten per cent of 90 is 9.",
          "**Percentage of a percentage.** Stacking two discounts multiplies them (0.8 × 0.8 = 0.64, so 36% off), it does not add them.",
          "**Percent versus percentage points.** A rate going from 4% to 6% has risen by 2 percentage points, but by 50% in relative terms. Politics and medicine are full of this confusion, and it is not always accidental.",
          "**Rounding too early.** Rounding an intermediate step before applying a percentage compounds the error. The [[percentage-calculator|Percentage Calculator]] avoids it by keeping full precision internally, but your own scratch pad will not.",
        ],
      },
      {
        p:
          "If you only take one habit from this whole section, take this one: before quoting a percentage to anyone, restate what it is a percentage *of*. Half the arguments you will ever have about a number are actually arguments about the denominator.",
      },

      { h: "Knowing when to stop calculating" },
      {
        p:
          "There is a point where precision stops being useful. A monthly payment to two decimal places is meaningful. A projected total cost to eight decimal places is a way of avoiding the actual decision, which is whether the loan fits inside what you can afford without stress.\n\nThe useful test is the sensitivity question: does the decision change if this input moves by 10%? If not, stop refining it and use the extra time on the variable that does move the answer — usually the term rather than the rate, or the list price rather than the discount.",
      },
      {
        p:
          "And one boundary worth stating plainly: these calculators are arithmetic, not advice. A savings target, a retirement date and a debt payoff plan are all decisions about risk, behaviour and time, and a browser tab cannot weigh any of those. It can only tell you what the numbers imply once you have decided what you are assuming. That distinction is the difference between a calculator being useful and being responsible.",
      },

      { h: "The one-line version" },
      {
        p:
          "Bookmark the money and date calculators properly, treat BMI as one signal rather than a verdict, remember that stacked percentages multiply, and check a unit conversion whenever a number is going into anything contractual. That covers almost everything.",
      },
    ],
  },
];

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}
