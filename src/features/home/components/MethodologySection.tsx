import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useTranslation } from "react-i18next"

interface MethodologySectionProps {
  title: string
  description: string
  note: string
  pillars: Array<{ title: string; description: string }>
}

export function MethodologySection({ title, description, note, pillars }: MethodologySectionProps) {
  const { t } = useTranslation()

  return (
    <section id="methodology" aria-labelledby="methodology-title" className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.9fr)]">
        <Card className="glass-panel surface-outline rounded-[2rem]">
          <CardContent className="space-y-5 p-6 sm:p-8">
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em] text-primary">
              {t("methodology.badge")}
            </Badge>
            <div className="space-y-3">
              <h2 id="methodology-title" className="display-type text-4xl font-semibold sm:text-5xl">
                {title}
              </h2>
              <p className="text-base leading-8 text-muted-foreground sm:text-lg">{description}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {pillars.map((pillar) => (
                <div key={pillar.title} className="rounded-[1.5rem] border border-border/70 bg-background/70 p-4">
                  <p className="text-sm font-semibold text-foreground">{pillar.title}</p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{pillar.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel surface-outline rounded-[2rem] bg-primary/8">
          <CardContent className="flex h-full flex-col justify-between gap-6 p-6 sm:p-8">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">{t("methodology.noteEyebrow")}</p>
              <p className="display-type text-3xl font-semibold leading-tight">{note}</p>
            </div>
            <div className="rounded-[1.5rem] border border-border/70 bg-background/75 p-5 text-sm leading-7 text-muted-foreground">
              <p>{t("methodology.nextItems.0")}</p>
              <p>{t("methodology.nextItems.1")}</p>
              <p>{t("methodology.nextItems.2")}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
