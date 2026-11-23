import assert from "node:assert/strict";
import { test } from "node:test";
import {
  FREE_FILE_BATCH,
  PRO_FILE_BATCH,
  PRO_FRAME_BATCH,
  FREE_FRAME_BATCH,
  decideBatch,
  entitlementActive,
  isHttpsUrl,
  parseVerifyResponse,
} from "./billing.ts";
import { getJobsServerSnapshot } from "./job-history.ts";
import { pageTitle } from "./site-meta.ts";

test("a single file and a 3-file batch stay on the free path", () => {
  assert.equal(decideBatch(1, false, FREE_FILE_BATCH, PRO_FILE_BATCH).status, "ok");
  const three = decideBatch(3, false, FREE_FILE_BATCH, PRO_FILE_BATCH);
  assert.equal(three.status, "ok");
  assert.equal(three.take, 3);
});

test("four files keep a free run of the first three", () => {
  const decision = decideBatch(4, false, FREE_FILE_BATCH, PRO_FILE_BATCH);
  assert.equal(decision.status, "over-free");
  assert.equal(decision.take, 3);
  assert.equal(decision.selected, 4);
});

test("pro accepts the published file cap and trims above it", () => {
  assert.equal(decideBatch(50, true, FREE_FILE_BATCH, PRO_FILE_BATCH).status, "ok");
  const over = decideBatch(51, true, FREE_FILE_BATCH, PRO_FILE_BATCH);
  assert.equal(over.status, "over-pro");
  assert.equal(over.take, 50);
});

test("frame batches of 8 are free and 9 offers the free prefix", () => {
  assert.equal(decideBatch(8, false, FREE_FRAME_BATCH, PRO_FRAME_BATCH).status, "ok");
  assert.equal(decideBatch(9, false, FREE_FRAME_BATCH, PRO_FRAME_BATCH).take, 8);
});

test("checkout links must be https", () => {
  assert.equal(isHttpsUrl(""), false);
  assert.equal(isHttpsUrl("http://example.com/checkout"), false);
  assert.equal(isHttpsUrl("javascript:alert(1)"), false);
  assert.equal(isHttpsUrl("https://store.lemonsqueezy.com/checkout/buy/example"), true);
});

test("entitlement expiry and verify payload", () => {
  const now = Date.parse("2026-11-19T00:00:00Z");
  assert.equal(entitlementActive({ plan: "pro", expiresAt: null }, now), true);
  assert.equal(entitlementActive({ plan: "pro", expiresAt: "2026-11-18T00:00:00Z" }, now), false);
  assert.equal(entitlementActive({ plan: "free" }, now), false);
  assert.deepEqual(parseVerifyResponse({ active: true, expiresAt: null }), { active: true, expiresAt: null });
  assert.equal(parseVerifyResponse({ valid: true, meta: { customer_email: "a@b.c" } }), null);
});

test("a title that already names the brand is not given the site suffix again", () => {
  assert.deepEqual(pageTitle("Privacy Policy - Toolbox Hub"), { absolute: "Privacy Policy - Toolbox Hub" });
  assert.deepEqual(pageTitle("About Toolbox Hub"), { absolute: "About Toolbox Hub" });
  assert.equal(pageTitle("Plans"), "Plans");
});

test("job history does not claim the list is empty before the browser store is read", () => {
  assert.equal(getJobsServerSnapshot(), null);
});
