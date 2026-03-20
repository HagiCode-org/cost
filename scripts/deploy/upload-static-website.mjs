#!/usr/bin/env node
import path from "node:path"

import { deployStaticWebsite } from "./deploy-lib.mjs"
import { parseArgs } from "../release/release-lib.mjs"

function parseContentPaths(value) {
  if (!value) {
    return undefined
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}

async function main() {
  const [command, ...argv] = process.argv.slice(2)
  const args = parseArgs(argv)

  if (command !== "validate" && command !== "deploy") {
    throw new Error(`Unknown command \"${command ?? ""}\". Use validate or deploy.`)
  }

  if (typeof args.archive !== "string") {
    throw new Error("--archive is required.")
  }
  if (typeof args.manifest !== "string") {
    throw new Error("--manifest is required.")
  }
  if (typeof args.storageAccount !== "string") {
    throw new Error("--storageAccount is required.")
  }

  const result = await deployStaticWebsite({
    archivePath: path.resolve(args.archive),
    manifestPath: path.resolve(args.manifest),
    expectedTag: typeof args.expectedTag === "string" ? args.expectedTag : undefined,
    storageAccount: args.storageAccount,
    container: typeof args.container === "string" ? args.container : "$web",
    validateOnly: command === "validate",
    purgeConfig: {
      resourceGroup: typeof args.cdnResourceGroup === "string" ? args.cdnResourceGroup : undefined,
      profileName: typeof args.cdnProfile === "string" ? args.cdnProfile : undefined,
      endpointName: typeof args.cdnEndpoint === "string" ? args.cdnEndpoint : undefined,
      contentPaths: parseContentPaths(typeof args.cdnContentPaths === "string" ? args.cdnContentPaths : undefined),
    },
  })

  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
