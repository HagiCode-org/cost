import { readdir, readFile } from "node:fs/promises"
import path from "node:path"
import { describe, expect, it } from "vitest"

const SOURCE_ROOT = path.resolve(process.cwd(), "src")
const BLANK_TARGET = /target(?:=|:\s*)["']_blank["']/u

/**
 * Files whose new-tab anchors open third-party reference sources (vendor pricing and provider pages
 * taken from `sourceUrl`), not first-party destinations. They are deliberately not click-tagged.
 */
const THIRD_PARTY_SOURCE_FILES = new Set([
  "features/income-token/components/ComplianceFooterSection.tsx",
  "features/income-token/components/CostImpactSection.tsx",
  "features/income-token/components/TokenCeilingListSection.tsx",
])

async function listSourceFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(directory, entry.name)
      if (entry.isDirectory()) return listSourceFiles(fullPath)
      return /\.(?:ts|tsx)$/u.test(entry.name) && !/\.test\.(?:ts|tsx)$/u.test(entry.name) ? [fullPath] : []
    }),
  )
  return nested.flat()
}

describe("first-party outbound links", () => {
  it("tags every new-tab anchor that points at a first-party destination, or is deliberately excluded", async () => {
    const files = await listSourceFiles(SOURCE_ROOT)
    const untagged: string[] = []

    for (const file of files) {
      const source = await readFile(file, "utf8")
      if (!BLANK_TARGET.test(source)) continue

      const relative = path.relative(SOURCE_ROOT, file).split(path.sep).join("/")
      const tagged = source.includes("gaEventAttributes(")
      if (!tagged && !THIRD_PARTY_SOURCE_FILES.has(relative)) untagged.push(relative)
    }

    expect(untagged).toEqual([])
  })

  it("keeps the third-party exclusions limited to files that still open source references", async () => {
    for (const relative of THIRD_PARTY_SOURCE_FILES) {
      const source = await readFile(path.join(SOURCE_ROOT, relative), "utf8")
      expect(source, relative).toMatch(/sourceUrl|href=\{[a-zA-Z.]*(?:sourceUrl|href)\}/u)
      expect(source, relative).not.toContain("gaEventAttributes(")
    }
  })
})
