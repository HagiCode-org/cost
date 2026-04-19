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

function BrandMark({ compact = false, name, tagline }: { compact?: boolean; name: string; tagline: string }) {
  return (
    <div className={compact ? "flex items-center gap-2.5" : "flex items-center gap-3"}>
      <div className="flex size-10 items-center justify-center rounded-2xl border border-border/80 bg-accent/55 text-primary shadow-[var(--shadow-soft)]">
        <Sparkles className="size-4" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className={compact ? "display-type truncate text-base" : "display-type truncate text-lg"}>{name}</p>
        {!compact ? <p className="mt-1 text-sm text-muted-foreground">{tagline}</p> : null}
      </div>
    </div>
  )
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
    <header ref={headerRef} className="sticky top-0 z-40 border-b border-border/80 bg-background/92 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <BrandMark compact name={t("site.name")} tagline={t("site.tagline")} />

        <div className="flex shrink-0 items-center gap-2">
          <div className="inline-flex items-center rounded-full border border-border/80 bg-background p-1 shadow-[var(--shadow-button)]">
            {languages.map((language) => (
              <Button
                key={language}
                type="button"
                size="sm"
                variant={currentLanguage === language ? "default" : "ghost"}
                className="h-8 min-w-10 px-2.5"
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
            size="icon-sm"
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
                size="icon-sm"
                aria-label={t("header.navigationLabel")}
              >
                <Menu className="size-[18px]" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[min(88vw,22rem)] gap-0 border-r border-border/80 bg-background px-0">
              <SheetHeader className="border-b border-border/80 px-6 py-5 text-left">
                <div className="space-y-4">
                  <BrandMark name={t("site.name")} tagline={t("site.tagline")} />
                  <div className="space-y-2">
                    <SheetTitle className="sr-only">{t("header.navigationLabel")}</SheetTitle>
                    <SheetDescription>{t("site.tagline")}</SheetDescription>
                    <span className="inline-flex rounded-full border border-border/80 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                      {`${t("header.versionLabel")} ${appVersion}`}
                    </span>
                  </div>
                </div>
              </SheetHeader>

              <div className="flex flex-1 flex-col gap-8 overflow-y-auto px-6 py-6">
                <section className="space-y-3">
                  <p className="mono-label text-muted-foreground">
                    <LinkHagicode>{t("header.poweredBy")}</LinkHagicode>
                  </p>
                  <div className="flex flex-col gap-2">
                    {productLinks.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between rounded-2xl border border-border/80 bg-background px-4 py-3 text-sm text-foreground shadow-[var(--shadow-soft)] transition-colors hover:text-primary"
                      >
                        <span>{link.label}</span>
                        <ExternalLink className="size-4" aria-hidden="true" />
                      </a>
                    ))}
                  </div>
                </section>

                <section className="space-y-3">
                  <p className="mono-label text-muted-foreground">{t("header.share")}</p>
                  <Button
                    type="button"
                    variant={shareState === "error" ? "destructive" : "outline"}
                    className="w-full justify-center"
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
        label: t("header.links.docs"),
        href: "https://docs.hagicode.com/",
      },
      {
        label: t("header.links.builder"),
        href: "https://builder.hagicode.com/",
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
    <header ref={ref} className="sticky top-0 z-40 border-b border-border/80 bg-background/92 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <BrandMark name={t("site.name")} tagline={t("site.tagline")} />
          <span className="hidden rounded-full border border-border/80 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground lg:inline-flex">
            {`${t("header.versionLabel")} ${appVersion}`}
          </span>
        </div>

        <nav className="hidden items-center gap-2 xl:flex" aria-label={t("header.navigationLabel")}>
          {productLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background px-4 py-2 text-sm text-muted-foreground shadow-[var(--shadow-button)] transition-colors hover:text-primary"
            >
              <span>{link.label}</span>
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={shareState === "error" ? "destructive" : "outline"}
            className="px-4"
            onClick={() => void shareCurrentSite()}
            aria-label={t("header.shareAria")}
          >
            <Share2 className="size-4" aria-hidden="true" />
            {shareLabel}
          </Button>

          <div className="inline-flex items-center rounded-full border border-border/80 bg-background p-1 shadow-[var(--shadow-button)]">
            {languages.map((language) => (
              <Button
                key={language}
                type="button"
                size="sm"
                variant={currentLanguage === language ? "default" : "ghost"}
                className="h-8 px-3"
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
            onClick={() => toggleTheme()}
            aria-label={t("header.themeToggle")}
          >
            <SunMedium className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" aria-hidden="true" />
            <MoonStar className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </header>
  )
})
