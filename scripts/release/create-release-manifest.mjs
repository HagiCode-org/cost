#!/usr/bin/env node
import path from "node:path"

import {
  DEFAULT_MANIFEST_NAME,
  createManifestFromArchive,
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

  if (typeof args.archive !== "string") {
    throw new Error("--archive is required.")
  }
  if (typeof args.commitSha !== "string") {
    throw new Error("--commitSha is required.")
  }

  const manifestPath =
    typeof args.output === "string"
      ? path.resolve(args.output)
      : path.resolve(path.dirname(args.archive), DEFAULT_MANIFEST_NAME)

  const manifest = await createManifestFromArchive({
    archivePath: path.resolve(args.archive),
    outputPath: manifestPath,
    version,
    tag,
    commitSha: args.commitSha,
    basePath: typeof args.basePath === "string" ? args.basePath : undefined,
    siteUrl: typeof args.siteUrl === "string" ? args.siteUrl : undefined,
    builtAt: typeof args.builtAt === "string" ? args.builtAt : undefined,
  })

  await verifyManifestChecksum({ manifest, archivePath: path.resolve(args.archive) })

  process.stdout.write(`${JSON.stringify({ manifestPath, manifest }, null, 2)}\n`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
