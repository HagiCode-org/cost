import { forwardRef } from "react"

import { Separator } from "@/components/ui/separator"
import { LinkHagicode } from "@/components/link-hagicode"

interface HomeFooterProps {
  disclaimerTitle: string
  disclaimer: string
  extensionNote: string
  registrationLabel: string
  registrationItems: Array<{
    label: string
    href: string
    ariaLabel?: string
  }>
  linksTitle: string
  links: Array<{
    label: string
    description?: string
    href: string
  }>
  copyright: string
}

export const HomeFooter = forwardRef<HTMLElement, HomeFooterProps>(function HomeFooter(props, ref) {
  return (
    <footer ref={ref} className="px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-[1.5rem] border border-border/80 bg-background px-6 py-8 shadow-[var(--shadow-card)] sm:px-8">
        <div className="grid gap-8 md:grid-cols-[1.12fr_0.88fr] md:items-start">
          <div className="space-y-4">
            <p className="mono-label text-primary">{props.disclaimerTitle}</p>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground">{props.disclaimer}</p>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground">{props.extensionNote}</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-3 text-sm leading-7 text-muted-foreground">
              <p className="display-type text-base text-foreground">{props.registrationLabel}</p>
              <div className="flex flex-col gap-1.5">
                {props.registrationItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={item.ariaLabel}
                    className="underline-offset-4 transition-colors hover:text-primary hover:underline"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
            <div className="space-y-3 text-sm leading-7 text-muted-foreground">
              <p className="display-type text-base text-foreground">{props.linksTitle}</p>
              <div className="flex flex-col gap-1.5">
                {props.links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col items-start gap-1 rounded-2xl border border-transparent px-3 py-3 text-left underline-offset-4 transition-colors hover:border-border/80 hover:text-primary hover:underline"
                  >
                    <span className="font-medium text-foreground">{link.label}</span>
                    {link.description ? (
                      <span className="text-xs leading-5 text-muted-foreground">{link.description}</span>
                    ) : null}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Separator className="my-6 bg-border/80" />
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          <LinkHagicode>{props.copyright}</LinkHagicode>
        </p>
      </div>
    </footer>
  )
})
