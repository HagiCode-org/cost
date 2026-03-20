import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"

import { afterEach, describe, expect, it } from "vitest"

import {
  DEFAULT_MANIFEST_NAME,
  createManifestFromArchive,
  getArchiveName,
  normalizeBasePath,
  normalizeSiteUrl,
  packageDirectory,
  readJson,
  resolveReleaseVersionTag,
  verifyManifestChecksum,
} from "../../scripts/release/release-lib.mjs"
import { deployStaticWebsite } from "../../scripts/deploy/deploy-lib.mjs"

const fixtureDir = path.resolve("tests/fixtures/static-site")
const temporaryDirectories: string[] = []

async function createTempDir(prefix: string) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), prefix))
  temporaryDirectories.push(directory)
  return directory
}

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => fs.rm(directory, { recursive: true, force: true })))
})

describe("release helpers", () => {
  it("normalizes semver tags and archive naming", () => {
    expect(resolveReleaseVersionTag({ version: "1.2.3" })).toEqual({
      version: "1.2.3",
      tag: "v1.2.3",
    })
    expect(resolveReleaseVersionTag({ tag: "refs/tags/v2.0.0-beta.1" })).toEqual({
      version: "2.0.0-beta.1",
      tag: "v2.0.0-beta.1",
    })
    expect(getArchiveName("1.2.3")).toBe("cost-site-v1.2.3.tar.gz")
  })

  it("normalizes base path and site url metadata", () => {
    expect(normalizeBasePath("preview")).toBe("/preview/")
    expect(normalizeBasePath("/preview")).toBe("/preview/")
    expect(normalizeSiteUrl("https://cost-preview.hagicode.com")).toBe(
      "https://cost-preview.hagicode.com/",
    )
  })

  it("packages the static site and emits a matching release manifest", async () => {
    const outputDir = await createTempDir("cost-release-")
    const archivePath = path.join(outputDir, getArchiveName("1.2.3"))
    const manifestPath = path.join(outputDir, DEFAULT_MANIFEST_NAME)

    await packageDirectory({ sourceDir: fixtureDir, archivePath })

    const manifest = await createManifestFromArchive({
      archivePath,
      outputPath: manifestPath,
      version: "1.2.3",
      tag: "v1.2.3",
      commitSha: "0123456789abcdef0123456789abcdef01234567",
      basePath: "/",
      siteUrl: "https://cost.hagicode.com/",
      builtAt: "2026-03-20T00:00:00.000Z",
    })

    await verifyManifestChecksum({ manifest, archivePath })

    const storedManifest = await readJson(manifestPath)
    expect(storedManifest).toMatchObject({
      version: "1.2.3",
      tag: "v1.2.3",
      artifactName: "cost-site-v1.2.3.tar.gz",
      commitSha: "0123456789abcdef0123456789abcdef01234567",
      builtAt: "2026-03-20T00:00:00.000Z",
      basePath: "/",
      siteUrl: "https://cost.hagicode.com/",
    })
  })

  it("temporarily aligns package.json version metadata and restores it", async () => {
    const workingDir = await createTempDir("cost-package-")
    const packageJsonPath = path.join(workingDir, "package.json")
    const statePath = path.join(workingDir, "release-state.json")
    const envPath = path.join(workingDir, "release.env")

    await fs.writeFile(
      packageJsonPath,
      JSON.stringify({ name: "fixture-cost", version: "0.1.0" }, null, 2),
      "utf8",
    )

    const { spawnSync } = await import("node:child_process")
    const applyResult = spawnSync(
      "node",
      [
        path.resolve("scripts/release/align-release-version.mjs"),
        "apply",
        "--version",
        "1.4.0",
        "--packageJson",
        packageJsonPath,
        "--stateFile",
        statePath,
        "--envOutput",
        envPath,
      ],
      { cwd: path.resolve("."), encoding: "utf8" },
    )

    expect(applyResult.status).toBe(0)
    const alignedPackage = JSON.parse(await fs.readFile(packageJsonPath, "utf8")) as { version: string }
    expect(alignedPackage.version).toBe("1.4.0")

    const envContents = await fs.readFile(envPath, "utf8")
    expect(envContents).toContain("VITE_APP_VERSION=1.4.0")
    expect(envContents).toContain("COST_RELEASE_TAG=v1.4.0")

    const restoreResult = spawnSync(
      "node",
      [
        path.resolve("scripts/release/align-release-version.mjs"),
        "restore",
        "--stateFile",
        statePath,
      ],
      { cwd: path.resolve("."), encoding: "utf8" },
    )

    expect(restoreResult.status).toBe(0)
    const restoredPackage = JSON.parse(await fs.readFile(packageJsonPath, "utf8")) as { version: string }
    expect(restoredPackage.version).toBe("0.1.0")
  })

  it("fails deployment validation before upload when the manifest checksum mismatches", async () => {
    const outputDir = await createTempDir("cost-release-mismatch-")
    const archivePath = path.join(outputDir, getArchiveName("1.2.3"))
    const manifestPath = path.join(outputDir, DEFAULT_MANIFEST_NAME)

    await packageDirectory({ sourceDir: fixtureDir, archivePath })
    const manifest = await createManifestFromArchive({
      archivePath,
      outputPath: manifestPath,
      version: "1.2.3",
      tag: "v1.2.3",
      commitSha: "0123456789abcdef0123456789abcdef01234567",
      basePath: "/",
      siteUrl: "https://cost.hagicode.com/",
      builtAt: "2026-03-20T00:00:00.000Z",
    })

    manifest.artifactSha256 = "bad-checksum"
    await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8")

    const uploadCalls: Array<{ command: string; args: string[] }> = []
    await expect(
      deployStaticWebsite({
        archivePath,
        manifestPath,
        expectedTag: "v1.2.3",
        storageAccount: "coststorage",
        validateOnly: false,
        execute: async (command, args) => {
          uploadCalls.push({ command, args })
          return { stdout: "", stderr: "" }
        },
      }),
    ).rejects.toThrow(/checksum mismatch/i)
    expect(uploadCalls).toEqual([])
  })
})
