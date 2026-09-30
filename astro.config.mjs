import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@astrojs/react"
import { defineConfig } from "astro/config"

const packageJson = JSON.parse(
  readFileSync(fileURLToPath(new URL("./package.json", import.meta.url)), "utf-8"),
)
const appVersion =
  process.env.VITE_APP_VERSION?.trim() ||
  process.env.npm_package_version?.trim() ||
  packageJson.version ||
  "dev"

export default defineConfig({
  site: process.env.VITE_SITE_URL || "https://cost.hagicode.com",
  base: process.env.VITE_BASE_PATH || "/",
  output: "static",
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    define: {
      __APP_VERSION__: JSON.stringify(appVersion),
    },
    resolve: {
      alias: {
        "@": path.resolve("./src"),
      },
    },
  },
})
