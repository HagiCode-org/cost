import { beforeEach, describe, expect, it } from "vitest"

import { resolveSEOConfig } from "@/config/seo"
import { injectAllSchemas } from "./schema-generator"

describe("injectAllSchemas", () => {
  beforeEach(() => {
    document.head.innerHTML = ""
  })

  it("injects Organization, WebSite, and WebPage JSON-LD for the Cost domain", () => {
    injectAllSchemas("zh-CN")

    const scripts = Array.from(document.head.querySelectorAll('script[type="application/ld+json"]'))
    expect(scripts).toHaveLength(3)

    const organization = JSON.parse(document.getElementById("json-ld-organization")?.textContent ?? "{}")
    const website = JSON.parse(document.getElementById("json-ld-website")?.textContent ?? "{}")
    const webpage = JSON.parse(document.getElementById("json-ld-webpage")?.textContent ?? "{}")

    expect(organization.url).toBe("https://cost.hagicode.com")
    expect(organization.sameAs).toContain("https://hagicode.com/")
    expect(organization.sameAs).toContain("https://docs.hagicode.com/")
    expect(website.url).toBe("https://cost.hagicode.com/")
    expect(website.inLanguage).toBe("zh-CN")
    expect(website.isPartOf.url).toBe("https://hagicode.com/")
    expect(webpage.isPartOf["@id"]).toBe("https://cost.hagicode.com/#website")
    expect(webpage.relatedLink).toContain("https://builder.hagicode.com/")
  })

  it("updates localized JSON-LD in place when the active locale changes", () => {
    injectAllSchemas("zh-CN")
    injectAllSchemas("ja-JP")

    const scripts = Array.from(document.head.querySelectorAll('script[type="application/ld+json"]'))
    expect(scripts).toHaveLength(3)

    const website = JSON.parse(document.getElementById("json-ld-website")?.textContent ?? "{}")
    const webpage = JSON.parse(document.getElementById("json-ld-webpage")?.textContent ?? "{}")
    const seo = resolveSEOConfig("ja-JP")

    expect(website.name).toBe(seo.siteName)
    expect(website.description).toBe(seo.description)
    expect(website.inLanguage).toBe("ja-JP")
    expect(webpage.url).toBe("https://cost.hagicode.com/?lang=ja-JP")
    expect(webpage.inLanguage).toBe("ja-JP")
  })
})
