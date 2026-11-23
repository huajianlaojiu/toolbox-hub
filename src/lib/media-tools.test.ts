import assert from "node:assert/strict";
import { test } from "node:test";
import { unsupportedCaptionGlyphs } from "./caption-font.ts";
import { HOME_SHORTCUTS, featuredImageLinks, featuredVideoLinks, imageTools, orderedPdfListings, tileLabel, videoTools } from "./file-catalog.ts";
import {
  compressEncoding,
  extensionFor,
  planImageSize,
  rasterKind,
  resizeEncoding,
  sizeForWidth,
  stampBox,
  turnedSize,
} from "./image-raster.ts";
import { assColor, buildAss, drawtextFilter, parseSubtitles, parseTimestamp } from "./subtitles.ts";
import { getTool, visibleTools } from "./tools-data.ts";

test("timestamps treat ASS centiseconds as fractions of a second", () => {
  assert.equal(parseTimestamp("0:00:01.50"), 1500);
  assert.equal(parseTimestamp("00:00:01,500"), 1500);
  assert.equal(parseTimestamp("00:01.250"), 1250);
});

test("SRT, VTT, and ASS parse to the same cue text", () => {
  const srt = "1\n00:00:00,200 --> 00:00:01,800\nHELLO CAPTION\nCafé\n";
  const vtt = "WEBVTT\n\n00:00:00.200 --> 00:00:01.800 align:middle\nHELLO CAPTION\nCafé\n";
  const ass =
    "[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n" +
    "Dialogue: 0,0:00:00.20,0:00:01.80,Default,,0,0,0,,HELLO CAPTION\\NCafé\n";
  for (const source of [srt, vtt, ass]) {
    const cues = parseSubtitles(source);
    assert.equal(cues.length, 1);
    assert.equal(cues[0].start, 200);
    assert.equal(cues[0].end, 1800);
    assert.equal(cues[0].text, "HELLO CAPTION\nCafé");
  }
});

test("SBV cues parse and ASS styling names the bundled font", () => {
  const cues = parseSubtitles("0:00:01.000,0:00:02.000\nHello {world}\n");
  assert.equal(cues[0].text, "Hello");
  const ass = buildAss(cues, { fontSize: 36, color: "#ffcc00", position: "top" }, { width: 640, height: 360 });
  assert.match(ass, /Style: Default,Noto Sans,36,&H0000CCFF/);
  assert.match(ass, /,8,18,18,18,1/);
  assert.equal(assColor("#ffcc00"), "&H0000CCFF");
});

test("drawtext keeps caption text out of the filter graph", () => {
  const cues = parseSubtitles("1\n00:00:00,000 --> 00:00:01,000\nSay 100% now\n");
  const plan = drawtextFilter(cues, { fontSize: 32, color: "nope", position: "bottom" }, 640);
  assert.equal(plan.files.length, 1);
  assert.equal(plan.files[0].text, "Say 100% now");
  assert.match(plan.filter, /fontfile=\/fonts\/NotoSans-Regular\.ttf/);
  assert.match(plan.filter, /fontcolor=0xFFFFFF/);
  assert.match(plan.filter, /expansion=none/);
  assert.doesNotMatch(plan.filter, /Say 100%/);
});

test("bundled font covers European accents and not CJK", () => {
  assert.deepEqual(unsupportedCaptionGlyphs("Café naïve — øł"), []);
  const missing = unsupportedCaptionGlyphs("Hello 中文 café");
  assert.ok(missing.includes("中"));
  assert.ok(missing.includes("文"));
  assert.equal(missing.includes("é"), false);
});

test("resize presets keep aspect ratio and flag upscaling", () => {
  const fitted = sizeForWidth({ width: 800, height: 600 }, 640, true, 600);
  assert.deepEqual(fitted, { width: 640, height: 480 });
  const plan = planImageSize({ width: 800, height: 600 }, fitted, true);
  assert.equal(plan.upscaling, false);
  assert.equal(plan.width, 640);
  assert.equal(plan.height, 480);
  const up = planImageSize({ width: 800, height: 600 }, { width: 1920, height: 1440 }, true);
  assert.equal(up.upscaling, true);
  assert.equal(up.width, 1920);
});

