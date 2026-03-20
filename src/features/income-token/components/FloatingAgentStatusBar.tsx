import { AlertTriangle, Share2 } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { useShareCurrentSite } from "@/hooks/use-share-current-site"
import type { ResultViewModel } from "@/features/income-token/lib/build-result-view-model"
import { cn } from "@/lib/utils"

interface FloatingAgentStatusBarProps {
  data: ResultViewModel["summarySection"]
  topOffset: number
}

const verdictToneStyles = {
  danger: "border-destructive/30 bg-destructive/8 text-destructive",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  safe: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
} as const

export function FloatingAgentStatusBar({ data, topOffset }: FloatingAgentStatusBarProps) {
  const { t } = useTranslation()
  const { shareState, shareCurrentSite } = useShareCurrentSite()

  const shareLabel =
    shareState === "copied"
      ? t("share.copied")
      : shareState === "error"
        ? t("share.failed")
        : t("share.currentSite")

  return (
    <div
      className="fixed inset-x-0 z-40 px-4 transition-all duration-300"
      style={{ top: topOffset + 8 }}
    >
      <div className="mx-auto max-w-5xl">
        <div className={cn("flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-lg backdrop-blur-md", verdictToneStyles[data.verdictTone])}>
          <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
          <p className="truncate text-sm font-semibold">{data.verdictHeadline}</p>
          <Button
            type="button"
            size="sm"
            variant={shareState === "error" ? "destructive" : "outline"}
            className="shrink-0 rounded-full border-current/30 bg-white/20 hover:bg-white/30 dark:bg-black/20 dark:hover:bg-black/30"
            onClick={() => void shareCurrentSite()}
            aria-label={t("share.currentSiteAria")}
          >
            <Share2 className="size-3.5" aria-hidden="true" />
            {shareLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
