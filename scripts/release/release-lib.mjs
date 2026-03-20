import { createHash } from "node:crypto"
import { execFile } from "node:child_process"
import fs from "node:fs/promises"
import path from "node:path"
import { promisify } from "node:util"

const execFileAsync = promisify(execFile)

export const DEFAULT_BASE_PATH = "/"
export const DEFAULT_SITE_URL = "https://cost.hagicode.com/"
export const DEFAULT_MANIFEST_NAME = "release-manifest.json"

const SEMVER_PATTERN = /^v?(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?)$/

function ensureNonEmpty(value, label) {
  const normalized = value?.trim()
  if (!normalized) {
    throw new Error(`${label} is required.`)
  }

  return normalized
}

export function parseArgs(argv) {
  const parsed = {}

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]
    if (!token.startsWith("--")) {
      continue
    }

    const key = token.slice(2)
    const next = argv[index + 1]
    if (!next || next.startsWith("--")) {
      parsed[key] = true
      continue
    }

    parsed[key] = next
    index += 1
  }

  return parsed
}

export function resolveReleaseVersionTag({ version, tag }) {
  const candidate = tag?.replace(/^refs\/tags\//, "") ?? version
  const normalized = ensureNonEmpty(candidate, "A release version or tag")
  const match = normalized.match(SEMVER_PATTERN)

  if (!match) {
    throw new Error(
      `Invalid release version \"${normalized}\". Expected semver like 1.2.3 or v1.2.3.`,
    )
  }

  const resolvedVersion = match[1]
  return {
    version: resolvedVersion,
    tag: `v${resolvedVersion}`,
  }
}

export function normalizeBasePath(value = DEFAULT_BASE_PATH) {
  const trimmed = value.trim()
  if (!trimmed || trimmed === "/") {
    return DEFAULT_BASE_PATH
  }

  let normalized = trimmed
  if (!normalized.startsWith("/")) {
    normalized = `/${normalized}`
  }
  if (!normalized.endsWith("/")) {
    normalized = `${normalized}/`
  }

  return normalized.replace(/\/+/g, "/")
}

export function normalizeSiteUrl(value = DEFAULT_SITE_URL) {
  const normalized = ensureNonEmpty(value, "siteUrl")
  const parsed = new URL(normalized)

  if (!parsed.pathname.endsWith("/")) {
    parsed.pathname = `${parsed.pathname}/`
  }

  return parsed.toString()
}

export function getArchiveName(version) {
  return `cost-site-v${version}.tar.gz`
}

export async function sha256File(filePath) {
  const contents = await fs.readFile(filePath)
  return createHash("sha256").update(contents).digest("hex")
}

export function buildReleaseManifest({
  version,
  tag,
  commitSha,
  artifactName,
  artifactSha256,
  builtAt,
  basePath,
  siteUrl,
}) {
  return {
    schemaVersion: 1,
    app: "cost",
    version,
    tag,
    commitSha,
    artifactName,
    artifactSha256,
    builtAt,
    basePath,
    siteUrl,
  }
}

export async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8")
}

export async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"))
}

export async function packageDirectory({ sourceDir, archivePath }) {
  await fs.mkdir(path.dirname(archivePath), { recursive: true })
  await execFileAsync("tar", ["-czf", archivePath, "-C", sourceDir, "."])
  return archivePath
}

export async function createManifestFromArchive({
  archivePath,
  outputPath,
  version,
  tag,
  commitSha,
  basePath,
  siteUrl,
  builtAt = new Date().toISOString(),
}) {
  const artifactSha256 = await sha256File(archivePath)
  const manifest = buildReleaseManifest({
    version,
    tag,
    commitSha: ensureNonEmpty(commitSha, "commitSha"),
    artifactName: path.basename(archivePath),
    artifactSha256,
    builtAt,
    basePath: normalizeBasePath(basePath),
    siteUrl: normalizeSiteUrl(siteUrl),
  })

  await writeJson(outputPath, manifest)
  return manifest
}

export async function verifyManifestChecksum({ manifest, archivePath }) {
  const checksum = await sha256File(archivePath)
  if (checksum !== manifest.artifactSha256) {
    throw new Error(
      `Manifest checksum mismatch for ${path.basename(archivePath)}. Expected ${manifest.artifactSha256}, received ${checksum}.`,
    )
  }
}

export async function readPackageVersion(packageJsonPath) {
  const packageJson = await readJson(packageJsonPath)
  if (typeof packageJson.version !== "string" || !packageJson.version.trim()) {
    throw new Error(`Package version is missing in ${packageJsonPath}.`)
  }

  return packageJson.version.trim()
}

export async function updatePackageVersion(packageJsonPath, version) {
  const packageJson = await readJson(packageJsonPath)
  const originalVersion = packageJson.version
  packageJson.version = version
  await writeJson(packageJsonPath, packageJson)

  return {
    originalVersion,
    updatedVersion: version,
  }
}

export async function restorePackageVersion(packageJsonPath, version) {
  const packageJson = await readJson(packageJsonPath)
  packageJson.version = version
  await writeJson(packageJsonPath, packageJson)
}

export async function appendKeyValueFile(filePath, values) {
  if (!filePath) {
    return
  }

  const lines = Object.entries(values).map(([key, value]) => `${key}=${value}`)
  await fs.appendFile(filePath, `${lines.join("\n")}\n`, "utf8")
}
