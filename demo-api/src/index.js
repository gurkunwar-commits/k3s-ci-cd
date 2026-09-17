"use strict";

const express = require("express");

const app = express();
const port = Number(process.env.PORT || 8080);
const version = process.env.APP_VERSION || "dev";

app.disable("x-powered-by");
app.use(express.json({ limit: "64kb" }));

app.get("/healthz", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/readyz", (_req, res) => {
  res.status(200).json({ status: "ready" });
});

app.get("/api/v1/info", (_req, res) => {
  res.status(200).json({
    service: "demo-api",
    version,
    message: "Hello from the k3s CI/CD demo API — rollout test",
    time: new Date().toISOString(),
  });
});

app.post("/api/v1/echo", (req, res) => {
  res.status(200).json({
    echoed: req.body ?? null,
    receivedAt: new Date().toISOString(),
  });
});

app.use((_req, res) => {
  res.status(404).json({ error: "not_found" });
});

if (require.main === module) {
  app.listen(port, "0.0.0.0", () => {
    // eslint-disable-next-line no-console
    console.log(`demo-api listening on :${port} (version=${version})`);
  });
}

module.exports = { app };
