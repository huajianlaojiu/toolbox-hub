import assert from "node:assert/strict";
import { test } from "node:test";
import {
  centeredCrop,
  clampTrimClock,
  cropFilter,
  dragCrop,
  evenFloor,
  normalizeCrop,
  planResize,
  presetPlan,
  scaleFilter,
} from "./video-geometry.ts";

const hd = { width: 1920, height: 1080 };
const frame = { width: 1280, height: 720 };

test("evenFloor snaps down to an even minimum", () => {
  assert.equal(evenFloor(1921, 2), 1920);
  assert.equal(evenFloor(15, 16), 16);
  assert.equal(evenFloor(0, 0), 0);
});

test("720p keeps 16:9 and does not upscale a larger source", () => {
  const plan = planResize(hd, { width: 1280, height: 720 }, true);
  assert.deepEqual({ width: plan.width, height: plan.height, upscaling: plan.upscaling }, {
    width: 1280,
    height: 720,
    upscaling: false,
  });
});

test("a smaller clip scaled into 1080p is marked as upscaling", () => {
  const plan = planResize({ width: 640, height: 360 }, { width: 1920, height: 1080 }, true);
  assert.equal(plan.width, 1920);
  assert.equal(plan.height, 1080);
  assert.equal(plan.upscaling, true);
});

test("aspect lock off stretches to the exact even size", () => {
  const plan = planResize(hd, { width: 100, height: 80 }, false);
  assert.deepEqual({ width: plan.width, height: plan.height }, { width: 100, height: 80 });
});

test("odd custom sizes become even before encode", () => {
  const plan = planResize(hd, { width: 1921, height: 1081 }, false);
  assert.deepEqual({ width: plan.width, height: plan.height }, { width: 1920, height: 1080 });
});

test("portrait source turns a landscape preset into a portrait frame", () => {
  const plan = presetPlan({ width: 1080, height: 1920 }, { width: 1280, height: 720 }, true);
  assert.equal(plan.portraitFrame, true);
  assert.equal(plan.width, 720);
  assert.equal(plan.height, 1280);
  assert.equal(plan.upscaling, false);
});

test("huge custom sizes are capped", () => {
  const plan = planResize({ width: 100, height: 50 }, { width: 10000, height: 8000 }, false);
  assert.equal(plan.clamped, true);
  assert.equal(plan.width, 4096);
  assert.equal(plan.height, 4096);
});

test("480p fit of 1080p stays inside the preset and stays even", () => {
  const plan = presetPlan(hd, { width: 854, height: 480 }, true);
  assert.equal(plan.upscaling, false);
  assert.ok(plan.width <= 854);
  assert.ok(plan.height <= 480);
  assert.equal(plan.width % 2, 0);
  assert.equal(plan.height % 2, 0);
  assert.ok(Math.abs(plan.width / plan.height - 16 / 9) < 0.02);
});

test("centered aspect crops match the ratio and sit inside the frame", () => {
  const square = centeredCrop(frame, 1, 1);
  assert.deepEqual(square, { x: 280, y: 0, width: 720, height: 720 });

  const wide = centeredCrop(frame, 16 / 9, 1);
  assert.deepEqual(wide, { x: 0, y: 0, width: 1280, height: 720 });

  const fourFive = centeredCrop(frame, 4 / 5, 1);
  assert.equal(fourFive.width / fourFive.height, 0.8);
  assert.equal(fourFive.x + fourFive.width <= 1280, true);
  assert.equal(fourFive.y, 0);
});

test("freeform inset is 80 percent and centered", () => {
  const crop = centeredCrop(frame, null, 0.8);
  assert.equal(crop.width, 1024);
  assert.equal(crop.height, 576);
  assert.equal(crop.x, 128);
  assert.equal(crop.y, 72);
});

test("normalizeCrop is stable and clamps to the frame", () => {
  const once = normalizeCrop({ x: -20, y: 10, width: 5000, height: 100 }, frame, null);
  const twice = normalizeCrop(once, frame, null);
  assert.deepEqual(once, twice);
  assert.equal(once.x, 0);
  assert.ok(once.x + once.width <= frame.width);
  assert.ok(once.y + once.height <= frame.height);
});

test("dragging moves and resizes using the same pixel box the encoder gets", () => {
  const start = { x: 100, y: 80, width: 400, height: 200 };
  const moved = dragCrop(start, -500, 40, "move", frame, null);
  assert.equal(moved.x, 0);
  assert.equal(moved.y, 120);
  assert.equal(moved.width, 400);

  const grown = dragCrop(start, 50, 30, "se", frame, null);
  assert.equal(grown.width, 450);
  assert.equal(grown.height, 230);
  assert.equal(grown.x, 100);

  const square = dragCrop(start, 80, 10, "se", frame, 1);
  assert.equal(square.width, square.height);
  assert.equal(cropFilter(square), `crop=${square.width}:${square.height}:${square.x}:${square.y},setsar=1`);
});

test("a trim preview playhead past the duration is pulled back inside the clip", () => {
  const stuck = clampTrimClock(3, 2.07);
  assert.ok(stuck.seekTo != null && stuck.seekTo <= 2.07);
  assert.ok(stuck.current <= 2.07);
  const start = clampTrimClock(0, 2.07);
  assert.equal(start.seekTo, null);
  assert.equal(start.current, 0);
});

test("scale filter uses the planned even size", () => {
  const plan = planResize(hd, { width: 1280, height: 720 }, true);
  assert.equal(scaleFilter(plan.width, plan.height), "scale=1280:720:flags=lanczos,setsar=1");
});
