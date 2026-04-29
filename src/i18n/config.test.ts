import { describe, expect, it } from "vitest"

import {
  normalizeSupportedLanguage,
  resources,
  supportedLanguageMetadata,
  supportedLanguages,
  supportedNamespaces,
} from "./config"

describe("i18n config", () => {
  it("normalizes supported language aliases into canonical locales", () => {
    expect(normalizeSupportedLanguage("zh")).toBe("zh-CN")
    expect(normalizeSupportedLanguage("zh-TW")).toBe("zh-Hant")
    expect(normalizeSupportedLanguage("en")).toBe("en-US")
    expect(normalizeSupportedLanguage("pt")).toBe("pt-BR")
    expect(normalizeSupportedLanguage("ru-RU")).toBe("ru-RU")
    expect(normalizeSupportedLanguage("unsupported")).toBeNull()
  })

  it("ships generated resources for every supported language and namespace", () => {
    expect(supportedLanguageMetadata.map((item) => item.value)).toEqual(expect.arrayContaining([...supportedLanguages]))
    expect(new Set(supportedLanguageMetadata.map((item) => item.value)).size).toBe(supportedLanguages.length)

    for (const language of supportedLanguages) {
      expect(resources[language]).toBeDefined()
      expect(Object.keys(resources[language] ?? {})).toEqual([...supportedNamespaces])
    }
  })
})
