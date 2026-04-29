import { describe, expect, it } from "vitest"

import { buildShareUrl } from "./share"

describe("buildShareUrl", () => {
  it("includes the active language while preserving unrelated query params", () => {
    const url = new URL(
      buildShareUrl({
        href: "https://cost.hagicode.com/?dailyTokens=180&theme=dark&foo=bar#results",
        language: "ja-JP",
        theme: "light",
      }),
    )

    expect(url.searchParams.get("lang")).toBe("ja-JP")
    expect(url.searchParams.get("theme")).toBe("light")
    expect(url.searchParams.get("dailyTokens")).toBe("180")
    expect(url.searchParams.get("foo")).toBe("bar")
    expect(url.hash).toBe("#results")
  })

  it("replaces an existing language parameter with the active locale", () => {
    const url = new URL(
      buildShareUrl({
        href: "https://cost.hagicode.com/?lang=zh-CN&theme=dark",
        language: "pt-BR",
        theme: "dark",
      }),
    )

    expect(url.searchParams.get("lang")).toBe("pt-BR")
    expect(url.searchParams.get("theme")).toBe("dark")
  })
})
