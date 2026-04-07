import type { TFunction } from "i18next"
import { describe, expect, it } from "vitest"

import { hagicodeCompliance } from "@/config/compliance"
import { getHomePageContent } from "./home-content"

const t = ((key: string) => key) as unknown as TFunction

describe("getHomePageContent", () => {
  it("maps footer content from i18n keys", () => {
    const content = getHomePageContent(t, "zh-CN")

    expect(content.footer.disclaimerTitle).toBe("footer.disclaimerTitle")
    expect(content.footer.disclaimer).toBe("footer.disclaimer")
    expect(content.footer.copyright).toBe("footer.copyright")
    expect(content.footer.registrationItems).toEqual([
      {
        label: hagicodeCompliance.icp.label,
        href: hagicodeCompliance.icp.href,
        ariaLabel: "footer.registrationAria.icp",
      },
      {
        label: hagicodeCompliance.publicSecurity.label,
        href: hagicodeCompliance.publicSecurity.href,
        ariaLabel: "footer.registrationAria.publicSecurity",
      },
    ])
    expect(content.footer.links[0]).toEqual({
      siteId: "hagicode-main",
      label: "HagiCode 主站",
      description: "产品入口",
      href: "https://hagicode.com/",
    })
    expect(content.footer.links.some((link) => link.href === "https://cost.hagicode.com/")).toBe(false)
    expect(content.footer.links.at(-1)).toEqual({
      label: "footer.links.pricing",
      href: "https://openai.com/api/pricing/",
    })
  })
})
