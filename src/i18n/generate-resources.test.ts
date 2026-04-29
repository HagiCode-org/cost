import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"

import { afterEach, describe, expect, it } from "vitest"

import { supportedLanguages, supportedNamespaces } from "./config"

type GeneratorModule = typeof import("../../scripts/generate-i18n-resources.mjs")

const tempDirectories: string[] = []

async function loadGenerator(): Promise<GeneratorModule> {
  return import("../../scripts/generate-i18n-resources.mjs")
}

async function createFixture({
  mutate,
}: {
  mutate?: (files: Record<string, string>) => void
} = {}) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "cost-i18n-"))
  tempDirectories.push(root)

  const [, ...targetLocales] = supportedLanguages
  const files: Record<string, string> = {
    "hagi18n.yaml": [
      "localesRoot: src/i18n/locales",
      "repoRoot: .",
      "baseLocale: en-US",
      "targetLocales:",
      ...targetLocales.map((locale) => `  - ${locale}`),
    ].join("\n"),
  }

  for (const language of supportedLanguages) {
    files[`src/i18n/locales/${language}/translation.yml`] = [
      "messages:",
      `  greeting: "${language} hello {{name}}"`,
      `  summary: "${language} summary"`,
      "",
    ].join("\n")
  }

  mutate?.(files)

  await Promise.all(
    Object.entries(files).map(async ([relativePath, content]) => {
      const filePath = path.join(root, relativePath)
      await fs.mkdir(path.dirname(filePath), { recursive: true })
      await fs.writeFile(filePath, content)
    }),
  )

  return root
}

afterEach(async () => {
  await Promise.all(
    tempDirectories.splice(0).map((directory) => fs.rm(directory, { recursive: true, force: true })),
  )
})

describe("generateI18nResources", () => {
  it("writes deterministic resources across the full language set", async () => {
    const root = await createFixture()
    const { generateI18nResources } = await loadGenerator()

    const first = await generateI18nResources({ cwd: root })
    const generatedFile = path.join(root, "src/i18n/generated-locales/fr-FR/translation.json")
    const firstContent = await fs.readFile(generatedFile, "utf8")

    const second = await generateI18nResources({ cwd: root })
    const secondContent = await fs.readFile(generatedFile, "utf8")

    expect(first.locales).toEqual([...supportedLanguages])
    expect(first.namespaces).toEqual([...supportedNamespaces])
    expect(first.resourceCount).toBe(supportedLanguages.length * supportedNamespaces.length)
    expect(second.resourceCount).toBe(first.resourceCount)
    expect(secondContent).toBe(firstContent)
  })

  it("fails when a supported locale is missing a namespace file", async () => {
    const root = await createFixture({
      mutate(files) {
        delete files["src/i18n/locales/ru-RU/translation.yml"]
        files["src/i18n/locales/ru-RU/.gitkeep"] = ""
      },
    })
    const { generateI18nResources } = await loadGenerator()

    await expect(generateI18nResources({ cwd: root })).rejects.toThrow(
      "[ru-RU] missing namespace file: translation.yml",
    )
  })

  it("fails when a locale drops a translation key", async () => {
    const root = await createFixture({
      mutate(files) {
        files["src/i18n/locales/de-DE/translation.yml"] = ['messages:', '  greeting: "de-DE hello {{name}}"', ""].join(
          "\n",
        )
      },
    })
    const { generateI18nResources } = await loadGenerator()

    await expect(generateI18nResources({ cwd: root })).rejects.toThrow(
      "[de-DE] translation.yml missing key: messages.summary",
    )
  })

  it("fails when placeholders drift across locales", async () => {
    const root = await createFixture({
      mutate(files) {
        files["src/i18n/locales/pt-BR/translation.yml"] = [
          "messages:",
          '  greeting: "pt-BR hello {{user}}"',
          '  summary: "pt-BR summary"',
          "",
        ].join("\n")
      },
    })
    const { generateI18nResources } = await loadGenerator()

    await expect(generateI18nResources({ cwd: root })).rejects.toThrow(
      '[pt-BR] translation.yml placeholder mismatch at messages.greeting: expected ["{{name}}"], got ["{{user}}"]',
    )
  })

  it("fails stale checks when generated resources no longer match the YAML source", async () => {
    const root = await createFixture()
    const { generateI18nResources } = await loadGenerator()

    await generateI18nResources({ cwd: root })
    await fs.writeFile(path.join(root, "src/i18n/generated-locales/ja-JP/translation.json"), "{}\n")

    await expect(generateI18nResources({ cwd: root, check: true })).rejects.toThrow(
      "Generated locale resource is stale: ja-JP/translation.json",
    )
  })
})
