import { ArrowRight, Compass, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface HeroSectionProps {
  eyebrow: string
  title: string
  description: string
  primaryCta: string
  secondaryCta: string
  statCards: Array<{ title: string; description: string }>
}

export function HeroSection(props: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden px-4 pb-8 pt-10 sm:px-6 lg:px-8 lg:pb-12 lg:pt-16">
      <div className="hero-orb -left-20 top-12 size-52 bg-sky-300/40" />
      <div className="hero-orb right-0 top-4 size-44 bg-orange-300/35" />
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:items-end">
        <div className="glass-panel surface-outline relative overflow-hidden rounded-[2rem] px-6 py-8 sm:px-8 lg:px-10 lg:py-12">
          <div className="editorial-grid absolute inset-0 opacity-40" aria-hidden="true" />
          <div className="relative flex flex-col gap-6">
            <Badge variant="secondary" className="w-fit rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.24em] text-primary">
              <Sparkles className="mr-1.5 size-3.5" aria-hidden="true" />
              {props.eyebrow}
            </Badge>
            <div className="space-y-4">
              <h1 className="display-type max-w-4xl text-5xl font-semibold leading-none text-balance sm:text-6xl lg:text-7xl">
                {props.title}
              </h1>
              <p className="max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">{props.description}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="rounded-full px-5 text-sm shadow-lg shadow-sky-500/20">
                <a href="#blueprint">
                  {props.primaryCta}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-5 text-sm">
                <a href="#methodology">
                  <Compass className="size-4" aria-hidden="true" />
                  {props.secondaryCta}
                </a>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          {props.statCards.map((item) => (
            <Card key={item.title} className="glass-panel surface-outline rounded-[1.75rem] border-white/35 bg-card/85">
              <CardContent className="space-y-3 p-6">
                <p className="display-type text-3xl font-semibold text-primary">{item.title}</p>
                <p className="text-sm leading-7 text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
