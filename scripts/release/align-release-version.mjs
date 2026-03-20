#!/usr/bin/env node
import fs from "node:fs/promises"
import path from "node:path"

import {
  appendKeyValueFile,
  parseArgs,
  resolveReleaseVersionTag,
  restorePackageVersion,
  updatePackageVersion,
  writeJson,
  readJson,
} from "./release-lib.mjs"

const DEFAULT_PACKAGE_JSON = path.resolve(process.cwd(), "package.json")

async function applyVersionAlignment(args) {
  const packageJsonPath = typeof args.packageJson === "string" ? path.resolve(args.packageJson) : DEFAULT_PACKAGE_JSON
  const statePath = typeof args.stateFile === "string" ? path.resolve(args.stateFile) : undefined
  const { version, tag } = resolveReleaseVersionTag({
    version: typeof args.version === "string" ? args.version : undefined,
    tag: typeof args.tag === "string" ? args.tag : undefined,
  })

  const { originalVersion } = await updatePackageVersion(packageJsonPath, version)
  const state = {
    packageJsonPath,
    originalVersion,
    alignedVersion: version,
    tag,
  }

  if (statePath) {
    await writeJson(statePath, state)
  }

  const exports = {
    COST_RELEASE_VERSION: version,
    COST_RELEASE_TAG: tag,
    VITE_APP_VERSION: version,
    npm_package_version: version,
  }

  await appendKeyValueFile(typeof args.envOutput === "string" ? path.resolve(args.envOutput) : undefined, exports)
  await appendKeyValueFile(
    typeof args.githubOutput === "string" ? path.resolve(args.githubOutput) : undefined,
    {
      version,
      tag,
      original_version: originalVersion,
    },
  )

  process.stdout.write(`${JSON.stringify({ version, tag, originalVersion }, null, 2)}\n`)
}

async function restoreVersionAlignment(args) {
  const statePath = typeof args.stateFile === "string" ? path.resolve(args.stateFile) : undefined
  if (!statePath) {
    throw new Error("--stateFile is required for restore.")
  }

  try {
    const state = await readJson(statePath)
    await restorePackageVersion(state.packageJsonPath, state.originalVersion)
    await fs.rm(statePath, { force: true })
    process.stdout.write(`${JSON.stringify({ restored: true, version: state.originalVersion }, null, 2)}\n`)
  } catch (error) {
    if (args.ignoreMissingState) {
      process.stdout.write(`${JSON.stringify({ restored: false, skipped: true }, null, 2)}\n`)
      return
    }

    throw error
  }
}

async function main() {
  const [command, ...argv] = process.argv.slice(2)
  const args = parseArgs(argv)

  if (command === "apply") {
    await applyVersionAlignment(args)
    return
  }

  if (command === "restore") {
    await restoreVersionAlignment(args)
    return
  }

  throw new Error(`Unknown command \"${command ?? ""}\". Use apply or restore.`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
