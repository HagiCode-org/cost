import { execFile } from "node:child_process"
import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { promisify } from "node:util"

import { readJson, sha256File } from "../release/release-lib.mjs"

const execFileAsync = promisify(execFile)
const HTML_CACHE_CONTROL = "no-cache, no-store, must-revalidate"
const ROOT_METADATA_CACHE_CONTROL = "public, max-age=300, must-revalidate"
const DEFAULT_CACHE_CONTROL = "public, max-age=3600, must-revalidate"
const IMMUTABLE_CACHE_CONTROL = "public, max-age=31536000, immutable"
const ROOT_METADATA_FILES = new Set([
  "robots.txt",
  "sitemap.xml",
  "favicon.ico",
  "favicon.svg",
  "og-image.svg",
  "manifest.webmanifest",
  "site.webmanifest",
])

const CONTENT_TYPE_BY_EXTENSION = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".xml": "application/xml; charset=utf-8",
}

async function listFiles(rootDir, currentDir = rootDir) {
  const entries = await fs.readdir(currentDir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const entryPath = path.join(currentDir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await listFiles(rootDir, entryPath)))
      continue
    }

    if (entry.isFile()) {
      files.push(entryPath)
    }
  }

  return files
}

export function resolveCacheControl(relativePath) {
  const normalized = relativePath.replace(/\\/g, "/")

  if (normalized.endsWith(".html")) {
    return HTML_CACHE_CONTROL
  }

  const fileName = path.posix.basename(normalized)
  if (!normalized.includes("/") && ROOT_METADATA_FILES.has(fileName)) {
    return ROOT_METADATA_CACHE_CONTROL
  }

  if (normalized.startsWith("assets/")) {
    return IMMUTABLE_CACHE_CONTROL
  }

  return DEFAULT_CACHE_CONTROL
}

export function resolveContentType(relativePath) {
  const extension = path.extname(relativePath).toLowerCase()
  return CONTENT_TYPE_BY_EXTENSION[extension]
}

export async function validateReleaseAsset({ manifestPath, archivePath, expectedTag }) {
  const manifest = await readJson(manifestPath)
  const requiredKeys = [
    "version",
    "tag",
    "commitSha",
    "artifactName",
    "artifactSha256",
    "builtAt",
    "basePath",
    "siteUrl",
  ]

  for (const key of requiredKeys) {
    if (!manifest[key]) {
      throw new Error(`Release manifest is missing required field \"${key}\".`)
    }
  }

  const archiveName = path.basename(archivePath)
  if (manifest.artifactName !== archiveName) {
    throw new Error(
      `Release manifest artifactName \"${manifest.artifactName}\" does not match downloaded archive \"${archiveName}\".`,
    )
  }

  if (expectedTag && manifest.tag !== expectedTag) {
    throw new Error(`Release manifest tag \"${manifest.tag}\" does not match expected tag \"${expectedTag}\".`)
  }

  const checksum = await sha256File(archivePath)
  if (checksum !== manifest.artifactSha256) {
    throw new Error(
      `Release manifest checksum mismatch for ${archiveName}. Expected ${manifest.artifactSha256}, received ${checksum}.`,
    )
  }

  return manifest
}

export async function extractArchive({ archivePath, outputDir }) {
  await fs.mkdir(outputDir, { recursive: true })
  await execFileAsync("tar", ["-xzf", archivePath, "-C", outputDir])
  return outputDir
}

export async function buildUploadPlan(rootDir) {
  const absoluteFiles = await listFiles(rootDir)
  return absoluteFiles
    .map((filePath) => {
      const relativePath = path.relative(rootDir, filePath).replace(/\\/g, "/")
      return {
        filePath,
        relativePath,
        cacheControl: resolveCacheControl(relativePath),
        contentType: resolveContentType(relativePath),
      }
    })
    .sort((left, right) => left.relativePath.localeCompare(right.relativePath))
}

export function validateAzureConfig(config) {
  const missing = []
  if (!config.storageAccount?.trim()) {
    missing.push("storageAccount")
  }
  if (!config.container?.trim()) {
    missing.push("container")
  }

  if (missing.length > 0) {
    throw new Error(`Missing Azure deployment configuration: ${missing.join(", ")}.`)
  }

  return {
    storageAccount: config.storageAccount.trim(),
    container: config.container.trim(),
  }
}

export function resolvePurgeConfig(config) {
  const required = [config.resourceGroup, config.profileName, config.endpointName]
  const ready = required.every((value) => value?.trim())

  return ready
    ? {
        enabled: true,
        resourceGroup: config.resourceGroup.trim(),
        profileName: config.profileName.trim(),
        endpointName: config.endpointName.trim(),
        contentPaths:
          config.contentPaths && config.contentPaths.length > 0 ? config.contentPaths : ["/*"],
      }
    : { enabled: false }
}

async function runCommand(command, args, execute) {
  if (execute) {
    return execute(command, args)
  }

  const result = await execFileAsync(command, args, { encoding: "utf8" })
  return {
    stdout: result.stdout,
    stderr: result.stderr,
  }
}

export async function deployStaticWebsite({
  archivePath,
  manifestPath,
  expectedTag,
  storageAccount,
  container = "$web",
  validateOnly = false,
  execute,
  purgeConfig = { enabled: false },
}) {
  const manifest = await validateReleaseAsset({ manifestPath, archivePath, expectedTag })
  const azureConfig = validateAzureConfig({ storageAccount, container })
  const extractionDir = await fs.mkdtemp(path.join(os.tmpdir(), "cost-static-website-"))

  await extractArchive({ archivePath, outputDir: extractionDir })
  const uploadPlan = await buildUploadPlan(extractionDir)

  if (!validateOnly) {
    for (const entry of uploadPlan) {
      const args = [
        "storage",
        "blob",
        "upload",
        "--account-name",
        azureConfig.storageAccount,
        "--container-name",
        azureConfig.container,
        "--name",
        entry.relativePath,
        "--file",
        entry.filePath,
        "--overwrite",
        "true",
        "--auth-mode",
        "login",
        "--content-cache-control",
        entry.cacheControl,
      ]

      if (entry.contentType) {
        args.push("--content-type", entry.contentType)
      }

      await runCommand("az", args, execute)
    }
  }

  const resolvedPurge = resolvePurgeConfig(purgeConfig)
  let purgeResult = { executed: false, reason: "not-configured" }

  if (!validateOnly && resolvedPurge.enabled) {
    await runCommand(
      "az",
      [
        "cdn",
        "endpoint",
        "purge",
        "--resource-group",
        resolvedPurge.resourceGroup,
        "--profile-name",
        resolvedPurge.profileName,
        "--name",
        resolvedPurge.endpointName,
        "--content-paths",
        ...resolvedPurge.contentPaths,
      ],
      execute,
    )

    purgeResult = {
      executed: true,
      reason: "completed",
      contentPaths: resolvedPurge.contentPaths,
    }
  }

  await fs.rm(extractionDir, { recursive: true, force: true })

  return {
    manifest,
    uploadPlan,
    purge: purgeResult,
  }
}
