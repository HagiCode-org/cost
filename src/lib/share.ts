import { languageQueryParam, type SupportedLanguage } from "@/i18n/config"
import type { Theme } from "@/contexts/theme-context"

interface BuildShareUrlOptions {
  href: string
  language: SupportedLanguage
  theme: Theme
}

export function buildShareUrl({ href, language, theme }: BuildShareUrlOptions) {
  const url = new URL(href)
  url.searchParams.set(languageQueryParam, language)
  url.searchParams.set("theme", theme)
  return url.toString()
}

export async function copyTextToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const input = document.createElement("textarea")
  input.value = text
  input.setAttribute("readonly", "true")
  input.style.position = "absolute"
  input.style.left = "-9999px"
  document.body.appendChild(input)
  input.select()
  document.execCommand("copy")
  document.body.removeChild(input)
}
