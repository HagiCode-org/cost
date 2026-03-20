import { describe, expect, it } from "vitest"

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
    const config = resolveSEOConfig("en-US")

    expect(config.title).toContain("Agent-Era")
    expect(config.locale).toBe("en_US")
    expect(config.ogLocaleAlternates).toEqual(["zh_CN"])
    expect(config.alternates).toEqual([
      {
        locale: "zh-CN",
        hrefLang: "zh-CN",
        url: "https://cost.hagicode.com/",
      },
      {
        locale: "en-US",
        hrefLang: "en-US",
        url: "https://cost.hagicode.com/?lang=en-US",
      },
      {
        locale: "zh-CN",
        hrefLang: "x-default",
        url: "https://cost.hagicode.com/",
      },
    ])
  })
})
