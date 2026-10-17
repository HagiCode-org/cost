import type { TFunction } from "i18next"
import { describe, expect, it } from "vitest"

import { hagicodeCompliance } from "@/config/compliance"
import { getHomePageContent } from "./home-content"

const t = ((key: string) => key) as unknown as TFunction

describe("getHomePageContent", () => {
  it("maps footer content from i18n keys", () => {
    const content = getHomePageContent(t)

    expect(content.footer.disclaimerTitle).toBe("footer.disclaimerTitle")
    expect(content.footer.disclaimer).toBe("footer.disclaimer")
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
    expect(content.footer.links).toEqual([
      {
        label: "footer.links.github",
        href: "https://github.com/HagiCode-org/site",
      },
      {
        label: "footer.links.steam",
        href: "https://store.steampowered.com/app/4625540/Hagicode/",
      },
      {
        label: "footer.links.pricing",
        href: "https://openai.com/api/pricing/",
      },
    ])
    expect(content.footer.links).toContainEqual({
      label: "footer.links.steam",
      href: "https://store.steampowered.com/app/4625540/Hagicode/",
    })
    expect(content.footer.links.at(-1)).toEqual({
      label: "footer.links.pricing",
      href: "https://openai.com/api/pricing/",
    })
  })
})
