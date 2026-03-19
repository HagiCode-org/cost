import { resolveSEOConfig, siteConfig } from "@/config/seo"

export function injectAllSchemas(language: "zh-CN" | "en-US" = "zh-CN") {
  const seo = resolveSEOConfig(language)
  const payloads = [
    {
      id: "organization",
      value: {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: siteConfig.author,
        url: siteConfig.origin,
      },
    },
    {
      id: "website",
      value: {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: siteConfig.name,
        url: seo.url,
        description: seo.description,
        inLanguage: language,
      },
    },
    {
      id: "webpage",
      value: {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: seo.title,
        url: seo.url,
        description: seo.description,
        isPartOf: {
          "@type": "WebSite",
          name: siteConfig.name,
          url: seo.url,
        },
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
