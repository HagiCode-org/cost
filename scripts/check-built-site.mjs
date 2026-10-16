import { readdir, readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const projectDirectory = path.dirname(fileURLToPath(import.meta.url))
const outputDirectory = path.resolve(projectDirectory, "../dist")
const [html, robots, sitemapIndex, llms, rss] = await Promise.all([
  readFile(path.join(outputDirectory, "index.html"), "utf-8"),
  readFile(path.join(outputDirectory, "robots.txt"), "utf-8"),
  readFile(path.join(outputDirectory, "sitemap-index.xml"), "utf-8"),
  readFile(path.join(outputDirectory, "llms.txt"), "utf-8"),
  readFile(path.join(outputDirectory, "rss.xml"), "utf-8"),
])
const origin = (process.env.VITE_SITE_URL || "https://cost.hagicode.com").replace(/\/+$/u, "")
const configuredBasePath = process.env.VITE_BASE_PATH || "/"
const trimmedBasePath = configuredBasePath.replace(/^\/+|\/+$/gu, "")
const basePath = trimmedBasePath ? `/${trimmedBasePath}/` : "/"
const expectedCanonical = new URL(basePath, `${origin}/`).toString()
const expectedSitemapIndex = new URL("sitemap-index.xml", expectedCanonical).toString()
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

if (!html.includes(`href="${expectedCanonical}"`)) {
  throw new Error(`Built canonical URL does not match the configured site path: ${expectedCanonical}`)
}

// The footer links to the sitemap with a root-relative path; accept the absolute form too.
const sitemapHrefs = [`href="${expectedSitemapIndex}"`, `href="${basePath}sitemap-index.xml"`]
if (!sitemapHrefs.some((href) => html.includes(href))) {
  throw new Error(`Built page does not link to the generated sitemap index: ${expectedSitemapIndex}`)
}

if (!html.includes(`content="${expectedOgImage}"`) || !html.includes(`href="${expectedCanonical}?lang=en-US"`)) {
  throw new Error("Built Open Graph image and locale alternates do not match the configured site path")
}

if (!robots.includes(`Sitemap: ${expectedSitemapIndex}`)) {
  throw new Error("Built robots.txt does not reference the generated sitemap-index.xml for the configured site URL and base path")
}

const childSitemapLocations = [...sitemapIndex.matchAll(/<loc>([^<]+)<\/loc>/gu)].map(([, location]) => location)
if (childSitemapLocations.length === 0) {
  throw new Error("Built sitemap-index.xml lists no child sitemaps")
}

const childSitemapFiles = await Promise.all(
  childSitemapLocations.map((location) => {
    const fileName = new URL(location).pathname.split("/").filter(Boolean).pop()
    return readFile(path.join(outputDirectory, fileName ?? ""), "utf-8")
  }),
)
if (!childSitemapFiles.some((content) => content.includes(`<loc>${expectedCanonical}</loc>`))) {
  throw new Error("Built child sitemaps do not list the configured canonical URL")
}

if (!rss.includes("<rss") || !rss.includes(`<link>${expectedCanonical}</link>`)) {
  throw new Error("Built rss.xml is not a valid feed for the configured site URL")
}

if (!llms.trim().startsWith("#")) {
  throw new Error("Built llms.txt is empty or does not start with a Markdown heading")
}

const localAssetUrls = html.matchAll(/(?:src|href)="(\/[^"#?]*)"/gu)
for (const [, assetUrl] of localAssetUrls) {
  if (assetUrl.startsWith("//") || assetUrl.startsWith(localAssetPrefix)) {
    continue
  }

  throw new Error(`Built page contains an asset outside the configured base path: ${assetUrl}`)
}

console.log("Built Cost homepage contains server-rendered content, configured metadata and generated discovery files.")
