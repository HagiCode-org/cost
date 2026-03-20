import { Calculator, Coins } from "lucide-react"
import { useTranslation } from "react-i18next"

import type { ResultViewModel } from "@/features/income-token/lib/build-result-view-model"

interface CostImpactSectionProps {
  data: ResultViewModel["costSection"]
}

export function CostImpactSection({ data }: CostImpactSectionProps) {
  const { t } = useTranslation()

  return (
    <section
      className="glass-panel surface-outline mx-auto max-w-5xl rounded-[2rem] p-6 sm:p-8"
      aria-labelledby="cost-heading"
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/12 text-primary">
          <Calculator className="size-5" aria-hidden="true" />
        </div>
        <div>
          <h2 id="cost-heading" className="display-type text-xl font-bold sm:text-2xl">
            {t("results.cost.title")}
          </h2>
          <p className="text-sm text-muted-foreground">{t("results.cost.subtitle")}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-2xl border bg-background/70 p-5">
          <div className="mb-4 rounded-xl bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground">{t("results.cost.annualTotalCost")}</p>
            <p className="mt-1 display-type text-2xl font-bold">¥{data.annualTotalCostFormatted}</p>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {data.providerName} · {data.modelName}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{data.modelDescription}</p>
              {data.pricingContext ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  {t("results.cost.pricingContext")}: {data.pricingContext}
                </p>
              ) : null}
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Coins className="size-5" aria-hidden="true" />
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-muted/40 p-4">
              <p className="text-xs text-muted-foreground">{t("results.cost.unitInputPrice")}</p>
              <p className="mt-1 font-mono text-lg font-semibold">{data.inputPriceFormatted}</p>
            </div>
            <div className="rounded-xl bg-muted/40 p-4">
              <p className="text-xs text-muted-foreground">{t("results.cost.unitOutputPrice")}</p>
              <p className="mt-1 font-mono text-lg font-semibold">{data.outputPriceFormatted}</p>
            </div>
            <div className="rounded-xl bg-muted/40 p-4">
              <p className="text-xs text-muted-foreground">{t("results.cost.mixedPrice")}</p>
              <p className="mt-1 font-mono text-lg font-semibold">{data.mixedPriceFormatted}</p>
              <p className="mt-2 break-all font-mono text-[11px] text-muted-foreground">
                {data.mixedPriceFormula}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {data.mixedPriceExplanation}
              </p>
            </div>
            <div className="rounded-xl bg-muted/40 p-4">
              <p className="text-xs text-muted-foreground">{t("results.cost.dailyTokenUsage")}</p>
              <p className="mt-1 font-mono text-lg font-semibold">{data.dailyTokenUsageFormatted}</p>
            </div>
          </div>

          <div className="mt-5 space-y-3 rounded-2xl border bg-muted/15 p-4 text-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="font-medium">{t("results.cost.dailyAiCost")}</p>
                <p className="mt-1 break-all font-mono text-[11px] text-muted-foreground">
                  {data.dailyAiCostFormula}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {data.dailyAiCostExplanation}
                </p>
              </div>
              <p className="font-mono text-base font-semibold">{data.dailyAiCostFormatted}</p>
            </div>
            <div className="flex items-start justify-between gap-4 border-t pt-3">
              <div className="flex-1">
                <p className="font-medium">{t("results.cost.annualAiCost")}</p>
                <p className="mt-1 break-all font-mono text-[11px] text-muted-foreground">
                  {data.annualAiCostFormula}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {data.annualAiCostExplanation}
                </p>
              </div>
              <p className="font-mono text-base font-semibold">{data.annualAiCostFormatted}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border bg-background/70 p-5">
          <div>
            <p className="text-sm font-semibold">{t("results.cost.budgetTokenTitle")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("results.cost.budgetTokenDesc")}</p>
          </div>

          <div className="rounded-xl bg-muted/40 p-4">
            <p className="text-xs text-muted-foreground">{t("results.cost.totalTokens")}</p>
            <p className="mt-1 display-type text-2xl font-bold">{data.fullBudgetTotalTokensFormatted}</p>
          </div>

          <div className="rounded-xl bg-muted/40 p-4">
            <p className="text-xs text-muted-foreground">{t("results.cost.workdayTokenAverage")}</p>
            <p className="mt-1 display-type text-2xl font-bold">{data.fullBudgetWorkdayTokensFormatted}</p>
            <p className="mt-2 break-all font-mono text-[11px] text-muted-foreground">
              {data.workdayAverageFormula}
            </p>
          </div>

          <div className="rounded-xl border border-dashed p-4 text-xs leading-relaxed text-muted-foreground">
            <a
              href={data.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {t("results.cost.officialSource")}: {data.sourceLabel}
            </a>
            <p className="mt-2">{data.sourceNote}</p>
            {data.pricingNote ? (
              <p className="mt-2">
                {t("results.cost.priceNote")}: {data.pricingNote}
              </p>
            ) : null}
            <p className="mt-2">{t("results.cost.annualTokenUsage")}: {data.annualTokenUsageFormatted}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
