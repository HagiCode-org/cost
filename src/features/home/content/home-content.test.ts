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
  })
})
