// Note: uses Node.js built-in test runner, no extra dependencies

const test = require("node:test");
const assert = require("node:assert");
const app = require("./server");

test("GET /health returns ok", async (t) => {
  const server = app.listen(0);
  t.after(() => server.close());
  const { port } = server.address();

  const res = await fetch(`http://127.0.0.1:${port}/health`);
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(await res.json(), { status: "ok" });
});

test("GET /version returns current version", async (t) => {
  const server = app.listen(0);
  t.after(() => server.close());
  const { port } = server.address();

  const res = await fetch(`http://127.0.0.1:${port}/version`);
  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.strictEqual(body.version, process.env.APP_VERSION || "dev");
});