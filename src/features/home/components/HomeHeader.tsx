import { Globe2, MoonStar, Sparkles, SunMedium } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/contexts/theme-context"
import type { SupportedLanguage } from "@/i18n/config"
import { setLocale, useAppDispatch } from "@/lib/store"

const languages: SupportedLanguage[] = ["zh-CN", "en-US"]

export function HomeHeader() {
  const { i18n, t } = useTranslation()
  const { theme, setTheme } = useTheme()
  const dispatch = useAppDispatch()

  const currentLanguage = (i18n.resolvedLanguage || "zh-CN") as SupportedLanguage

  async function changeLanguage(language: SupportedLanguage) {
    dispatch(setLocale(language))
    await i18n.changeLanguage(language)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="glass-panel surface-outline flex size-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
              <Sparkles className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="display-type text-xl font-semibold">{t("site.name")}</p>
              <p className="text-sm text-muted-foreground">{t("site.tagline")}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium">
              {t("header.badge")}
            </Badge>
            <div className="glass-panel surface-outline inline-flex items-center gap-1 rounded-full p-1">
              {languages.map((language) => (
                <Button
                  key={language}
                  type="button"
                  size="sm"
                  variant={currentLanguage === language ? "default" : "ghost"}
                  className="rounded-full"
                  onClick={() => void changeLanguage(language)}
                  aria-pressed={currentLanguage === language}
                >
                  <Globe2 className="size-3.5" aria-hidden="true" />
                  {language === "zh-CN" ? "中文" : "EN"}
                </Button>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              aria-label={t("header.themeToggle")}
            >
              <SunMedium className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" aria-hidden="true" />
              <MoonStar className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" aria-hidden="true" />
            </Button>
          </div>
        </div>

        <nav aria-label={t("header.navigationLabel")} className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          <a className="rounded-full px-3 py-2 transition hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href="#story">
            {t("nav.story")}
          </a>
          <a className="rounded-full px-3 py-2 transition hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href="#methodology">
            {t("nav.methodology")}
          </a>
          <a className="rounded-full px-3 py-2 transition hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href="#blueprint">
            {t("nav.blueprint")}
          </a>
          <a className="rounded-full px-3 py-2 transition hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href="#roadmap">
            {t("nav.roadmap")}
          </a>
        </nav>
      </div>
    </header>
  )
}
