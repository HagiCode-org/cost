import { readdir, readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const projectDirectory = path.dirname(fileURLToPath(import.meta.url))
const outputDirectory = path.resolve(projectDirectory, "../dist")
const [html, robots, sitemap] = await Promise.all([
  readFile(path.join(outputDirectory, "index.html"), "utf-8"),
  readFile(path.join(outputDirectory, "robots.txt"), "utf-8"),
  readFile(path.join(outputDirectory, "sitemap.xml"), "utf-8"),
])
const publishedFiles = await readdir(outputDirectory)
const origin = (process.env.VITE_SITE_URL || "https://cost.hagicode.com").replace(/\/+$/u, "")
const configuredBasePath = process.env.VITE_BASE_PATH || "/"
const trimmedBasePath = configuredBasePath.replace(/^\/+|\/+$/gu, "")
const basePath = trimmedBasePath ? `/${trimmedBasePath}/` : "/"
const expectedCanonical = new URL(basePath, `${origin}/`).toString()
const expectedSitemap = new URL("sitemap.xml", expectedCanonical).toString()
const expectedOgImage = new URL("og-image.svg", expectedCanonical).toString()
const localAssetPrefix = basePath === "/" ? "/" : basePath

const requiredHtml = [
  "<title>Agent 时代，你会不会被淘汰？ | HagiCode</title>",
  'name="description"',
  'property="og:title"',
  'name="twitter:title"',
  'id="json-ld-webpage"',
  'id="main-content"',
  "你的年薪是",
]

for (const value of requiredHtml) {
  if (!html.includes(value)) {
    throw new Error(`Built homepage is missing expected server-rendered content: ${value}`)
  }
}

if (html.includes('<div id="root"></div>')) {
  throw new Error("Built homepage still contains an empty client-only root")
}

if (publishedFiles.some((file) => /^rss(?:\..+)?\.xml$/u.test(file))
  || /application\/rss\+xml|\/rss(?:\.xml|\.en\.xml)/u.test(html)) {
  throw new Error("Core-only Cost build must not publish RSS routes or integration-provided feed links")
}

if (!html.includes(`href="${expectedCanonical}"`)) {
  throw new Error(`Built canonical URL does not match the configured site path: ${expectedCanonical}`)
}

if (!html.includes(`href="${expectedSitemap}"`)) {
  throw new Error(`Built sitemap link does not match the configured site path: ${expectedSitemap}`)
}

if (!html.includes(`content="${expectedOgImage}"`) || !html.includes(`href="${expectedCanonical}?lang=en-US"`)) {
  throw new Error("Built Open Graph image and locale alternates do not match the configured site path")
}

if (!robots.includes(`Sitemap: ${expectedSitemap}`) || !sitemap.includes(`<loc>${expectedCanonical}</loc>`)) {
  throw new Error("Built robots.txt and sitemap.xml do not match the configured site URL and base path")
}

const localAssetUrls = html.matchAll(/(?:src|href)="(\/[^"#?]*)"/gu)
for (const [, assetUrl] of localAssetUrls) {
  if (assetUrl.startsWith("//") || assetUrl.startsWith(localAssetPrefix)) {
    continue
  }

  throw new Error(`Built page contains an asset outside the configured base path: ${assetUrl}`)
}

console.log("Built Cost homepage contains server-rendered content and configured metadata.")
