import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const nextBin = require.resolve("next/dist/bin/next");
const nextArgs = process.argv.slice(2);

const nodeArgs =
  process.platform === "win32"
    ? ["--use-system-ca", nextBin, ...nextArgs]
    : [nextBin, ...nextArgs];

const child = spawn(process.execPath, nodeArgs, { stdio: "inherit" });
child.on("exit", (code) => process.exit(code ?? 1));
