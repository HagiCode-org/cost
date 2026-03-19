import { Separator } from "@/components/ui/separator"

interface HomeFooterProps {
  disclaimerTitle: string
  disclaimer: string
  extensionNote: string
  copyright: string
}

export function HomeFooter(props: HomeFooterProps) {
  return (
    <footer className="px-4 pb-10 pt-4 sm:px-6 lg:px-8">
      <div className="glass-panel surface-outline mx-auto max-w-7xl rounded-[2rem] px-6 py-6 sm:px-8">
        <div className="grid gap-5 md:grid-cols-[1.2fr_0.8fr] md:items-start">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">{props.disclaimerTitle}</p>
            <p className="text-sm leading-7 text-muted-foreground">{props.disclaimer}</p>
          </div>
          <div className="space-y-3 text-sm leading-7 text-muted-foreground">
            <p>{props.extensionNote}</p>
          </div>
        </div>
        <Separator className="my-5" />
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{props.copyright}</p>
      </div>
    </footer>
  )
}
