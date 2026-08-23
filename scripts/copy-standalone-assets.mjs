import { cpSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const standaloneDir = join(".next", "standalone");
const staticSrc = join(".next", "static");
const staticDest = join(standaloneDir, ".next", "static");
const publicSrc = "public";
const publicDest = join(standaloneDir, "public");

if (!existsSync(standaloneDir)) {
  console.warn("Standalone output not found; skipping asset copy.");
  process.exit(0);
}

if (existsSync(staticSrc)) {
  mkdirSync(join(standaloneDir, ".next"), { recursive: true });
  cpSync(staticSrc, staticDest, { recursive: true });
}

if (existsSync(publicSrc)) {
  cpSync(publicSrc, publicDest, { recursive: true });
}
