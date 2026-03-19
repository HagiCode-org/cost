import { ArrowUpRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useTranslation } from "react-i18next"

interface FutureFeatureSectionProps {
  items: Array<{
    id: string
    title: string
    description: string
    status: string
  }>
}

export function FutureFeatureSection({ items }: FutureFeatureSectionProps) {
  const { t } = useTranslation()

  return (
    <section id="roadmap" aria-labelledby="roadmap-title" className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-3 lg:max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-primary">{t("futureFeatures.sectionEyebrow")}</p>
          <h2 id="roadmap-title" className="display-type text-4xl font-semibold sm:text-5xl">
            {t("futureFeatures.sectionTitle")}
          </h2>
          <p className="text-base leading-8 text-muted-foreground sm:text-lg">
            {t("futureFeatures.sectionDescription")}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <Card key={item.id} className="glass-panel surface-outline rounded-[1.75rem]">
              <CardContent className="flex h-full flex-col gap-5 p-6">
                <div className="flex items-center justify-between gap-3">
                  <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em] text-primary">
                    {item.status}
                  </Badge>
                  <ArrowUpRight className="size-4 text-muted-foreground" aria-hidden="true" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold leading-tight">{item.title}</h3>
                  <p className="text-sm leading-7 text-muted-foreground">{item.description}</p>
                </div>
                <Button type="button" variant="outline" className="mt-auto justify-start rounded-full" disabled>
                  {t("futureFeatures.cta")}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
