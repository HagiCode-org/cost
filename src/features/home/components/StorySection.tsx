import { Card, CardContent } from "@/components/ui/card"
import { useTranslation } from "react-i18next"

interface StorySectionProps {
  cards: Array<{ eyebrow: string; title: string; description: string }>
}

export function StorySection({ cards }: StorySectionProps) {
  const { t } = useTranslation()

  return (
    <section id="story" aria-labelledby="story-title" className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-3 lg:max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-primary">{t("story.sectionEyebrow")}</p>
          <h2 id="story-title" className="display-type text-4xl font-semibold sm:text-5xl">
            {t("story.sectionTitle")}
          </h2>
          <p className="max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
            {t("story.sectionDescription")}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {cards.map((card) => (
            <Card key={card.title} className="glass-panel surface-outline rounded-[1.75rem]">
              <CardContent className="space-y-3 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">{card.eyebrow}</p>
                <h3 className="text-xl font-semibold leading-tight">{card.title}</h3>
                <p className="text-sm leading-7 text-muted-foreground">{card.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
