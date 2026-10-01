// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { readFileSync } from "node:fs";
import { loadEnv, type ConfigEnv } from "vite";

// Nitro merges this source file into its generated deployment configuration.
// Only these three public values may be copied into the browser bundle.
const workerConfig = JSON.parse(
  readFileSync(new URL("./wrangler.json", import.meta.url), "utf8"),
) as { vars: Record<string, string> };
const publicKeys = [
  "VITE_CAKTO_SDK_CLIENT_ID",
  "VITE_META_PIXEL_ID",
  "VITE_WHATSAPP_NUMBER",
] as const;

export default (configEnv: ConfigEnv) => {
  const publicEnv = loadEnv(configEnv.mode, process.cwd(), "VITE_");

  return defineConfig({
    vite: {
      define: Object.fromEntries(
        publicKeys.map((key) => [
          `import.meta.env.${key}`,
          JSON.stringify(publicEnv[key] ?? workerConfig.vars[key]),
        ]),
      ),
    },
    tanstackStart: {
      // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
      // nitro/vite builds from this
      server: { entry: "server" },
    },
  })(configEnv);
};
