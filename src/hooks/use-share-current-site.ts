import { useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { useTheme } from "@/contexts/theme-context"
import type { SupportedLanguage } from "@/i18n/config"
import { buildShareUrl, copyTextToClipboard } from "@/lib/share"

export type ShareState = "idle" | "copied" | "error"

export function useShareCurrentSite() {
  const { i18n } = useTranslation()
  const { theme } = useTheme()
  const [shareState, setShareState] = useState<ShareState>("idle")

  const language = (i18n.resolvedLanguage || "zh-CN") as SupportedLanguage

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
      setShareState("copied")
    } catch {
      setShareState("error")
    }
  }, [language, theme])

  return {
    shareState,
    shareCurrentSite,
  }
}
