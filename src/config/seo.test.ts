import { describe, expect, it } from "vitest"

import { resolveSEOConfig } from "./seo"

describe("resolveSEOConfig", () => {
  it("builds localized seo metadata", () => {
    const config = resolveSEOConfig("en-US")

    expect(config.title).toContain("Will AI Replace Me?")
    expect(config.image).toContain("og-image.svg")
    expect(config.url).toContain("lang=en-US")
  })
})
