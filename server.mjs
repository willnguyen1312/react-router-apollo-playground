import http from "node:http";

const PORT = 8787;

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/api/leave") {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
    });
    req.on("end", () => {
      let body;
      try {
        body = raw ? JSON.parse(raw) : {};
      } catch {
        body = { _raw: raw };
      }
      console.log(
        `[${new Date().toISOString()}] POST /api/leave`,
        body,
      );
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true, from: body?.from ?? null }));
    });
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "not found" }));
});

server.listen(PORT, () => {
  console.log(`leave-logger listening on http://localhost:${PORT}`);
});
