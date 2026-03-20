import { beforeEach, describe, expect, it } from "vitest"

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
    expect(document.head.querySelectorAll('link[rel="alternate"]').length).toBe(3)
    expect(document.head.querySelector('link[rel="alternate"][hreflang="x-default"]')?.getAttribute("href")).toBe(
      "https://cost.hagicode.com/",
    )
    expect(document.head.querySelector('meta[property="og:locale:alternate"]')?.getAttribute("content")).toBe(
      "en_US",
    )
  })

  it("keeps localized canonical, sharing tags, and alternates synchronized after locale changes", () => {
    initializeDefaultSEO("zh-CN")
    updateSEO("en-US")

    expect(document.title).toBe("Will Agent-Era Leverage Replace You? | HagiCode")
    expect(document.documentElement.lang).toBe("en-US")
    expect(document.head.querySelector('meta[name="description"]')?.getAttribute("content")).toContain(
      "favorite model",
    )
    expect(document.head.querySelector('meta[name="keywords"]')?.getAttribute("content")).toContain(
      "AI productivity",
    )
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(
      "https://cost.hagicode.com/?lang=en-US",
    )
    expect(document.head.querySelector('meta[property="og:locale"]')?.getAttribute("content")).toBe("en_US")
    expect(document.head.querySelector('meta[property="og:locale:alternate"]')?.getAttribute("content")).toBe(
      "zh_CN",
    )
    expect(document.head.querySelector('meta[name="twitter:title"]')?.getAttribute("content")).toContain(
      "Agent-Era",
    )
    expect(document.head.querySelector('meta[name="twitter:url"]')?.getAttribute("content")).toBe(
      "https://cost.hagicode.com/?lang=en-US",
    )

    const alternateLinks = Array.from(document.head.querySelectorAll('link[rel="alternate"]')).map((link) => ({
      hrefLang: link.getAttribute("hreflang"),
      href: link.getAttribute("href"),
    }))

    expect(alternateLinks).toEqual([
      {
        hrefLang: "zh-CN",
        href: "https://cost.hagicode.com/",
      },
      {
        hrefLang: "en-US",
        href: "https://cost.hagicode.com/?lang=en-US",
      },
      {
        hrefLang: "x-default",
        href: "https://cost.hagicode.com/",
      },
    ])
  })
})
