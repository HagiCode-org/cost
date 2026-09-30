import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const projectDirectory = path.dirname(fileURLToPath(import.meta.url))
const outputDirectory = path.resolve(projectDirectory, "../dist")
const origin = (process.env.VITE_SITE_URL || "https://cost.hagicode.com").replace(/\/+$/u, "")
const configuredBasePath = process.env.VITE_BASE_PATH || "/"
const trimmedBasePath = configuredBasePath.replace(/^\/+|\/+$/gu, "")
const basePath = trimmedBasePath ? `/${trimmedBasePath}/` : "/"
const siteUrl = new URL(basePath, `${origin}/`).toString()
const sitemapUrl = new URL("sitemap.xml", siteUrl).toString()
const xmlEscape = (value) =>
  value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")

await mkdir(outputDirectory, { recursive: true })
await Promise.all([
  writeFile(
    path.join(outputDirectory, "robots.txt"),
    `User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl}\n`,
  ),
  writeFile(
    path.join(outputDirectory, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${xmlEscape(siteUrl)}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>\n`,
  ),
])
