import { useMemo, useState } from "react"
import { ArrowRight, Share2, Sparkles } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useShareCurrentSite } from "@/hooks/use-share-current-site"
import { AgentScaleIndicator } from "./AgentScaleIndicator"
import { buildResultViewModel } from "@/features/income-token/lib/build-result-view-model"
import { evaluate, type EvaluationInput } from "@/features/income-token/lib/calculate-ai-risk"
import type { SupportedLanguage } from "@/i18n/config"

interface HagicodeBoostSectionProps {
  baseInput: EvaluationInput
}

const MIN_BOOST = 1.5
const MAX_BOOST = 10
const BOOST_STEP = 0.5
const MIN_TOKEN_EFFICIENCY = 1.1
const MAX_TOKEN_EFFICIENCY = 2
const TOKEN_EFFICIENCY_STEP = 0.1
const DEFAULT_BOOST = 3
const DEFAULT_TOKEN_EFFICIENCY = 1.25

function formatMultiplier(value: number) {
  return `${value.toFixed(2)}x`
}

function formatTokenUsage(value: number) {
  return `${value.toFixed(1)} M`
}

function formatCny(value: number) {
  return `¥${value.toLocaleString("zh-CN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`
}

function formatSignedDelta(value: number, suffix: string) {
  const sign = value >= 0 ? "+" : "-"
  return `${sign}${Math.abs(value).toFixed(2)}${suffix}`
}

function formatSignedCurrency(value: number) {
  const sign = value >= 0 ? "+" : "-"
  return `${sign}¥${Math.abs(value).toLocaleString("zh-CN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`
}

function getDeltaTone(value: number, mode: "positive" | "negative" = "positive") {
  if (value > 0) {
    return mode === "positive"
      ? "border-emerald-500/30 bg-emerald-500/12 text-emerald-700 dark:text-emerald-300"
      : "border-destructive/30 bg-destructive/10 text-destructive"
  }
  if (value < 0) {
    return mode === "positive"
      ? "border-destructive/30 bg-destructive/10 text-destructive"
      : "border-emerald-500/30 bg-emerald-500/12 text-emerald-700 dark:text-emerald-300"
  }
  return "border-border bg-muted/25 text-muted-foreground"
}

interface ComparisonMetricCardProps {
  label: string
  before: string
  after: string
  delta: string
  deltaValue: number
  deltaMode?: "positive" | "negative"
  formula: string
  currentLabel: string
  boostedLabel: string
}

function ComparisonMetricCard({
  label,
  before,
  after,
  delta,
  deltaValue,
  deltaMode = "positive",
  formula,
  currentLabel,
  boostedLabel,
}: ComparisonMetricCardProps) {
  return (
    <div className="rounded-[1.5rem] border bg-background/74 p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getDeltaTone(deltaValue, deltaMode)}`}>
          {delta}
        </span>
      </div>

        <div className="mt-3 flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{currentLabel}</p>
          <p className="mt-1 display-type text-xl font-bold">{before}</p>
        </div>
        <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <div className="min-w-0 flex-1 text-right">
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{boostedLabel}</p>
          <p className="mt-1 display-type text-xl font-bold text-primary">{after}</p>
        </div>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{formula}</p>
    </div>
  )
}

