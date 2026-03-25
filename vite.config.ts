import fs from "node:fs"
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

function resolveAppVersion() {
  const envVersion = process.env.VITE_APP_VERSION?.trim()
  if (envVersion) {
    return envVersion
  }

  const packageEnvVersion = process.env.npm_package_version?.trim()
  if (packageEnvVersion) {
    return packageEnvVersion
  }

  try {
    const packageJsonPath = path.resolve(__dirname, "./package.json")
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8")) as { version?: string }
    const packageJsonVersion = packageJson.version?.trim()
    if (packageJsonVersion) {
      return packageJsonVersion
    }
  } catch (error) {
    console.warn("[Vite Config] Failed to resolve package version:", error)
  }

  return "dev"
}

const appVersion = resolveAppVersion()

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 36291,
  },
  plugins: [react(), tailwindcss()],
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: process.env.VITE_BASE_PATH || "/",
  build: {
    outDir: "dist",
    assetsDir: "assets",
    emptyOutDir: true,
  },
})
