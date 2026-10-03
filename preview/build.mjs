import { build } from "esbuild";
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
mkdirSync(path.join(root, "preview/dist"), { recursive: true });

/* There is no Next.js runtime in this bundle, so anything the app reads off
   process.env has to be inlined here — an undefined `process` in the browser
   would take the whole page down. Next loads .env.local on its own; we don't. */
function env(key) {
  if (process.env[key]) return process.env[key];
  try {
    const line = readFileSync(path.join(root, ".env.local"), "utf8")
      .split("\n")
      .find((l) => l.trimStart().startsWith(`${key}=`));
    return line ? line.slice(line.indexOf("=") + 1).trim() : "";
  } catch {
    return "";
  }
}

await build({
  entryPoints: [path.join(root, "preview/main.tsx")],
  bundle: true,
  minify: true,
  format: "iife",
  target: ["es2020"],
  jsx: "automatic",
  loader: { ".css": "empty" },
  define: {
    "process.env.NODE_ENV": '"production"',
    "process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN": JSON.stringify(env("NEXT_PUBLIC_LOGO_DEV_TOKEN")),
  },
  alias: {
    "@": root,
    "next/link": path.join(root, "preview/router.tsx"),
    "next/navigation": path.join(root, "preview/router.tsx"),
  },
  outfile: path.join(root, "preview/dist/app.js"),
  logLevel: "info",
});

execSync(`npx @tailwindcss/cli -i ${path.join(root, "preview/preview.css")} -o ${path.join(root, "preview/dist/app.css")} --minify`, { stdio: "inherit", cwd: root });

const css = readFileSync(path.join(root, "preview/dist/app.css"), "utf8");
const js = readFileSync(path.join(root, "preview/dist/app.js"), "utf8");
const head = [
  `<title>SchoolUp Dashboard</title>`,
  `<meta name="viewport" content="width=device-width, initial-scale=1">`,
  `<link rel="preconnect" href="https://fonts.googleapis.com">`,
  `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`,
  `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400..700&family=Geist+Mono:wght@400..600&display=swap">`,
  // Paints the saved theme and sidebar width before first paint, same as the Next.js app.
  `<script>try{var s=localStorage.getItem("su-theme");if(s?s==="dark":matchMedia("(prefers-color-scheme:dark)").matches)document.documentElement.classList.add("dark");if(localStorage.getItem("su-nav")==="rail")document.documentElement.classList.add("nav-rail")}catch(e){}</script>`,
].join("\n");

writeFileSync(
  path.join(root, "preview/dist/index.html"),
  `${head}\n<style>${css}</style>\n<div id="root"></div>\n<script>${js}</script>`,
);
console.log("built", (js.length / 1024).toFixed(0) + "KB js");
