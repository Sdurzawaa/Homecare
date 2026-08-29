import test from "node:test";
import assert from "node:assert/strict";

import {
  buildSearchPath,
  deriveInitialFromAuthor,
  getLatestWaPhone,
  isTestimoniExpired,
  isValidAdminPassword,
  isValidAdminUsername,
  normalizeAdminUsername,
  normalizeApiKey,
  normalizeTestimoniStatus,
  normalizeWhatsAppLink,
  resolveSchemaName,
  withSchema,
} from "../utils.js";

test("admin usernames accept practical identifier characters", () => {
  assert.equal(isValidAdminUsername("Admin_123"), true);
  assert.equal(isValidAdminUsername("Admin-123"), true);
  assert.equal(isValidAdminUsername("   "), false);
  assert.equal(isValidAdminUsername("Admin 123"), false);
  assert.equal(isValidAdminUsername(123), false);
});

test("admin passwords require complexity and allow symbols", () => {
  assert.equal(isValidAdminPassword("AdminPassword1!"), true);
  assert.equal(isValidAdminPassword("Secure Pass1#"), true);
  assert.equal(isValidAdminPassword("adminpassword1!"), false);
  assert.equal(isValidAdminPassword("ADMINPASSWORD1!"), false);
  assert.equal(isValidAdminPassword("AdminPass!!"), false);
  assert.equal(isValidAdminPassword(12345678), false);
});

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

test("deriveInitialFromAuthor builds initials from the author name", () => {
  assert.equal(deriveInitialFromAuthor("Risma"), "R");
  assert.equal(deriveInitialFromAuthor("Risma Putri"), "RP");
  assert.equal(deriveInitialFromAuthor("   "), "?");
});

test("normalizeTestimoniStatus accepts only valid moderation states", () => {
  assert.equal(normalizeTestimoniStatus("pending"), "pending");
  assert.equal(normalizeTestimoniStatus("approved"), "approved");
  assert.equal(normalizeTestimoniStatus("rejected"), "rejected");
  assert.equal(normalizeTestimoniStatus("APPROVED"), "approved");
  assert.equal(normalizeTestimoniStatus("random"), "pending");
});

test("isTestimoniExpired deletes reviews that are older than 5 days while pending", () => {
  const now = new Date("2026-01-20T00:00:00.000Z");
  const oldDate = new Date("2026-01-12T00:00:00.000Z");
  const recentDate = new Date("2026-01-18T00:00:00.000Z");

  assert.equal(isTestimoniExpired("pending", oldDate, now), true);
  assert.equal(isTestimoniExpired("approved", oldDate, now), false);
  assert.equal(isTestimoniExpired("pending", recentDate, now), false);
});

test("getLatestWaPhone prefers the newest default WhatsApp row", () => {
  assert.equal(
    getLatestWaPhone([
      { id: 1, Phone: "+62 812 342" },
      { id: 2, Phone: "+62 812 188" },
    ]),
    "+62 812 188",
  );

  assert.equal(
    getLatestWaPhone([
      { id: 9, Phone: "+62 812 342" },
      { id: 3, Phone: "+62 812 188" },
    ]),
    "+62 812 342",
  );
});

test("normalizeWhatsAppLink converts +62 numbers into a wa.me URL", () => {
  assert.equal(
    normalizeWhatsAppLink("+62 81289861639"),
    "https://wa.me/6281289861639",
  );

  assert.equal(
    normalizeWhatsAppLink("081289861639"),
    "https://wa.me/6281289861639",
  );

  assert.equal(
    normalizeWhatsAppLink("", "https://wa.me/6285892006905"),
    "https://wa.me/6285892006905",
  );

  assert.equal(
    normalizeWhatsAppLink("#", "https://wa.me/6285892006905"),
    "https://wa.me/6285892006905",
  );
});
