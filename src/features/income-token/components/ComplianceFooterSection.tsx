import { useTranslation } from "react-i18next"
import type { ResultViewModel } from "@/features/income-token/lib/build-result-view-model"
import { ShieldCheck } from "lucide-react"

interface ComplianceFooterSectionProps {
  data: ResultViewModel["dataDisclaimer"]
}

export function ComplianceFooterSection({ data }: ComplianceFooterSectionProps) {
  const { t } = useTranslation()

  return (
    <section className="mx-auto max-w-5xl py-6 sm:px-6" aria-labelledby="compliance-heading">
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck className="size-4 text-muted-foreground" aria-hidden="true" />
        <h2 id="compliance-heading" className="text-sm font-semibold text-muted-foreground">
          {t("results.compliance.title")}
        </h2>
      </div>
      <div className="rounded-xl border bg-muted/20 p-4 text-xs leading-relaxed text-muted-foreground space-y-2">
        <p>{t("results.compliance.disclaimer")}</p>
        <p>{t("results.compliance.noCollection")}</p>
        <p>
          {t("results.compliance.pricingUpdated")}: {data.pricingUpdatedAt} | {data.pricingSource}
        </p>
        <div className="border-t pt-3 space-y-2">
          <p className="font-medium text-foreground">{t("results.compliance.referenceTitle")}</p>
          {data.pricingReferences.map((reference) => (
            <div key={reference.providerId} className="space-y-1">
              <a
                href={reference.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
              >
                {reference.providerName}: {reference.sourceLabel}
              </a>
              <p>{reference.sourceNote}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
