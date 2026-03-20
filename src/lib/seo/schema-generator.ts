import { resolveAbsoluteAssetUrl, resolveSEOConfig, siteConfig } from "@/config/seo"
import type { SupportedLanguage } from "@/i18n/config"

function resolveSchemaId(fragment: string) {
  return `${siteConfig.origin.replace(/\/+$/, "")}/#${fragment}`
}

export function injectAllSchemas(language: SupportedLanguage = "zh-CN") {
  const seo = resolveSEOConfig(language)
  const organizationId = resolveSchemaId("organization")
  const websiteId = resolveSchemaId("website")

  const payloads = [
    {
      id: "organization",
      value: {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": organizationId,
        name: siteConfig.organizationName,
        url: siteConfig.origin,
        description: siteConfig.description,
        logo: resolveAbsoluteAssetUrl("og-image.svg"),
      },
    },
    {
      id: "website",
      value: {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": websiteId,
        url: seo.url,
        name: seo.siteName,
        description: seo.description,
        inLanguage: language,
        publisher: {
          "@id": organizationId,
        },
        image: seo.image,
      },
    },
    {
      id: "webpage",
      value: {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": seo.url,
        url: seo.url,
        name: seo.title,
        description: seo.description,
        inLanguage: language,
        isPartOf: {
          "@id": websiteId,
        },
        about: {
          "@id": organizationId,
        },
        primaryImageOfPage: seo.image,
      },
    },
  ]

  payloads.forEach(({ id, value }) => {
    const scriptId = `json-ld-${id}`
    let script = document.getElementById(scriptId) as HTMLScriptElement | null

    if (!script) {
      script = document.createElement("script")
      script.type = "application/ld+json"
      script.id = scriptId
      document.head.appendChild(script)
    }

    script.textContent = JSON.stringify(value)
  })
}
