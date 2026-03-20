import { DollarSign } from "lucide-react"
import { useTranslation } from "react-i18next"

import type { ResultViewModel } from "@/features/income-token/lib/build-result-view-model"

interface TokenCeilingListSectionProps {
  data: ResultViewModel["tokenListSection"]
}

export function TokenCeilingListSection({ data }: TokenCeilingListSectionProps) {
  const { t } = useTranslation()

  return (
    <section className="glass-panel surface-outline mx-auto max-w-5xl rounded-[2rem] p-6 sm:p-8" aria-labelledby="token-list-heading">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/12 text-primary">
          <DollarSign className="size-5" aria-hidden="true" />
        </div>
        <div>
          <h2 id="token-list-heading" className="display-type text-xl font-bold sm:text-2xl">
            {t("results.tokenList.title")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("results.tokenList.subtitle", { annualTotalCost: data.annualTotalCostFormatted })}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {data.pricingProviders.map((provider) => (
          <div key={provider.providerId} className="space-y-3 rounded-2xl border bg-muted/15 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">{provider.providerName}</p>
                <p className="text-xs text-muted-foreground">{provider.sourceNote}</p>
              </div>
              <a
                href={provider.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium text-primary underline-offset-4 hover:underline"
              >
                {t("results.cost.officialSource")}: {provider.sourceLabel}
              </a>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {provider.models.map((model) => (
                <div key={model.modelId} className="rounded-xl border bg-background/80 p-4 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="font-medium">{model.modelName}</p>
                      <p className="text-xs text-muted-foreground">{model.modelDescription}</p>
                      {model.pricingContext ? (
                        <p className="text-[11px] text-muted-foreground">
                          {t("results.cost.pricingContext")}: {model.pricingContext}
                        </p>
                      ) : null}
                    </div>
                    <div className="text-right">
                      <p className="display-type text-lg font-bold">{model.totalTokensFormatted}</p>
                      <p className="text-xs text-muted-foreground">{t("results.cost.totalTokens")}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {t("results.cost.workdayAverage", {
                          days: data.workingDaysPerYear,
                          tokens: model.averageWorkdayTokensFormatted,
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg bg-muted/40 p-3 text-[11px] text-muted-foreground space-y-1">
                    <div className="flex justify-between gap-3">
                      <span>{t("results.cost.unitInputPrice")}</span>
                      <span className="font-mono text-foreground">{model.inputPriceFormatted}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span>{t("results.cost.unitOutputPrice")}</span>
                      <span className="font-mono text-foreground">{model.outputPriceFormatted}</span>
                    </div>
                    {model.cacheReadPriceFormatted && model.cacheWritePriceFormatted ? (
                      <>
                        <div className="flex justify-between gap-3">
                          <span>{t("results.cost.cacheReadPrice")}</span>
                          <span className="font-mono text-foreground">{model.cacheReadPriceFormatted}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span>{t("results.cost.cacheWritePrice")}</span>
                          <span className="font-mono text-foreground">{model.cacheWritePriceFormatted}</span>
                        </div>
                      </>
                    ) : null}
                    {model.pricingNote ? (
                      <p className="border-t pt-2 text-[11px] leading-relaxed">
                        {t("results.cost.priceNote")}: {model.pricingNote}
                      </p>
                    ) : null}
                  </div>

                  <div className="border-t pt-2 space-y-1 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>{t("results.cost.pureInput")}</span>
                      <span className="font-mono text-foreground">{model.inputTokensFormatted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("results.cost.pureOutput")}</span>
                      <span className="font-mono text-foreground">{model.outputTokensFormatted}</span>
                    </div>
                    <div className="border-t pt-1 mt-1 flex justify-between font-medium">
                      <span>{t("results.cost.mixDetail", { ratio: data.inputOutputRatio })}</span>
                      <span className="font-mono">{model.totalTokensFormatted}</span>
                    </div>
                    <div className="flex items-start justify-between gap-3 text-[11px]">
                      <div className="pl-4">
                        <p>{t("results.cost.mixInput")}</p>
                        <p className="mt-0.5 break-all font-mono text-[10px] text-muted-foreground/90">
                          {model.mixInputFormula}
                        </p>
                      </div>
                      <span className="font-mono">{model.inputTokensInMixFormatted}</span>
                    </div>
                    <div className="flex items-start justify-between gap-3 text-[11px]">
                      <div className="pl-4">
                        <p>{t("results.cost.mixOutput")}</p>
                        <p className="mt-0.5 break-all font-mono text-[10px] text-muted-foreground/90">
                          {model.mixOutputFormula}
                        </p>
                      </div>
                      <span className="font-mono">{model.outputTokensInMixFormatted}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
