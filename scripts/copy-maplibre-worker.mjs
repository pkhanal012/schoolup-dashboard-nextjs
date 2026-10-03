// MapLibre 6 parses tiles in a module worker loaded from a URL next to its own
// file. Once bundled, that URL no longer exists, so the worker is served from
// public/ and the map points at it with setWorkerUrl(). Runs on postinstall so
// the copy always matches the installed version.
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const from = join(root, "node_modules/maplibre-gl/dist");
const to = join(root, "public/vendor/maplibre");

mkdirSync(to, { recursive: true });
// The worker imports ./maplibre-gl-shared.mjs, so both files travel together.
for (const file of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]) {
  copyFileSync(join(from, file), join(to, file));
}