test("compression does not silently change PNG, and GIF must pick a format", () => {
  assert.equal(rasterKind({ name: "a.JPG", type: "" }), "jpeg");
  const png = compressEncoding("png", "same");
  assert.equal(png?.output, "png");
  assert.match(png?.note ?? "", /not TinyPNG/);
  assert.equal(compressEncoding("gif", "same"), null);
  assert.match(compressEncoding("gif", "jpeg")?.note ?? "", /Animation is not kept/);
  assert.equal(resizeEncoding("gif", 100, 100).output, "png");
  assert.equal(resizeEncoding("jpeg", 100, 100).output, "jpeg");
  assert.equal(extensionFor("jpeg"), "jpg");
});

test("a quarter turn swaps width and height, and a corner stamp stays in the margin", () => {
  assert.deepEqual(turnedSize(800, 600, 1), { width: 600, height: 800 });
  assert.deepEqual(turnedSize(800, 600, 2), { width: 800, height: 600 });
  assert.deepEqual(stampBox("bottom-right", 400, 300, 80, 40, 12), { x: 308, y: 248 });
});

test("the new tools are real catalog entries", () => {
  for (const slug of ["add-subtitles", "image-compressor", "image-resizer", "image-cropper", "image-rotator", "image-watermark"]) {
    const tool = getTool(slug);
    assert.ok(tool);
    assert.equal(tool.redirect, undefined);
    assert.equal(visibleTools.some((item) => item.slug === slug), true);
  }
  assert.equal(getTool("subtitle-editor")?.redirect, undefined);
  const imageLabels = featuredImageLinks().map((item) => item.label);
  assert.deepEqual(imageLabels, [
    "Compress Image",
    "Resize Image",
    "Crop Image",
    "Rotate Image",
    "Image Converter",
    "Watermark Image",
    "Image to Text OCR",
  ]);
  assert.equal(featuredVideoLinks().some((item) => item.label === "Add Subtitles"), true);
  assert.equal(featuredVideoLinks().some((item) => item.label === "Resize Video"), true);
  assert.equal(featuredVideoLinks().some((item) => item.label === "Crop Video"), true);
  assert.equal(imageTools().some((item) => item.slug === "image-to-base64"), true);
  assert.equal(videoTools().some((item) => item.slug === "subtitle-editor"), true);
  assert.equal(videoTools().some((item) => item.slug === "add-subtitles"), true);
  assert.equal(videoTools().length, 19);
  assert.deepEqual(videoTools().slice(-2).map((item) => item.slug), ["audio-trimmer", "audio-converter"]);
  assert.equal(getTool("audio-trimmer")?.category, "Video");
  assert.equal(getTool("audio-converter")?.category, "Video");
  assert.equal(imageTools().length, 8);
  assert.equal(featuredImageLinks().length, 7);
  assert.deepEqual(
    featuredVideoLinks().map((item) => item.label),
    ["Video Merger", "Video Trimmer", "Video Compressor", "Resize Video", "Crop Video", "Add Subtitles", "Video Converter"]
  );
  assert.deepEqual(
    orderedPdfListings().map((item) => item.label),
    [
      "Merge PDF",
      "Split PDF",
      "Compress PDF",
      "Images to PDF",
      "PDF to Images",
      "Rotate PDF",
      "Organize PDF",
      "Watermark PDF",
      "Page Numbers",
      "Protect PDF",
      "PDF to Text",
    ]
  );
  assert.equal(tileLabel("image-to-text", "Image to Text OCR"), "Image to Text");
  assert.deepEqual(
    HOME_SHORTCUTS.map((item) => item.href),
    ["/tools/compress-pdf/", "/tools/image-compressor/", "/tools/video-trimmer/"]
  );
});
