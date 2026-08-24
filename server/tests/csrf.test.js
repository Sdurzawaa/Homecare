import test from "node:test";
import assert from "node:assert/strict";

import { createCsrfToken, validateCsrfToken } from "../csrf.js";

test("creates a csrf token that matches an expected cookie value", () => {
  const token = createCsrfToken();
  assert.equal(typeof token, "string");
  assert.ok(token.length > 32);
  assert.equal(validateCsrfToken(token, token), true);
});

test("rejects mismatched csrf values and empty token pairs", () => {
  assert.equal(validateCsrfToken("abc", "def"), false);
  assert.equal(validateCsrfToken("", "def"), false);
  assert.equal(validateCsrfToken("abc", ""), false);
});
