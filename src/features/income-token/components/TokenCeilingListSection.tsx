import { ChevronDown, DollarSign } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { ResultViewModel } from "@/features/income-token/lib/build-result-view-model"

interface TokenCeilingListSectionProps {
  data: ResultViewModel["tokenListSection"]
}

export function TokenCeilingListSection({ data }: TokenCeilingListSectionProps) {
  const { t } = useTranslation()

  return (
    <section className="glass-panel surface-outline mx-auto min-w-0 w-full max-w-7xl rounded-[1.5rem] p-5 sm:rounded-[2rem] sm:p-8" aria-labelledby="token-list-heading">
      <div className="mb-6 flex items-start gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/12 text-primary">
          <DollarSign className="size-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="mono-label text-primary">{t("results.cost.totalTokens")}</p>
          <h2 id="token-list-heading" className="mt-2 display-type text-3xl sm:text-4xl">
            {t("results.tokenList.title")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("results.tokenList.subtitle", { annualTotalCost: data.annualTotalCostFormatted })}
          </p>
        </div>
      </div>

      <Collapsible defaultOpen={false} className="space-y-4">
        <CollapsibleTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="group w-full justify-between rounded-[1.25rem] border-border/80 bg-background px-4 py-5 text-left"
            aria-controls="token-ceiling-list-content"
          >
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-foreground">{t("results.tokenList.title")}</span>
              <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                {t("results.tokenList.subtitle", { annualTotalCost: data.annualTotalCostFormatted })}
              </span>
            </span>
            <ChevronDown
              className="ml-3 size-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
              aria-hidden="true"
            />
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent id="token-ceiling-list-content" className="space-y-4">
          {data.pricingProviders.map((provider) => (
            <div key={provider.providerId} className="space-y-3 rounded-[1.5rem] border border-border/80 bg-muted/35 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">{provider.providerName}</p>
                  <p className="text-xs text-muted-foreground">{provider.sourceNote}</p>
                  <p className="text-xs text-muted-foreground">{t("results.cost.officialSource")}: {provider.sourceLabel}</p>
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
                  <div key={model.modelId} className="space-y-3 rounded-[1.25rem] border border-border/80 bg-background p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="font-medium">{model.modelName}</p>
                        <p className="text-xs text-muted-foreground">{model.modelDescription}</p>
                        {model.pricingContext ? (
                          <p className="text-xs md:text-[11px] text-muted-foreground">
                            {t("results.cost.pricingContext")}: {model.pricingContext}
                          </p>
                        ) : null}
                        <p className="text-xs md:text-[11px] text-muted-foreground">
                          {model.sourceLabel} · {model.availabilityStatus} · {model.sourceSyncedAt}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="display-type text-lg font-bold">{model.totalTokensFormatted}</p>
                        <p className="text-xs text-muted-foreground">{t("results.cost.totalTokens")}</p>
                        <p className="mt-1 text-xs md:text-[11px] text-muted-foreground">
                          {t("results.cost.workdayAverage", {
                            days: data.workingDaysPerYear,
                            tokens: model.averageWorkdayTokensFormatted,
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1 rounded-xl bg-muted/45 p-3 text-xs md:text-[11px] text-muted-foreground">
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
                        <p className="border-t pt-2 text-xs md:text-[11px] leading-relaxed">
                          {t("results.cost.priceNote")}: {model.pricingNote}
                        </p>
                      ) : null}
                    </div>

                    <div className="space-y-1 border-t pt-2 text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <span>{t("results.cost.pureInput")}</span>
                        <span className="font-mono text-foreground">{model.inputTokensFormatted}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t("results.cost.pureOutput")}</span>
                        <span className="font-mono text-foreground">{model.outputTokensFormatted}</span>
                      </div>
                      <div className="mt-1 flex justify-between border-t pt-1 font-medium">
                        <span>{t("results.cost.mixDetail", { ratio: data.inputOutputRatio })}</span>
                        <span className="font-mono">{model.totalTokensFormatted}</span>
                      </div>
                        <div className="flex justify-between gap-3">
                          <div className="pl-4">
                            <p>{t("results.cost.mixInput")}</p>
                            <p className="mt-0.5 break-all font-mono text-xs md:text-[10px] text-muted-foreground/90">
                              {model.mixInputFormula}
                            </p>
                          </div>
                          <span className="font-mono">{model.inputTokensInMixFormatted}</span>
                        </div>
                        <div className="flex items-start justify-between gap-3 text-xs md:text-[11px]">
                          <div className="pl-4">
                            <p>{t("results.cost.mixOutput")}</p>
                            <p className="mt-0.5 break-all font-mono text-xs md:text-[10px] text-muted-foreground/90">
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
        </CollapsibleContent>
      </Collapsible>
    </section>
  )
}
