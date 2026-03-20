import { AlertTriangle, Share2 } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { useShareCurrentSite } from "@/hooks/use-share-current-site"
import type { ResultViewModel } from "@/features/income-token/lib/build-result-view-model"
import { AgentScaleIndicator } from "./AgentScaleIndicator"

interface FloatingAgentStatusBarProps {
  data: ResultViewModel["summarySection"]
  topOffset?: number
}

const toneStyles = {
  danger: "status-float-bar status-float-bar--danger text-destructive",
  warning: "status-float-bar status-float-bar--warning text-amber-700 dark:text-amber-300",
  safe: "status-float-bar status-float-bar--safe text-emerald-700 dark:text-emerald-300",
} as const

const edgeToneStyles = {
  danger: "status-edge--danger",
  warning: "status-edge--warning",
  safe: "status-edge--safe",
} as const

export function FloatingAgentStatusBar({ data, topOffset = 0 }: FloatingAgentStatusBarProps) {
  const { t } = useTranslation()
  const { shareState, shareCurrentSite } = useShareCurrentSite()

  const shareLabel =
    shareState === "copied"
      ? t("share.copied")
      : shareState === "error"
        ? t("share.failed")
        : t("share.currentSite")

  return (
    <div className="pointer-events-none sticky z-30 transition-[top] duration-300" style={{ top: `${topOffset}px` }}>
      <div className={`pointer-events-auto border-t backdrop-blur-2xl ${toneStyles[data.verdictTone]}`}>
        <div className={`status-edge status-edge--left ${edgeToneStyles[data.verdictTone]}`} aria-hidden="true" />
        <div className={`status-edge status-edge--right ${edgeToneStyles[data.verdictTone]}`} aria-hidden="true" />

        <div className="relative px-4 py-4 sm:px-6">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <div className="rounded-[1.5rem] border border-border/60 bg-background/84 px-4 py-4 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.35)] sm:px-5">
              <div className="space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-current/12 bg-current/6 px-3 py-1 text-xs font-semibold">
                    <AlertTriangle className="size-3.5" aria-hidden="true" />
                    {data.verdictHeadline}
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant={shareState === "error" ? "destructive" : "outline"}
                    className="rounded-full border-border/60 bg-background/80"
                    onClick={() => void shareCurrentSite()}
                    aria-label={t("share.currentSiteAria")}
                  >
                    <Share2 className="size-3.5" aria-hidden="true" />
                    {shareLabel}
                  </Button>
                </div>
                <p className="text-sm leading-relaxed text-foreground/88 dark:text-foreground/84">
                  {data.verdictBody}
                </p>
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              <div className="rounded-[1.5rem] border border-border/60 bg-background/78 px-4 py-4 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.28)]">
                <AgentScaleIndicator
                  title={t("results.summary.dangerScale")}
                  value={data.effectivePeopleEquivalentFormatted}
                  badge={data.dangerScaleLabel}
                  summary={data.dangerScaleSummary}
                  position={data.dangerScalePosition}
                  direction="danger"
                  ticks={["1.0x", "1.5x", "2.0x", "3.0x"]}
                  compact
                />
              </div>
              <div className="rounded-[1.5rem] border border-border/60 bg-background/78 px-4 py-4 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.28)]">
                <AgentScaleIndicator
                  title={t("results.summary.costEffectivenessScale")}
                  value={data.costEffectivenessFormatted}
                  badge={data.costEffectivenessScaleLabel}
                  summary={data.costEffectivenessScaleSummary}
                  position={data.costEffectivenessScalePosition}
                  direction="value"
                  ticks={["0x", "1x", "2x", "3x+"]}
                  compact
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
