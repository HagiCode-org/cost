import { resolveAbsoluteAssetUrl, resolveSEOConfig, siteConfig } from "@/config/seo"
import type { SupportedLanguage } from "@/i18n/config"

const HAGICODE_MAIN_URL = "https://hagicode.com/"
const HAGICODE_DOCS_URL = "https://docs.hagicode.com/"
const HAGICODE_BUILDER_URL = "https://builder.hagicode.com/"
const HAGICODE_SOUL_URL = "https://soul.hagicode.com/"
const HAGICODE_TRAIT_URL = "https://trait.hagicode.com/"

function resolveSchemaId(fragment: string) {
  return `${siteConfig.origin.replace(/\/+$/, "")}/#${fragment}`
}

export function injectAllSchemas(language: SupportedLanguage = "zh-CN") {
  const seo = resolveSEOConfig(language)
  const organizationId = resolveSchemaId("organization")
  const websiteId = resolveSchemaId("website")
  const ecosystemId = `${HAGICODE_MAIN_URL}#website`

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
        sameAs: [
          HAGICODE_MAIN_URL,
          HAGICODE_DOCS_URL,
          HAGICODE_BUILDER_URL,
          HAGICODE_SOUL_URL,
          HAGICODE_TRAIT_URL,
        ],
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
        isPartOf: {
          "@type": "WebSite",
          "@id": ecosystemId,
          name: "HagiCode",
          url: HAGICODE_MAIN_URL,
        },
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
        relatedLink: [
          HAGICODE_MAIN_URL,
          HAGICODE_DOCS_URL,
          HAGICODE_BUILDER_URL,
        ],
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
