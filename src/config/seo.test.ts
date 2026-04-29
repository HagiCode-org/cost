import { describe, expect, it } from "vitest"

import { getSupportedLanguageMetadata, supportedLanguages } from "@/i18n/config"
import { resolveSEOConfig } from "./seo"

describe("resolveSEOConfig", () => {
  it("uses the Cost production domain for default and localized URLs", () => {
    const zhConfig = resolveSEOConfig("zh-CN")
    const enConfig = resolveSEOConfig("en-US")

    expect(zhConfig.url).toBe("https://cost.hagicode.com/")
    expect(zhConfig.image).toBe("https://cost.hagicode.com/og-image.svg")
    expect(enConfig.url).toBe("https://cost.hagicode.com/?lang=en-US")
  })

  it("keeps locale-specific metadata and alternate links in one source of truth", () => {
    const config = resolveSEOConfig("fr-FR")

    expect(config.locale).toBe("fr_FR")
    expect(config.url).toBe("https://cost.hagicode.com/?lang=fr-FR")
    expect(config.ogLocaleAlternates).toHaveLength(supportedLanguages.length - 1)
    expect(config.ogLocaleAlternates).not.toContain(getSupportedLanguageMetadata("fr-FR").ogLocale)
    expect(config.alternates).toHaveLength(supportedLanguages.length + 1)
    expect(config.alternates.slice(0, -1).map((alternate) => alternate.locale)).toEqual([...supportedLanguages])
    expect(config.alternates).toContainEqual({
      locale: "fr-FR",
      hrefLang: "fr-FR",
      url: "https://cost.hagicode.com/?lang=fr-FR",
    })
    expect(config.alternates.at(-1)).toEqual({
      locale: "zh-CN",
      hrefLang: "x-default",
      url: "https://cost.hagicode.com/",
    })
  })
})
