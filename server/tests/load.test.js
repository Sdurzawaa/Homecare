import test from "node:test";
import assert from "node:assert/strict";

const baseUrl = process.env.API_URL || "http://localhost:5000";
const requests = Number(process.env.LOAD_REQUESTS || 50);
const concurrency = Math.max(1, Number(process.env.LOAD_CONCURRENCY || 10));

async function runLoad() {
  const results = [];
  let nextRequest = 0;

  async function worker() {
    while (nextRequest < requests) {
      nextRequest += 1;
      const startedAt = performance.now();
      try {
        const response = await fetch(`${baseUrl}/health`);
        results.push({
          ok: response.ok,
          status: response.status,
          duration: performance.now() - startedAt,
        });
      } catch (error) {
        results.push({
          ok: false,
          status: 0,
          duration: performance.now() - startedAt,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));
  return results;
}

test(`Load: ${requests} health requests with concurrency ${concurrency}`, async () => {
  const results = await runLoad();
  const successful = results.filter((result) => result.ok);
  const failed = results.filter((result) => !result.ok);
  const failureDetails = failed.reduce((summary, result) => {
    const key = result.status
      ? `HTTP ${result.status}`
      : `Network error: ${result.error || "unknown error"}`;
    summary[key] = (summary[key] || 0) + 1;
    return summary;
  }, {});
  const durations = results
    .map((result) => result.duration)
    .sort((a, b) => a - b);
  const percentile = (ratio) =>
    durations[
      Math.min(durations.length - 1, Math.floor(durations.length * ratio))
    ];
  const average =
    durations.reduce((sum, duration) => sum + duration, 0) / durations.length;

  console.log(
    JSON.stringify(
      {
        target: `${baseUrl}/health`,
        requests,
        concurrency,
        successful: successful.length,
        failed: failed.length,
        failureDetails,
        averageMs: Number(average.toFixed(2)),
        p95Ms: Number(percentile(0.95).toFixed(2)),
        maxMs: Number(Math.max(...durations).toFixed(2)),
      },
      null,
      2,
    ),
  );

  assert.equal(results.length, requests);
  assert.equal(
    successful.length,
    requests,
    `Load test failed: ${JSON.stringify(failureDetails)}`,
  );
});
