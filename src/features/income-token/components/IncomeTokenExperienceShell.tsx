import { useState } from "react"
import { useTranslation } from "react-i18next"

import { AssessmentLanding } from "@/features/income-token/components/AssessmentLanding"
import { CostFeatureShowcase } from "@/features/home/components/CostFeatureShowcase"
import { HomeFooter } from "@/features/home/components/HomeFooter"
import { getHomePageContent } from "@/features/home/content/home-content"
import { useHomeSEO } from "@/features/home/hooks/use-home-seo"
import type { ResultViewModel } from "@/features/income-token/lib/build-result-view-model"
import { cn } from "@/lib/utils"

export function IncomeTokenExperienceShell() {
  const { t } = useTranslation()
  const [result, setResult] = useState<ResultViewModel | null>(null)

  useHomeSEO()

  const tone = result?.summarySection.verdictTone ?? "neutral"
  const pageContent = getHomePageContent(t)

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none fixed inset-0 z-0 transition-all duration-700",
          tone === "danger" &&
            "bg-[radial-gradient(circle_at_bottom_center,rgba(239,68,68,0.16),transparent_38%),radial-gradient(circle_at_top_right,rgba(249,115,22,0.14),transparent_24%)] dark:bg-[radial-gradient(circle_at_bottom_center,rgba(248,113,113,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(251,146,60,0.12),transparent_22%)]",
          tone === "warning" &&
            "bg-[radial-gradient(circle_at_bottom_center,rgba(245,158,11,0.16),transparent_38%),radial-gradient(circle_at_top_left,rgba(251,191,36,0.12),transparent_24%)] dark:bg-[radial-gradient(circle_at_bottom_center,rgba(245,158,11,0.18),transparent_34%),radial-gradient(circle_at_top_left,rgba(250,204,21,0.12),transparent_22%)]",
          tone === "safe" &&
            "bg-[radial-gradient(circle_at_bottom_center,rgba(16,185,129,0.12),transparent_38%),radial-gradient(circle_at_top_left,rgba(56,189,248,0.10),transparent_22%)] dark:bg-[radial-gradient(circle_at_bottom_center,rgba(16,185,129,0.16),transparent_34%),radial-gradient(circle_at_top_left,rgba(14,165,233,0.12),transparent_24%)]"
        )}
      />
      <div className="relative z-10">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-background focus:px-4 focus:py-2 focus:shadow-xl"
      >
        {t("accessibility.skipToContent")}
      </a>
      <main id="main-content">
        <AssessmentLanding onResultChange={setResult} />
      </main>
      <CostFeatureShowcase />
      <HomeFooter
        disclaimerTitle={pageContent.footer.disclaimerTitle}
        disclaimer={pageContent.footer.disclaimer}
        extensionNote={pageContent.footer.extensionNote}
        registrationLabel={pageContent.footer.registrationLabel}
        registrationItems={pageContent.footer.registrationItems}
        linksTitle={pageContent.footer.linksTitle}
        links={pageContent.footer.links}
        copyright={pageContent.footer.copyright}
      />
      </div>
    </div>
  )
}
