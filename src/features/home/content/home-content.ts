import type { TFunction } from "i18next"
import { hagicodeCompliance } from "@/config/compliance"
import { resolveCostFooterSiteLinks } from "./footer-site-links"

export function getHomePageContent(t: TFunction, locale: "zh-CN" | "en-US") {
  return {
    footer: {
      disclaimerTitle: t("footer.disclaimerTitle"),
      disclaimer: t("footer.disclaimer"),
      extensionNote: t("footer.extensionNote"),
      registrationLabel: t("footer.registrationLabel"),
      registrationItems: [
        {
          label: hagicodeCompliance.icp.label,
          href: hagicodeCompliance.icp.href,
          ariaLabel: t("footer.registrationAria.icp"),
        },
        {
          label: hagicodeCompliance.publicSecurity.label,
          href: hagicodeCompliance.publicSecurity.href,
          ariaLabel: t("footer.registrationAria.publicSecurity"),
        },
      ],
      linksTitle: t("footer.linksTitle"),
      links: [
        ...resolveCostFooterSiteLinks(locale),
        {
          label: t("footer.links.github"),
          href: "https://github.com/HagiCode-org/site",
        },
        {
          label: t("footer.links.pricing"),
          href: "https://openai.com/api/pricing/",
        },
      ],
      copyright: t("footer.copyright"),
    },
  }
}
