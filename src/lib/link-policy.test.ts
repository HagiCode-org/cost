import { describe, expect, it } from "vitest"

import { getExternalLinkRel, isFirstPartyHref } from "./link-policy"

describe("first-party link policy", () => {
  it.each([
    "https://hagicode.com",
    "https://www.hagicode.com/en-US/desktop/",
    "https://DOCS.hagicode.com/installation/docker-compose/",
    "https://github.com/HagiCode-org/site",
    "https://github.com/hagicode-org/cost/issues",
    "/desktop/history",
  ])("classifies %s as first-party", (href) => {
    expect(isFirstPartyHref(href)).toBe(true)
    expect(getExternalLinkRel(href)).toBe("noopener")
  })

  it.each([
    "https://platform.claude.com/docs/en/about-claude/pricing#model-pricing",
    "https://developers.openai.com/api/docs/models/gpt-5.5",
    "https://hagicode.com.evil.example/",
    "https://nothagicode.com/",
    "https://example.com/hagicode.com",
    "https://github.com/HagiCode-org-fake/site",
    "//evil.example/hagicode.com",
  ])("classifies %s as third-party", (href) => {
    expect(isFirstPartyHref(href)).toBe(false)
    expect(getExternalLinkRel(href)).toBe("noopener noreferrer")
  })

  it("treats a missing destination as third-party", () => {
    expect(getExternalLinkRel(undefined)).toBe("noopener noreferrer")
  })
})
