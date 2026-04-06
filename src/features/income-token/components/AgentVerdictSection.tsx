import { useState } from "react"
import { ChevronDown, Share2, TrendingUp } from "lucide-react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { ResultViewModel } from "@/features/income-token/lib/build-result-view-model"
import { useShareCurrentSite } from "@/hooks/use-share-current-site"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { AgentScaleIndicator } from "./AgentScaleIndicator"

interface AgentVerdictSectionProps {
  data: ResultViewModel["summarySection"]
}

interface DetailTooltipProps {
  label: string
  formula?: string
  explanation: string
}

interface MetricValueProps extends DetailTooltipProps {
  value: string
  className?: string
}

const mobileTooltipTriggerClassName =
  "inline-flex size-6 items-center justify-center rounded-full border border-primary/20 bg-primary/8 text-xs font-bold text-primary transition-colors hover:bg-primary/12"

const desktopTooltipTriggerClassName =
  "inline-flex size-5 items-center justify-center rounded-full border border-primary/20 bg-primary/8 text-[11px] font-bold text-primary transition-colors hover:bg-primary/12"

function MobileDetailTooltip({ label, formula, explanation }: DetailTooltipProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const detailAriaLabel = t("results.summary.detailAria", { label })

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={mobileTooltipTriggerClassName}
          aria-label={detailAriaLabel}
        >
          ?
        </button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        aria-describedby={undefined}
        className="!inset-2 !grid !h-[calc(100dvh-1rem)] !w-[calc(100vw-1rem)] !max-h-none !max-w-none !translate-x-0 !translate-y-0 !gap-0 !overflow-hidden !rounded-[1.75rem] !border-0 !bg-background !p-0 !ring-0"
      >
        <div className="relative flex h-full min-h-0 flex-col">
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute top-[max(env(safe-area-inset-top),1rem)] right-4 z-10 shrink-0 rounded-full px-3"
            >
              {t("results.summary.closeDetail")}
            </Button>
          </DialogClose>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-[max(env(safe-area-inset-bottom),1.5rem)] pt-[max(env(safe-area-inset-top),4.5rem)]">
            <div className="mx-auto flex min-h-full w-full max-w-xl flex-col justify-center">
              <DialogHeader className="gap-4 py-6">
                <DialogTitle className="text-base leading-6 font-semibold sm:text-lg">{label}</DialogTitle>
                {formula ? <p className="break-all font-mono text-xs text-muted-foreground">{formula}</p> : null}
                <p className="text-sm leading-relaxed text-muted-foreground">{explanation}</p>
              </DialogHeader>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DetailTooltip({ label, formula, explanation }: DetailTooltipProps) {
  const { t } = useTranslation()
  const isMobile = useIsMobile()
  const detailAriaLabel = t("results.summary.detailAria", { label })

  if (isMobile) {
    return <MobileDetailTooltip label={label} formula={formula} explanation={explanation} />
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={desktopTooltipTriggerClassName}
          aria-label={detailAriaLabel}
        >
          ?
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={8} className="max-w-sm rounded-xl px-3 py-3 text-xs leading-relaxed">
        <div className="space-y-2">
          <p className="font-semibold">{label}</p>
          {formula ? <p className="break-all font-mono text-xs md:text-[11px] text-background/90">{formula}</p> : null}
          <p className="text-background/85">{explanation}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

function MetricValue({ label, value, formula, explanation, className }: MetricValueProps) {
  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <p className="display-type text-2xl font-bold">{value}</p>
        <DetailTooltip label={label} formula={formula} explanation={explanation} />
      </div>
    </div>
  )
}

export function AgentVerdictSection({ data }: AgentVerdictSectionProps) {
  const { t } = useTranslation()
  const { shareState, shareCurrentSite } = useShareCurrentSite()
  const [detailOpen, setDetailOpen] = useState(false)

  const shareLabel =
    shareState === "copied"
      ? t("share.copied")
      : shareState === "error"
        ? t("share.failed")
        : t("share.currentSite")

  return (
    <section
      className="glass-panel surface-outline mx-auto min-w-0 w-full max-w-5xl rounded-none p-4 sm:rounded-[2rem] sm:p-8"
      aria-labelledby="agent-verdict-heading"
    >
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="min-w-0 space-y-2">
            <h2 id="agent-verdict-heading" className="display-type text-2xl font-black tracking-tight sm:text-4xl">
              {t("results.summary.heading", {
                model: data.selectedModelName,
                equivalent: data.effectivePeopleEquivalentFormatted,
              })}
            </h2>
            <p className="max-w-3xl text-sm text-muted-foreground">{data.selectedModelDescription}</p>
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          variant={shareState === "error" ? "destructive" : "outline"}
          className="w-full justify-center rounded-full border-border/60 bg-background/80 md:mt-3 md:w-auto md:shrink-0"
          onClick={() => {
            void shareCurrentSite(data.shareCopy).then(() => toast.success(t("share.copied")))
          }}
          aria-label={t("share.currentSiteAria")}
        >
          <Share2 className="size-3.5" aria-hidden="true" />
          {shareLabel}
        </Button>
      </div>

      <Collapsible open={detailOpen} onOpenChange={setDetailOpen}>
        <CollapsibleTrigger
          className="mb-6 flex w-full items-center justify-between rounded-xl border bg-muted/20 px-4 py-3 text-sm font-medium transition-colors hover:bg-muted/30"
          aria-label={t("results.summary.detailCollapseAria")}
        >
          <span>{t("results.summary.detailCollapseLabel")}</span>
          <ChevronDown
            className={cn("size-4 shrink-0 transition-transform", detailOpen && "rotate-180")}
            aria-hidden="true"
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border bg-background/75 p-4">
              <p className="text-xs text-muted-foreground">{t("results.summary.annualIncome")}</p>
              <p className="mt-1 display-type text-2xl font-bold">{data.annualIncomeFormatted}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {data.cityLabel} · {t("results.summary.totalEmploymentCost")}: {data.annualTotalCostFormatted}
              </p>
              <div className="mt-3">
                <MetricValue
                  label={t("results.summary.totalEmploymentCost")}
                  value={data.annualTotalCostFormatted}
                  formula={data.annualTotalCostFormula}
                  explanation={data.annualTotalCostExplanation}
                />
              </div>
            </div>

            <div className="rounded-2xl border bg-background/75 p-4">
              <p className="text-xs text-muted-foreground">{t("results.summary.performanceMultiplier")}</p>
              <MetricValue
                className="mt-1"
                label={t("results.summary.performanceMultiplier")}
                value={data.performanceMultiplierFormatted}
                explanation={data.performanceMultiplierExplanation}
              />
              <div className="mt-4">
                <p className="text-xs text-muted-foreground">{t("results.summary.dailyTokenUsage")}</p>
                <MetricValue
                  className="mt-1"
                  label={t("results.summary.dailyTokenUsage")}
                  value={data.dailyTokenUsageFormatted}
                  explanation={data.dailyTokenUsageExplanation}
                />
              </div>
            </div>

            <div className="rounded-2xl border bg-background/75 p-4">
              <p className="text-xs text-muted-foreground">{t("results.summary.annualAiCost")}</p>
              <MetricValue
                className="mt-1"
                label={t("results.summary.annualAiCost")}
                value={data.annualAiCostFormatted}
                formula={data.annualAiCostFormula}
                explanation={data.annualAiCostExplanation}
              />
              <div className="mt-4 space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">{t("results.summary.salaryShare")}</p>
                  <MetricValue
                    className="mt-1"
                    label={t("results.summary.salaryShare")}
                    value={data.aiCostShareFormatted}
                    formula={data.aiCostShareFormula}
                    explanation={data.aiCostShareExplanation}
                  />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("results.summary.affordableWorkflow")}</p>
                  <MetricValue
                    className="mt-1"
                    label={t("results.summary.affordableWorkflow")}
                    value={data.affordableWorkflowCountFormatted}
                    formula={data.affordableWorkflowFormula}
                    explanation={data.affordableWorkflowExplanation}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border bg-muted/20 p-4">
              <div className="mb-2 flex items-center gap-2">
                <TrendingUp className="size-4 text-primary" aria-hidden="true" />
                <p className="font-medium">{t("results.summary.dailyAiCost")}</p>
              </div>
              <MetricValue
                label={t("results.summary.dailyAiCost")}
                value={data.dailyAiCostFormatted}
                formula={data.dailyAiCostFormula}
                explanation={data.dailyAiCostExplanation}
              />
            </div>

            <div className="rounded-2xl border bg-muted/20 p-4">
              <div className="mb-2 flex items-center gap-2">
                <TrendingUp className="size-4 text-primary" aria-hidden="true" />
                <p className="font-medium">{t("results.summary.costEffectiveness")}</p>
              </div>
              <MetricValue
                label={t("results.summary.costEffectiveness")}
                value={data.costEffectivenessFormatted}
                formula={data.costEffectivenessFormula}
                explanation={data.costEffectivenessExplanation}
              />
            </div>

            <div className="rounded-2xl border bg-muted/20 p-4">
              <div className="mb-2 flex items-center gap-2">
                <TrendingUp className="size-4 text-primary" aria-hidden="true" />
                <p className="font-medium">{t("results.summary.peopleEquivalent")}</p>
              </div>
              <MetricValue
                label={t("results.summary.peopleEquivalent")}
                value={data.effectivePeopleEquivalentFormatted}
                formula={data.effectivePeopleEquivalentFormula}
                explanation={data.effectivePeopleEquivalentExplanation}
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-[1.5rem] border bg-background/75 p-4">
          <div className="mb-4">
            <p className="text-xs text-muted-foreground">{t("results.hagicode.currentLabel")}</p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {data.effectivePeopleEquivalentFormatted}
            </p>
          </div>
          <AgentScaleIndicator
            title={t("results.summary.dangerScale")}
            value={data.effectivePeopleEquivalentFormatted}
            badge={data.dangerScaleLabel}
            summary={data.dangerScaleSummary}
            position={data.dangerScalePosition}
            direction="danger"
            ticks={["1.0x", "1.5x", "2.0x", "3.0x"]}
          />
        </div>
        <div className="rounded-[1.5rem] border bg-background/75 p-4">
          <div className="mb-4">
            <p className="text-xs text-muted-foreground">{t("results.hagicode.currentLabel")}</p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {data.costEffectivenessFormatted}
            </p>
          </div>
          <AgentScaleIndicator
            title={t("results.summary.costEffectivenessScale")}
            value={data.costEffectivenessFormatted}
            badge={data.costEffectivenessScaleLabel}
            summary={data.costEffectivenessScaleSummary}
            position={data.costEffectivenessScalePosition}
            direction="value"
            ticks={["0x", "1x", "2x", "3x+"]}
          />
        </div>
      </div>

      <div className="mt-6 rounded-[1.5rem] border bg-background/75 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {t("results.summary.heading", {
            model: data.selectedModelName,
            equivalent: data.effectivePeopleEquivalentFormatted,
          })}
        </p>
        <p className="mt-3 text-lg font-bold">{data.verdictHeadline}</p>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">{data.verdictBody}</p>
      </div>
    </section>
  )
}
