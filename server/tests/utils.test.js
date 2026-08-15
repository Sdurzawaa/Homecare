import test from "node:test";
import assert from "node:assert/strict";

import {
  buildSearchPath,
  normalizeAdminUsername,
  normalizeApiKey,
  resolveSchemaName,
  withSchema,
} from "../utils.js";

test("resolveSchemaName prefers configured schema and falls back to public", () => {
  assert.equal(resolveSchemaName("website_co"), "website_co");
  assert.equal(resolveSchemaName(""), "public");
  assert.equal(resolveSchemaName(undefined), "public");
});

test("withSchema applies the configured schema without breaking unqualified names", () => {
  assert.equal(withSchema("pricing", "public"), "public.pricing");
  assert.equal(withSchema("pricing", "website_co"), "website_co.pricing");
});

test("buildSearchPath keeps configured schema while allowing a public fallback", () => {
  assert.equal(buildSearchPath("public"), "public");
  assert.equal(buildSearchPath("website_co"), "website_co,public");
});

test("normalizeApiKey accepts the admin header regardless of casing", () => {
  assert.equal(normalizeApiKey({ "x-api-key": "abc123" }), "abc123");
  assert.equal(normalizeApiKey({ "X-API-Key": "xyz789" }), "xyz789");
  assert.equal(normalizeApiKey({}), undefined);
});

test("normalizeAdminUsername lowercases and trims mixed-case usernames consistently", () => {
  assert.equal(normalizeAdminUsername("Sadam"), "sadam");
  assert.equal(normalizeAdminUsername("  Sadam  "), "sadam");
  assert.equal(normalizeAdminUsername(""), "");
  assert.equal(normalizeAdminUsername(null), "");
});
