import { useTranslation } from "react-i18next"

import { HomeFooter } from "@/features/home/components/HomeFooter"
import { HomeHeader } from "@/features/home/components/HomeHeader"
import { FormBlueprintSection } from "@/features/home/components/FormBlueprintSection"
import { FutureFeatureSection } from "@/features/home/components/FutureFeatureSection"
import { HeroSection } from "@/features/home/components/HeroSection"
import { MethodologySection } from "@/features/home/components/MethodologySection"
import { StorySection } from "@/features/home/components/StorySection"
import { getHomePageContent } from "@/features/home/content/home-content"
import { useHomeSEO } from "@/features/home/hooks/use-home-seo"
import { useAppSelector } from "@/lib/store"

export function HomePage() {
  const { t } = useTranslation()
  const siteState = useAppSelector((state) => state.site)

  useHomeSEO()

  const content = getHomePageContent(t, siteState)

  return (
    <div className="min-h-screen">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-background focus:px-4 focus:py-2 focus:shadow-xl">
        {t("accessibility.skipToContent")}
      </a>
      <HomeHeader />
      <main id="main-content" className="pb-6">
        <HeroSection {...content.hero} />
        <StorySection cards={content.storyCards} />
        <MethodologySection {...content.methodology} />
        <FormBlueprintSection {...content.formBlueprint} />
        <FutureFeatureSection items={content.futureFeatures} />
      </main>
      <HomeFooter {...content.footer} />
    </div>
  )
}
