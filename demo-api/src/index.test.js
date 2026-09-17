"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const { app } = require("./index");

function request(server, method, path, body) {
  return new Promise((resolve, reject) => {
    const { port } = server.address();
    const payload = body === undefined ? null : Buffer.from(JSON.stringify(body));
    const req = http.request(
      {
        hostname: "127.0.0.1",
        port,
        path,
        method,
        headers: payload
          ? {
              "content-type": "application/json",
              "content-length": payload.length,
            }
          : {},
      },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const raw = Buffer.concat(chunks).toString("utf8");
          resolve({
            status: res.statusCode,
            body: raw ? JSON.parse(raw) : null,
          });
        });
      }
    );
    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

describe("demo-api", () => {
  it("returns health and info", async () => {
    const server = app.listen(0);
    try {
      const health = await request(server, "GET", "/healthz");
      assert.equal(health.status, 200);
      assert.equal(health.body.status, "ok");

      const info = await request(server, "GET", "/api/v1/info");
      assert.equal(info.status, 200);
      assert.equal(info.body.service, "demo-api");
      assert.match(info.body.message, /rollout test/);
    } finally {
      server.close();
    }
  });

  it("echoes JSON bodies", async () => {
    const server = app.listen(0);
    try {
      const echo = await request(server, "POST", "/api/v1/echo", { hello: "world" });
      assert.equal(echo.status, 200);
      assert.deepEqual(echo.body.echoed, { hello: "world" });
    } finally {
      server.close();
    }
  });
});
