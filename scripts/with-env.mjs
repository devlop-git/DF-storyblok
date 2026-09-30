// Runs Next.js with a brand's env file loaded first, e.g.
//   node scripts/with-env.mjs .env.austenblake dev -p 3001
//
// (`node --env-file=… next dev` doesn't work: next dev starts a child process
// and passes Node flags on via NODE_OPTIONS, where --env-file isn't allowed.)
// Values from this file win over .env.local, because Next.js never overrides
// variables that are already set.
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";

const [envFile, ...nextArgs] = process.argv.slice(2);

if (!envFile || !existsSync(envFile)) {
  console.error(`Env file "${envFile}" not found (expected in the project root).`);
  process.exit(1);
}
process.loadEnvFile(envFile);

const nextBin = createRequire(import.meta.url).resolve("next/dist/bin/next");
const child = spawn(process.execPath, [nextBin, ...nextArgs], {
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 0);
});
