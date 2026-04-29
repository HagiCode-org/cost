import { beforeEach, describe, expect, it } from "vitest"

import { resolveSEOConfig } from "@/config/seo"
import { getSupportedLanguageMetadata, supportedLanguages } from "@/i18n/config"
import { initializeDefaultSEO, updateSEO } from "./utils"

describe("SEO runtime updates", () => {
  beforeEach(() => {
    document.head.innerHTML = ""
    document.body.innerHTML = ""
    document.documentElement.lang = "zh-CN"
    document.title = ""
  })

  it("initializes Cost-domain metadata for the default locale", () => {
    initializeDefaultSEO("zh-CN")

    expect(document.title).toBe("Agent 时代，你会不会被淘汰？ | HagiCode")
    expect(document.documentElement.lang).toBe("zh-CN")
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(
      "https://cost.hagicode.com/",
    )
    expect(document.head.querySelector('meta[property="og:url"]')?.getAttribute("content")).toBe(
      "https://cost.hagicode.com/",
    )
    expect(document.head.querySelector('meta[name="twitter:url"]')?.getAttribute("content")).toBe(
      "https://cost.hagicode.com/",
    )
    expect(document.head.querySelector('meta[property="og:site_name"]')?.getAttribute("content")).toBe(
      "我会被AI替代吗",
    )
    expect(document.head.querySelectorAll('link[rel="alternate"]').length).toBe(supportedLanguages.length + 1)
    expect(document.head.querySelector('link[rel="alternate"][hreflang="x-default"]')?.getAttribute("href")).toBe(
      "https://cost.hagicode.com/",
    )
    expect(
      Array.from(document.head.querySelectorAll('meta[property="og:locale:alternate"]')).map((element) =>
        element.getAttribute("content"),
      ),
    ).toEqual(
      supportedLanguages
        .filter((language) => language !== "zh-CN")
        .map((language) => getSupportedLanguageMetadata(language).ogLocale),
    )
  })

  it("keeps localized canonical, sharing tags, and alternates synchronized after locale changes", () => {
    initializeDefaultSEO("zh-CN")
    updateSEO("fr-FR")
    const expectedSeo = resolveSEOConfig("fr-FR")

    expect(document.documentElement.lang).toBe("fr-FR")
    expect(document.head.querySelector('meta[name="description"]')?.getAttribute("content")).toBe(expectedSeo.description)
    expect(document.head.querySelector('meta[name="keywords"]')?.getAttribute("content")).toBe(
      expectedSeo.keywords.join(", "),
    )
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(
      "https://cost.hagicode.com/?lang=fr-FR",
    )
    expect(document.head.querySelector('meta[property="og:locale"]')?.getAttribute("content")).toBe("fr_FR")
    expect(
      Array.from(document.head.querySelectorAll('meta[property="og:locale:alternate"]')).map((element) =>
        element.getAttribute("content"),
      ),
    ).toEqual(
      supportedLanguages
        .filter((language) => language !== "fr-FR")
        .map((language) => getSupportedLanguageMetadata(language).ogLocale),
    )
    expect(document.head.querySelector('meta[name="twitter:title"]')?.getAttribute("content")).toBe(expectedSeo.title)
    expect(document.head.querySelector('meta[name="twitter:url"]')?.getAttribute("content")).toBe(
      "https://cost.hagicode.com/?lang=fr-FR",
    )

    const alternateLinks = Array.from(document.head.querySelectorAll('link[rel="alternate"]')).map((link) => ({
      hrefLang: link.getAttribute("hreflang"),
      href: link.getAttribute("href"),
    }))

    expect(alternateLinks).toHaveLength(supportedLanguages.length + 1)
    expect(alternateLinks).toContainEqual({
      hrefLang: "fr-FR",
      href: "https://cost.hagicode.com/?lang=fr-FR",
    })
    expect(alternateLinks.at(-1)).toEqual({
      hrefLang: "x-default",
      href: "https://cost.hagicode.com/",
    })
  })
})
