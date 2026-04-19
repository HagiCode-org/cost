import { beforeEach, describe, expect, it } from "vitest"

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
    injectAllSchemas("en-US")

    const scripts = Array.from(document.head.querySelectorAll('script[type="application/ld+json"]'))
    expect(scripts).toHaveLength(3)

    const website = JSON.parse(document.getElementById("json-ld-website")?.textContent ?? "{}")
    const webpage = JSON.parse(document.getElementById("json-ld-webpage")?.textContent ?? "{}")

    expect(website.name).toBe("Will AI Replace Me?")
    expect(website.description).toContain("favorite model")
    expect(website.inLanguage).toBe("en-US")
    expect(webpage.url).toBe("https://cost.hagicode.com/?lang=en-US")
    expect(webpage.inLanguage).toBe("en-US")
  })
})
