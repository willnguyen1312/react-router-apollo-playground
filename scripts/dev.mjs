import { spawn } from "node:child_process";

const procs = [
  { name: "server", cmd: "node --watch server.mjs" },
  { name: "vite", cmd: "vite" },
].map(({ name, cmd }) => {
  const child = spawn(cmd, {
    stdio: "inherit",
    shell: true,
    env: process.env,
  });
  child.on("exit", (code, signal) => {
    console.log(
      `[dev] ${name} exited (code=${code ?? "null"}, signal=${signal ?? "null"}) — shutting down`,
    );
    shutdown(code ?? 0);
  });
  return { name, child };
});

let shuttingDown = false;
function shutdown(code) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const { child } of procs) {
    if (child.exitCode === null && !child.killed) child.kill("SIGTERM");
  }
  // Give children a moment to exit cleanly, then force.
  setTimeout(() => process.exit(code), 200).unref();
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
