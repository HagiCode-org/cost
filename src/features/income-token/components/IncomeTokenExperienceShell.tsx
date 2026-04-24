import { useState } from "react"
import { Share2 } from "lucide-react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import { AssessmentLanding } from "@/features/income-token/components/AssessmentLanding"
import { CostFeatureShowcase } from "@/features/home/components/CostFeatureShowcase"
import { HomeHeader } from "@/features/home/components/HomeHeader"
import { HomeFooter } from "@/features/home/components/HomeFooter"
import { PromoteCard } from "@/components/promote/PromoteCard"
import promoteCardStyles from "@/components/promote/PromoteCard.module.css"
import { ComplianceFooterSection } from "@/features/income-token/components/ComplianceFooterSection"
import { getHomePageContent } from "@/features/home/content/home-content"
import { useHomeSEO } from "@/features/home/hooks/use-home-seo"
import { useShareCurrentSite } from "@/hooks/use-share-current-site"
import type { ResultViewModel } from "@/features/income-token/lib/build-result-view-model"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"

export function IncomeTokenExperienceShell() {
  const { t, i18n } = useTranslation()
  const [result, setResult] = useState<ResultViewModel | null>(null)

  useHomeSEO()

  const tone = result?.summarySection.verdictTone ?? "neutral"
  const locale = i18n.resolvedLanguage === "zh-CN" ? "zh-CN" : "en-US"
  const pageContent = getHomePageContent(t, locale)
  const { shareCurrentSite } = useShareCurrentSite()

  function handleFloatingShare() {
    const summary = result?.summarySection
    if (!summary) {
      void shareCurrentSite()
      return
    }
    void shareCurrentSite(summary.shareCopy).then(() => {
      toast.success(t("share.copied"))
    })
  }

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <Toaster />
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none fixed inset-0 z-0 transition-all duration-700",
          tone === "danger" &&
            "bg-[radial-gradient(circle_at_50%_0%,rgba(24,226,153,0.10),transparent_28%),radial-gradient(circle_at_bottom_center,rgba(212,86,86,0.14),transparent_34%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(24,226,153,0.12),transparent_24%),radial-gradient(circle_at_bottom_center,rgba(212,86,86,0.16),transparent_32%)]",
          tone === "warning" &&
            "bg-[radial-gradient(circle_at_50%_0%,rgba(24,226,153,0.10),transparent_28%),radial-gradient(circle_at_bottom_center,rgba(195,125,13,0.12),transparent_34%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(24,226,153,0.12),transparent_24%),radial-gradient(circle_at_bottom_center,rgba(195,125,13,0.14),transparent_32%)]",
          tone === "safe" &&
            "bg-[radial-gradient(circle_at_50%_0%,rgba(24,226,153,0.14),transparent_30%),radial-gradient(circle_at_bottom_center,rgba(24,226,153,0.08),transparent_36%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(24,226,153,0.16),transparent_28%),radial-gradient(circle_at_bottom_center,rgba(24,226,153,0.10),transparent_34%)]"
        )}
      />
      <div className="relative z-10">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-background focus:px-4 focus:py-2 focus:shadow-xl"
      >
        {t("accessibility.skipToContent")}
      </a>
      <HomeHeader />
      <main id="main-content">
        <AssessmentLanding onResultChange={setResult} />
      </main>
      <PromoteCard locale={i18n.resolvedLanguage} className={promoteCardStyles.promoteCard} />
      <CostFeatureShowcase />
      {result ? <ComplianceFooterSection data={result.dataDisclaimer} /> : null}
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
      <button
        type="button"
        onClick={handleFloatingShare}
        className="fixed bottom-5 right-5 z-50 flex size-14 items-center justify-center rounded-full border border-border/80 bg-background text-foreground shadow-[var(--shadow-card)] transition-all active:scale-95 md:hidden"
        aria-label={t("share.currentSiteAria")}
      >
        <Share2 className="size-5" />
      </button>
    </div>
  )
}
