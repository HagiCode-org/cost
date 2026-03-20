import { forwardRef } from "react"

import { Separator } from "@/components/ui/separator"

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
    href: string
  }>
  copyright: string
}

export const HomeFooter = forwardRef<HTMLElement, HomeFooterProps>(function HomeFooter(props, ref) {
  return (
    <footer ref={ref} className="px-4 pb-10 pt-4 sm:px-6 lg:px-8">
      <div className="glass-panel surface-outline mx-auto max-w-7xl rounded-[2rem] px-6 py-6 sm:px-8">
        <div className="grid gap-6 md:grid-cols-[1.15fr_0.85fr] md:items-start">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">{props.disclaimerTitle}</p>
            <p className="text-sm leading-7 text-muted-foreground">{props.disclaimer}</p>
            <p className="text-sm leading-7 text-muted-foreground">{props.extensionNote}</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-3 text-sm leading-7 text-muted-foreground">
              <p className="font-semibold text-foreground">{props.registrationLabel}</p>
              <div className="flex flex-col gap-1.5">
                {props.registrationItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={item.ariaLabel}
                    className="underline-offset-4 transition-colors hover:text-foreground hover:underline"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
            <div className="space-y-3 text-sm leading-7 text-muted-foreground">
              <p className="font-semibold text-foreground">{props.linksTitle}</p>
              <div className="flex flex-col gap-1.5">
                {props.links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="underline-offset-4 transition-colors hover:text-foreground hover:underline"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Separator className="my-5" />
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{props.copyright}</p>
      </div>
    </footer>
  )
})
