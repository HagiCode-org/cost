import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"

import { afterEach, describe, expect, it } from "vitest"

import { createManifestFromArchive, getArchiveName, packageDirectory } from "../../scripts/release/release-lib.mjs"
import { deployStaticWebsite, resolveCacheControl } from "../../scripts/deploy/deploy-lib.mjs"

const fixtureDir = path.resolve("tests/fixtures/static-site")
const temporaryDirectories: string[] = []

async function createTempDir(prefix: string) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), prefix))
  temporaryDirectories.push(directory)
  return directory
}

async function createReleaseBundle(version = "1.2.3") {
  const outputDir = await createTempDir("cost-deploy-")
  const archivePath = path.join(outputDir, getArchiveName(version))
  const manifestPath = path.join(outputDir, "release-manifest.json")

  await packageDirectory({ sourceDir: fixtureDir, archivePath })
  await createManifestFromArchive({
    archivePath,
    outputPath: manifestPath,
    version,
    tag: `v${version}`,
    commitSha: "fedcba9876543210fedcba9876543210fedcba98",
    basePath: "/",
    siteUrl: "https://cost.hagicode.com/",
    builtAt: "2026-03-20T00:00:00.000Z",
  })

  return { archivePath, manifestPath }
}

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => fs.rm(directory, { recursive: true, force: true })))
})

describe("upload-static-website", () => {
  it("classifies html, root metadata, and hashed assets with separate cache policies", () => {
    expect(resolveCacheControl("index.html")).toBe("no-cache, no-store, must-revalidate")
    expect(resolveCacheControl("robots.txt")).toBe("public, max-age=300, must-revalidate")
    expect(resolveCacheControl("assets/app-12345678.js")).toBe("public, max-age=31536000, immutable")
  })

  it("skips CDN purge when CDN configuration is absent", async () => {
    const { archivePath, manifestPath } = await createReleaseBundle()
    const commands: Array<{ command: string; args: string[] }> = []

    const result = await deployStaticWebsite({
      archivePath,
      manifestPath,
      expectedTag: "v1.2.3",
      storageAccount: "coststorage",
      validateOnly: false,
      execute: async (command, args) => {
        commands.push({ command, args })
        return { stdout: "", stderr: "" }
      },
    })

    expect(commands.some((entry) => entry.args.includes("cdn"))).toBe(false)
    expect(result.purge).toEqual({ executed: false, reason: "not-configured" })
    expect(commands.filter((entry) => entry.args.includes("upload"))).toHaveLength(3)
  })

  it("runs CDN purge when the required configuration is present", async () => {
    const { archivePath, manifestPath } = await createReleaseBundle()
    const commands: Array<{ command: string; args: string[] }> = []

    const result = await deployStaticWebsite({
      archivePath,
      manifestPath,
      expectedTag: "v1.2.3",
      storageAccount: "coststorage",
      validateOnly: false,
      purgeConfig: {
        resourceGroup: "cost-rg",
        profileName: "cost-cdn",
        endpointName: "cost-endpoint",
        contentPaths: ["/*"],
      },
      execute: async (command, args) => {
        commands.push({ command, args })
        return { stdout: "", stderr: "" }
      },
    })

    expect(commands.some((entry) => entry.args.includes("purge"))).toBe(true)
    expect(result.purge).toEqual({
      executed: true,
      reason: "completed",
      contentPaths: ["/*"],
    })
  })

  it("aborts before upload when Azure configuration is missing", async () => {
    const { archivePath, manifestPath } = await createReleaseBundle()
    const commands: Array<{ command: string; args: string[] }> = []

    await expect(
      deployStaticWebsite({
        archivePath,
        manifestPath,
        expectedTag: "v1.2.3",
        storageAccount: "",
        validateOnly: false,
        execute: async (command, args) => {
          commands.push({ command, args })
          return { stdout: "", stderr: "" }
        },
      }),
    ).rejects.toThrow(/Missing Azure deployment configuration/i)
    expect(commands).toEqual([])
  })

  it("stops the deploy flow on upload failures", async () => {
    const { archivePath, manifestPath } = await createReleaseBundle()
    const commands: Array<{ command: string; args: string[] }> = []

    await expect(
      deployStaticWebsite({
        archivePath,
        manifestPath,
        expectedTag: "v1.2.3",
        storageAccount: "coststorage",
        validateOnly: false,
        execute: async (command, args) => {
          commands.push({ command, args })
          if (args.includes("upload")) {
            throw new Error("simulated upload failure")
          }
          return { stdout: "", stderr: "" }
        },
      }),
    ).rejects.toThrow(/simulated upload failure/i)
    expect(commands.filter((entry) => entry.args.includes("upload"))).toHaveLength(1)
    expect(commands.some((entry) => entry.args.includes("purge"))).toBe(false)
  })
})
