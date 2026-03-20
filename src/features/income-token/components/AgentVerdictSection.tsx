import { Flame, Share2, TrendingUp } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useShareCurrentSite } from "@/hooks/use-share-current-site"
import type { ResultViewModel } from "@/features/income-token/lib/build-result-view-model"

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

function DetailTooltip({ label, formula, explanation }: DetailTooltipProps) {
  const { t } = useTranslation()

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex size-5 items-center justify-center rounded-full border border-primary/20 bg-primary/8 text-[11px] font-bold text-primary transition-colors hover:bg-primary/12"
          aria-label={t("results.summary.detailAria", { label })}
        >
          ?
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={8} className="max-w-sm rounded-xl px-3 py-3 text-xs leading-relaxed">
        <div className="space-y-2">
          <p className="font-semibold">{label}</p>
          {formula ? <p className="break-all font-mono text-[11px] text-background/90">{formula}</p> : null}
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

  const shareLabel =
    shareState === "copied"
      ? t("share.copied")
      : shareState === "error"
        ? t("share.failed")
        : t("share.currentSite")

  return (
    <section
      className="glass-panel surface-outline mx-auto max-w-5xl rounded-[2rem] p-6 sm:p-8"
      aria-labelledby="agent-verdict-heading"
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
            <Flame className="size-6" aria-hidden="true" />
          </div>
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
          className="mt-3 shrink-0 rounded-full border-border/60 bg-background/80"
          onClick={() => void shareCurrentSite()}
          aria-label={t("share.currentSiteAria")}
        >
          <Share2 className="size-3.5" aria-hidden="true" />
          {shareLabel}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-background/75 p-4">
          <p className="text-xs text-muted-foreground">{t("results.summary.annualIncome")}</p>
          <p className="mt-1 display-type text-2xl font-bold">¥{data.annualIncomeFormatted}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {data.cityLabel} · {t("results.summary.totalEmploymentCost")}: ¥{data.annualTotalCostFormatted}
          </p>
          <div className="mt-3">
            <MetricValue
              label={t("results.summary.totalEmploymentCost")}
              value={`¥${data.annualTotalCostFormatted}`}
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
            value={`¥${data.annualAiCostFormatted}`}
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
            value={`¥${data.dailyAiCostFormatted}`}
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
    </section>
  )
}
