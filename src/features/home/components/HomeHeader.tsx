import { forwardRef, useMemo, useState, type ForwardedRef } from "react"
import { ExternalLink, Globe2, Menu, MoonStar, Share2, Sparkles, SunMedium } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { LinkHagicode } from "@/components/link-hagicode"
import { useTheme } from "@/contexts/theme-context"
import { useIsMobile } from "@/hooks/use-mobile"
import { useShareCurrentSite, type ShareState } from "@/hooks/use-share-current-site"
import type { SupportedLanguage } from "@/i18n/config"
import { setLocale, useAppDispatch } from "@/lib/store"
import { formatAppVersion, getAppVersion } from "@/lib/version"

const languages: SupportedLanguage[] = ["zh-CN", "en-US"]

type ProductLink = {
  label: string
  href: string
}

interface MobileHomeHeaderProps {
  headerRef: ForwardedRef<HTMLElement>
  appVersion: string
  currentLanguage: SupportedLanguage
  productLinks: ProductLink[]
  shareLabel: string
  shareState: ShareState
  changeLanguage: (language: SupportedLanguage) => Promise<void>
  shareCurrentSite: () => Promise<void>
  toggleTheme: () => void
  t: ReturnType<typeof useTranslation>["t"]
}

function MobileHomeHeader({
  headerRef,
  appVersion,
  currentLanguage,
  productLinks,
  shareLabel,
  shareState,
  changeLanguage,
  shareCurrentSite,
  toggleTheme,
  t,
}: MobileHomeHeaderProps) {
  const [isNavigationOpen, setIsNavigationOpen] = useState(false)

  return (
    <header ref={headerRef} className="sticky top-0 z-40 border-b border-border/60 bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="glass-panel surface-outline flex size-9 items-center justify-center rounded-2xl bg-primary/12 text-primary">
            <Sparkles className="size-[18px]" aria-hidden="true" />
          </div>
          <p className="display-type truncate text-lg font-semibold">{t("site.name")}</p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <div className="glass-panel surface-outline inline-flex items-center gap-1 rounded-full p-1">
            {languages.map((language) => (
              <Button
                key={language}
                type="button"
                size="sm"
                variant={currentLanguage === language ? "default" : "ghost"}
                className="h-8 rounded-full px-2.5 text-xs"
                onClick={() => void changeLanguage(language)}
                aria-pressed={currentLanguage === language}
              >
                {language === "zh-CN" ? "中" : "EN"}
              </Button>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-9 rounded-full"
            onClick={() => toggleTheme()}
            aria-label={t("header.themeToggle")}
          >
            <SunMedium
              className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
              aria-hidden="true"
            />
            <MoonStar
              className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
              aria-hidden="true"
            />
          </Button>

          <Sheet open={isNavigationOpen} onOpenChange={setIsNavigationOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-9 rounded-full"
                aria-label={t("header.navigationLabel")}
              >
                <Menu className="size-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[min(88vw,22rem)] gap-0 px-0">
            <SheetHeader className="border-b border-border/60 px-6 py-5">
              <div className="flex items-start gap-3">
                <div className="glass-panel surface-outline flex size-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                  <Sparkles className="size-5" aria-hidden="true" />
                </div>
                <div className="min-w-0 space-y-2">
                  <SheetTitle className="display-type text-xl font-semibold">{t("site.name")}</SheetTitle>
                  <div className="space-y-2">
                    <SheetDescription>{t("site.tagline")}</SheetDescription>
                    <span className="inline-flex rounded-full border border-border/70 bg-background/70 px-2.5 py-1 font-mono text-[11px] font-medium text-muted-foreground">
                      {t("header.versionLabel")} {appVersion}
                    </span>
                  </div>
                </div>
              </div>
            </SheetHeader>

            <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 py-6">
              <section className="space-y-3">
                <p className="text-xs font-medium text-muted-foreground">
                  <LinkHagicode>{t("header.poweredBy")}</LinkHagicode>
                </p>
                <div className="flex flex-wrap gap-2">
                  {productLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/80 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                      <ExternalLink className="size-3.5" aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </section>

              <section className="space-y-3">
                <Button
                  type="button"
                  variant={shareState === "error" ? "destructive" : "outline"}
                  className="w-full justify-center rounded-full"
                  onClick={() => void shareCurrentSite()}
                  aria-label={t("header.shareAria")}
                >
                  <Share2 className="size-4" aria-hidden="true" />
                  {shareLabel}
                </Button>
              </section>
            </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

export const HomeHeader = forwardRef<HTMLElement>(function HomeHeader(_, ref) {
  const { i18n, t } = useTranslation()
  const { theme, setTheme } = useTheme()
  const dispatch = useAppDispatch()
  const isMobile = useIsMobile()
  const appVersion = formatAppVersion(getAppVersion())
  const { shareState, shareCurrentSite } = useShareCurrentSite()

  const currentLanguage = (i18n.resolvedLanguage || "zh-CN") as SupportedLanguage
  const productLinks = useMemo<ProductLink[]>(
    () => [
      {
        label: t("header.links.official"),
        href: "https://hagicode.com/",
      },
      {
        label: t("header.links.currentRepo"),
        href: "https://github.com/HagiCode-org/cost",
      },
      {
        label: t("header.links.siteRepo"),
        href: "https://github.com/HagiCode-org/site",
      },
    ],
    [t],
  )

  async function changeLanguage(language: SupportedLanguage) {
    dispatch(setLocale(language))
    await i18n.changeLanguage(language)
  }

  function toggleTheme() {
    setTheme(theme === "light" ? "dark" : "light")
  }

  const shareLabel =
    shareState === "copied"
      ? t("header.shareCopied")
      : shareState === "error"
        ? t("header.shareFailed")
        : t("header.share")

  if (isMobile) {
    return (
      <MobileHomeHeader
        headerRef={ref}
        appVersion={appVersion}
        currentLanguage={currentLanguage}
        productLinks={productLinks}
        shareLabel={shareLabel}
        shareState={shareState}
        changeLanguage={changeLanguage}
        shareCurrentSite={shareCurrentSite}
        toggleTheme={toggleTheme}
        t={t}
      />
    )
  }

  return (
    <header ref={ref} className="sticky top-0 z-40 border-b border-border/60 bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className="glass-panel surface-outline flex size-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
              <Sparkles className="size-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 space-y-2">
              <p className="display-type text-xl font-semibold">{t("site.name")}</p>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm text-muted-foreground">{t("site.tagline")}</p>
                <span className="rounded-full border border-border/70 bg-background/70 px-2.5 py-1 font-mono text-[11px] font-medium text-muted-foreground">
                  {t("header.versionLabel")} {appVersion}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  <LinkHagicode>{t("header.poweredBy")}</LinkHagicode>
                </span>
                {productLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/80 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                    <ExternalLink className="size-3.5" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant={shareState === "error" ? "destructive" : "outline"}
              className="rounded-full px-4"
              onClick={() => void shareCurrentSite()}
              aria-label={t("header.shareAria")}
            >
              <Share2 className="size-4" aria-hidden="true" />
              {shareLabel}
            </Button>
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
              onClick={() => toggleTheme()}
              aria-label={t("header.themeToggle")}
            >
              <SunMedium className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" aria-hidden="true" />
              <MoonStar className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
})