export function HagicodeBoostSection({ baseInput }: HagicodeBoostSectionProps) {
  const { t, i18n } = useTranslation()
  const [hagicodeBoost, setHagicodeBoost] = useState([DEFAULT_BOOST])
  const [tokenEfficiencyBoost, setTokenEfficiencyBoost] = useState([DEFAULT_TOKEN_EFFICIENCY])
  const language = (i18n.resolvedLanguage || "zh-CN") as SupportedLanguage
  const { shareState, shareCurrentSite } = useShareCurrentSite()

  const boostFactor = hagicodeBoost[0] ?? DEFAULT_BOOST
  const tokenEfficiencyFactor = tokenEfficiencyBoost[0] ?? DEFAULT_TOKEN_EFFICIENCY

  const baseResult = useMemo(() => evaluate(baseInput), [baseInput])
  const baseViewModel = useMemo(() => buildResultViewModel(baseResult, language), [baseResult, language])

  const boostedInput = useMemo(
    () => ({
      ...baseInput,
      performanceMultiplier: baseInput.performanceMultiplier * boostFactor,
      dailyTokenUsageM: (baseInput.dailyTokenUsageM * boostFactor) / tokenEfficiencyFactor,
    }),
    [baseInput, boostFactor, tokenEfficiencyFactor]
  )

  const boostedViewModel = useMemo(() => {
    return buildResultViewModel(evaluate(boostedInput), language)
  }, [boostedInput, language])

  const boostedResult = useMemo(() => evaluate(boostedInput), [boostedInput])

  const baseSummary = baseViewModel.summarySection
  const boostedSummary = boostedViewModel.summarySection
  const boostedPerformance = baseInput.performanceMultiplier * boostFactor
  const boostedTokenUsage = (baseInput.dailyTokenUsageM * boostFactor) / tokenEfficiencyFactor
  const rawScaledTokenUsage = baseInput.dailyTokenUsageM * boostFactor
  const boostedAnnualAiCost = boostedResult.annualAiCostCny
  const threatDelta = boostedResult.effectivePeopleEquivalent - baseResult.effectivePeopleEquivalent
  const costEffectivenessDelta = boostedResult.costEffectivenessRatio - baseResult.costEffectivenessRatio
  const annualAiCostDelta = boostedResult.annualAiCostCny - baseResult.annualAiCostCny

  const verdictToneClass =
    boostedSummary.verdictTone === "danger"
      ? "border-destructive/30 bg-destructive/8 text-destructive"
      : boostedSummary.verdictTone === "warning"
        ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
        : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"

  const shareLabel =
    shareState === "copied"
      ? t("share.copied")
      : shareState === "error"
        ? t("share.failed")
        : t("share.currentSite")

  return (
    <section className="glass-panel surface-outline mx-auto max-w-5xl rounded-[2rem] p-6 sm:p-8" aria-labelledby="hagicode-boost-heading">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/8 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Hagicode
          </div>
          <div className="space-y-2">
            <h2 id="hagicode-boost-heading" className="display-type text-2xl font-black tracking-tight sm:text-3xl">
              {t("results.hagicode.heading")}
            </h2>
            <p className="text-sm leading-7 text-muted-foreground sm:text-base">
              {t("results.hagicode.subtitle")}
            </p>
          </div>
        </div>

        <div className="min-w-[12rem] space-y-3 rounded-[1.5rem] border bg-background/72 px-4 py-4 text-right">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{t("results.hagicode.multiplierLabel")}</p>
            <p className="mt-2 display-type text-3xl font-bold text-primary">{formatMultiplier(boostFactor)}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {t("results.hagicode.utilizationCompact", { value: formatMultiplier(tokenEfficiencyFactor) })}
            </p>
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              variant={shareState === "error" ? "destructive" : "outline"}
              className="rounded-full"
              onClick={() => void shareCurrentSite()}
              aria-label={t("share.currentSiteAria")}
            >
              <Share2 className="size-3.5" aria-hidden="true" />
              {shareLabel}
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-[1.75rem] border bg-background/72 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">{t("results.hagicode.sliderLabel")}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t("results.hagicode.sliderHint")}</p>
          </div>
          <p className="font-mono text-sm font-semibold text-primary">{formatMultiplier(boostFactor)}</p>
        </div>

        <div className="mt-5 px-1">
          <Slider
            value={hagicodeBoost}
            min={MIN_BOOST}
            max={MAX_BOOST}
            step={BOOST_STEP}
            onValueChange={setHagicodeBoost}
            aria-label={t("results.hagicode.sliderLabel")}
            className="cursor-pointer"
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] font-medium text-muted-foreground">
          <span>1.5x</span>
          <span>3x</span>
          <span>5x</span>
          <span>7.5x</span>
          <span>10x</span>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">{t("results.hagicode.utilizationLabel")}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {t("results.hagicode.utilizationHint")}
            </p>
          </div>
          <p className="font-mono text-sm font-semibold text-primary">{formatMultiplier(tokenEfficiencyFactor)}</p>
        </div>

        <div className="mt-5 px-1">
          <Slider
            value={tokenEfficiencyBoost}
            min={MIN_TOKEN_EFFICIENCY}
            max={MAX_TOKEN_EFFICIENCY}
            step={TOKEN_EFFICIENCY_STEP}
            onValueChange={setTokenEfficiencyBoost}
            aria-label={t("results.hagicode.utilizationLabel")}
            className="cursor-pointer"
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] font-medium text-muted-foreground">
          <span>1.1x</span>
          <span>1.25x</span>
          <span>1.5x</span>
          <span>1.75x</span>
          <span>2.0x</span>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <ComparisonMetricCard
            label={t("results.hagicode.scaledEfficiency")}
            before={formatMultiplier(baseInput.performanceMultiplier)}
            after={formatMultiplier(boostedPerformance)}
            delta={formatSignedDelta(boostedPerformance - baseInput.performanceMultiplier, "x")}
            deltaValue={boostedPerformance - baseInput.performanceMultiplier}
            formula={`${formatMultiplier(baseInput.performanceMultiplier)} x ${formatMultiplier(boostFactor)} = ${formatMultiplier(boostedPerformance)}`}
            currentLabel={t("results.hagicode.currentLabel")}
            boostedLabel={t("results.hagicode.boostedLabel")}
          />
          <ComparisonMetricCard
            label={t("results.hagicode.scaledTokenUsage")}
            before={formatTokenUsage(baseInput.dailyTokenUsageM)}
            after={formatTokenUsage(boostedTokenUsage)}
            delta={formatSignedDelta(boostedTokenUsage - baseInput.dailyTokenUsageM, " M")}
            deltaValue={boostedTokenUsage - baseInput.dailyTokenUsageM}
            deltaMode="negative"
            formula={`${formatTokenUsage(baseInput.dailyTokenUsageM)} x ${formatMultiplier(boostFactor)} ÷ ${formatMultiplier(tokenEfficiencyFactor)} = ${formatTokenUsage(boostedTokenUsage)} (${formatTokenUsage(rawScaledTokenUsage)} ÷ ${formatMultiplier(tokenEfficiencyFactor)})`}
            currentLabel={t("results.hagicode.currentLabel")}
            boostedLabel={t("results.hagicode.boostedLabel")}
          />
          <ComparisonMetricCard
            label={t("results.hagicode.scaledAnnualAiCost")}
            before={formatCny(baseResult.annualAiCostCny)}
            after={formatCny(boostedAnnualAiCost)}
            delta={formatSignedCurrency(annualAiCostDelta)}
            deltaValue={annualAiCostDelta}
            deltaMode="negative"
            formula={`${formatCny(baseResult.annualAiCostCny)} x ${formatMultiplier(boostFactor)} = ${formatCny(boostedAnnualAiCost)}`}
            currentLabel={t("results.hagicode.currentLabel")}
            boostedLabel={t("results.hagicode.boostedLabel")}
          />
          <ComparisonMetricCard
            label={t("results.hagicode.syncResult")}
            before={`${baseSummary.effectivePeopleEquivalentFormatted} / ${baseSummary.costEffectivenessFormatted}`}
            after={`${boostedSummary.effectivePeopleEquivalentFormatted} / ${boostedSummary.costEffectivenessFormatted}`}
            delta={`${formatSignedDelta(threatDelta, " 人")} · ${formatSignedDelta(costEffectivenessDelta, "x")}`}
            deltaValue={threatDelta}
            deltaMode="negative"
            formula={t("results.hagicode.syncFormula", {
              threatBefore: baseSummary.effectivePeopleEquivalentFormatted,
              threatAfter: boostedSummary.effectivePeopleEquivalentFormatted,
              valueBefore: baseSummary.costEffectivenessFormatted,
              valueAfter: boostedSummary.costEffectivenessFormatted,
            })}
            currentLabel={t("results.hagicode.currentLabel")}
            boostedLabel={t("results.hagicode.boostedLabel")}
          />
        </div>

        <div className="mt-5 rounded-[1.5rem] border border-primary/15 bg-primary/6 p-4">
          <p className="text-sm font-semibold text-foreground">{t("results.hagicode.modelLabel")}</p>
          <p className="mt-2 text-xs leading-7 text-muted-foreground">
            {t("results.hagicode.modelFormula", {
              base: formatTokenUsage(baseInput.dailyTokenUsageM),
              boost: formatMultiplier(boostFactor),
              utilization: formatMultiplier(tokenEfficiencyFactor),
              raw: formatTokenUsage(rawScaledTokenUsage),
              final: formatTokenUsage(boostedTokenUsage),
            })}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-[1.5rem] border bg-background/75 p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">{t("results.hagicode.beforeAfterLabel")}</p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {baseSummary.effectivePeopleEquivalentFormatted}
                {" -> "}
                {boostedSummary.effectivePeopleEquivalentFormatted}
              </p>
            </div>
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getDeltaTone(threatDelta)}`}>
              {formatSignedDelta(threatDelta, " 人")}
            </span>
          </div>
          <AgentScaleIndicator
            title={t("results.summary.dangerScale")}
            value={boostedSummary.effectivePeopleEquivalentFormatted}
            badge={boostedSummary.dangerScaleLabel}
            summary={boostedSummary.dangerScaleSummary}
            position={boostedSummary.dangerScalePosition}
            direction="danger"
            ticks={["1.0x", "1.5x", "2.0x", "3.0x"]}
          />
        </div>
        <div className="rounded-[1.5rem] border bg-background/75 p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">{t("results.hagicode.beforeAfterLabel")}</p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {baseSummary.costEffectivenessFormatted}
                {" -> "}
                {boostedSummary.costEffectivenessFormatted}
              </p>
            </div>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${getDeltaTone(costEffectivenessDelta)}`}
            >
              {formatSignedDelta(costEffectivenessDelta, "x")}
            </span>
          </div>
          <AgentScaleIndicator
            title={t("results.summary.costEffectivenessScale")}
            value={boostedSummary.costEffectivenessFormatted}
            badge={boostedSummary.costEffectivenessScaleLabel}
            summary={boostedSummary.costEffectivenessScaleSummary}
            position={boostedSummary.costEffectivenessScalePosition}
            direction="value"
            ticks={["0x", "1x", "2x", "3x+"]}
          />
        </div>
      </div>

      <div className={`mt-6 rounded-[1.5rem] border p-5 ${verdictToneClass}`}>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-current/85">
            {t("results.hagicode.afterBoostLabel")}
          </p>
          <p className="text-lg font-bold">{boostedSummary.verdictHeadline}</p>
          <p className="text-sm leading-7 text-current/90">{boostedSummary.verdictBody}</p>
        </div>
      </div>
    </section>
  )
}
