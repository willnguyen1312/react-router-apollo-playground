import http from "node:http";

const PORT = 8787;

function readBody(req) {
  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({ _raw: raw });
      }
    });
  });
}

const routes = {
  "POST /api/leave": async (req, res) => {
    const body = await readBody(req);
    console.log(`[${new Date().toISOString()}] POST /api/leave`, body);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, from: body?.from ?? null }));
  },
  "POST /api/closing": async (req, res) => {
    const body = await readBody(req);
    console.log(`[${new Date().toISOString()}] POST /api/closing`, body);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
  },
};

const server = http.createServer((req, res) => {
  const handler = routes[`${req.method} ${req.url}`];
  if (handler) {
    handler(req, res);
    return;
  }
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "not found" }));
});

server.listen(PORT, () => {
  console.log(`leave-logger listening on http://localhost:${PORT}`);
});
