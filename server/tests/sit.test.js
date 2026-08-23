import test from "node:test";
import assert from "node:assert/strict";

const baseUrl = process.env.API_URL || "http://localhost:5000";

async function getJson(path) {
  const response = await fetch(`${baseUrl}${path}`);
  const body = await response.json();
  return { response, body };
}

test("SIT: health endpoint is available", async () => {
  const { response, body } = await getJson("/health");
  assert.equal(response.status, 200);
  assert.deepEqual(body, { status: "ok" });
});

test("SIT: public site sections returns expected sections", async () => {
  const { response, body } = await getJson("/api/public/site-sections");
  assert.equal(response.status, 200);
  assert.equal(typeof body, "object");
  assert.ok(body.hero);
  assert.ok(body.contact);
  assert.ok(body.footer);
  assert.equal(
    response.headers.get("cache-control"),
    "public, max-age=60, stale-while-revalidate=300",
  );
});

test("SIT: public collections return arrays", async () => {
  for (const path of ["/api/public/pricing", "/api/public/testimoni"]) {
    const { response, body } = await getJson(path);
    assert.equal(response.status, 200, path);
    assert.ok(Array.isArray(body), path);
  }
});

test("SIT: unknown route returns JSON 404", async () => {
  const response = await fetch(`${baseUrl}/api/does-not-exist`);
  const body = await response.json();
  assert.equal(response.status, 404);
  assert.equal(body.error, "Endpoint not found");
});
