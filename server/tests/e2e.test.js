import test from "node:test";
import assert from "node:assert/strict";

const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
const apiUrl = process.env.API_URL || "http://localhost:5000";

test("E2E: landing page and public API are reachable", async () => {
  const [pageResponse, apiResponse] = await Promise.all([
    fetch(clientUrl),
    fetch(`${apiUrl}/api/public/site-sections`),
  ]);

  assert.equal(pageResponse.status, 200);
  const html = await pageResponse.text();
  assert.match(html, /<div id="root"><\/div>/);
  assert.match(html, /<script[^>]+type="module"/);

  assert.equal(apiResponse.status, 200);
  const sections = await apiResponse.json();
  assert.ok(sections.hero?.title);
});

test("E2E: frontend returns a response for the admin route", async () => {
  const response = await fetch(`${clientUrl}/admin`);
  assert.equal(response.status, 200);
  assert.match(await response.text(), /<div id="root"><\/div>/);
});
