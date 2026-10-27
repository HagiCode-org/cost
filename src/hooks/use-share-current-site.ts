import { useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { useTheme } from "@/contexts/theme-context"
import { resolveSupportedLanguage } from "@/i18n/config"
import { captureSiteEvent } from "@/lib/posthog-events"
import { buildShareUrl, copyTextToClipboard } from "@/lib/share"

export type ShareState = "idle" | "copied" | "error"

interface UseShareCurrentSiteOptions {
  /** True when an assessment result exists at the time the caller shares. */
  hasResult: boolean
}

export function useShareCurrentSite({ hasResult }: UseShareCurrentSiteOptions) {
  const { i18n } = useTranslation()
  const { theme } = useTheme()
  const [shareState, setShareState] = useState<ShareState>("idle")

  const language = resolveSupportedLanguage(i18n.resolvedLanguage || i18n.language)

  useEffect(() => {
    if (shareState === "idle") {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setShareState("idle")
    }, 2200)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [shareState])

  const shareCurrentSite = useCallback(async (extraText?: string) => {
    try {
      const shareUrl = buildShareUrl({
        href: window.location.href,
        language,
        theme,
      })

      const content = extraText
        ? `${extraText}\n${shareUrl}`
        : shareUrl

      await copyTextToClipboard(content)
      captureSiteEvent("assessment_shared", { has_result: hasResult })
      setShareState("copied")
    } catch {
      setShareState("error")
    }
  }, [hasResult, language, theme])

  return {
    shareState,
    shareCurrentSite,
  }
}
