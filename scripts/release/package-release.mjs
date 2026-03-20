#!/usr/bin/env node
import fs from "node:fs/promises"
import path from "node:path"

import {
  DEFAULT_MANIFEST_NAME,
  createManifestFromArchive,
  getArchiveName,
  packageDirectory,
  parseArgs,
  resolveReleaseVersionTag,
  verifyManifestChecksum,
} from "./release-lib.mjs"

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const { version, tag } = resolveReleaseVersionTag({
    version: typeof args.version === "string" ? args.version : undefined,
    tag: typeof args.tag === "string" ? args.tag : undefined,
  })

  if (typeof args.distDir !== "string") {
    throw new Error("--distDir is required.")
  }
  if (typeof args.outputDir !== "string") {
    throw new Error("--outputDir is required.")
  }
  if (typeof args.commitSha !== "string") {
    throw new Error("--commitSha is required.")
  }

  const distDir = path.resolve(args.distDir)
  const outputDir = path.resolve(args.outputDir)
  const archiveName = typeof args.archiveName === "string" ? args.archiveName : getArchiveName(version)
  const manifestName = typeof args.manifestName === "string" ? args.manifestName : DEFAULT_MANIFEST_NAME
  const archivePath = path.join(outputDir, archiveName)
  const manifestPath = path.join(outputDir, manifestName)

  await fs.mkdir(outputDir, { recursive: true })
  await packageDirectory({ sourceDir: distDir, archivePath })

  const manifest = await createManifestFromArchive({
    archivePath,
    outputPath: manifestPath,
    version,
    tag,
    commitSha: args.commitSha,
    basePath: typeof args.basePath === "string" ? args.basePath : undefined,
    siteUrl: typeof args.siteUrl === "string" ? args.siteUrl : undefined,
  })

  await verifyManifestChecksum({ manifest, archivePath })

  process.stdout.write(
    `${JSON.stringify(
      {
        version,
        tag,
        archiveName,
        archivePath,
        manifestPath,
      },
      null,
      2,
    )}\n`,
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
