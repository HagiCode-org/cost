import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import {
  Archive,
  Award,
  BookOpen,
  Bot,
  BrainCircuit,
  Code2,
  Eye,
  FileText,
  Flame,
  FlaskConical,
  Lightbulb,
  ListTodo,
  RefreshCw,
  Sparkles,
  Sword,
  Target,
  Trophy,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react"

import {
  getCostFeatureShowcaseContent,
  type CostFeaturePanelId,
} from "@/features/home/content/cost-feature-showcase-content"
import styles from "./CostFeatureShowcase.module.css"

const workflowIcons: Record<string, LucideIcon> = {
  idea: Lightbulb,
  proposal: FileText,
  review: Eye,
  tasks: ListTodo,
  code: Code2,
  test: FlaskConical,
  refactor: RefreshCw,
  docs: BookOpen,
  archive: Archive,
}

const laneIcons: Record<string, LucideIcon> = {
  claude: BrainCircuit,
  codex: Zap,
  router: Target,
}

const interestingIcons: Record<string, LucideIcon> = {
  dungeons: Trophy,
  captains: Users,
  battle: Flame,
  proposal: Target,
  autotask: Zap,
  prompt: Sparkles,
  strategist: BrainCircuit,
  runner: Sword,
  artist: Award,
}

const panelIds: Record<CostFeaturePanelId, string> = {
  smart: "cost-feature-smart",
  efficient: "cost-feature-efficient",
  interesting: "cost-feature-interesting",
}

function providerMonogram(name: string) {
  return name
    .split(/(?=[A-Z])|\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((segment) => segment[0])
    .join("")
    .toUpperCase()
}

export function CostFeatureShowcase() {
  const { t } = useTranslation()
  const content = useMemo(() => getCostFeatureShowcaseContent(t), [t])

  return (
    <section
      aria-labelledby="cost-feature-showcase-title"
      className={styles.featureShowcase}
    >
      <div className={styles.inner}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>{content.section.eyebrow}</span>
          <h2 id="cost-feature-showcase-title" className={styles.title}>
            {content.section.title}
          </h2>
          <p className={styles.subtitle}>{content.section.subtitle}</p>
        </div>

        <div className={styles.panelStack}>
          <article
            aria-labelledby={panelIds.smart}
            className={styles.panel}
            data-panel-id="smart"
          >
            <div className={styles.panelCopy}>
              <span className={styles.panelBadge}>{content.panels.smart.badge}</span>
              <h3 id={panelIds.smart} className={styles.panelTitle}>
                {content.panels.smart.title}
              </h3>
              <p className={styles.panelSubtitle}>{content.panels.smart.subtitle}</p>
              <p className={styles.panelDescription}>{content.panels.smart.description}</p>

              <div className={styles.smartMetricCard}>
                <div>
                  <p className={styles.metricLabel}>{content.panels.smart.efficiencyLabel}</p>
                  <p className={styles.metricValue}>{content.panels.smart.efficiencyValue}</p>
                </div>
                <div className={styles.smartComparisonBars} aria-hidden="true">
                  <div className={styles.comparisonBarRow}>
                    <span>{content.panels.smart.comparison.traditional}</span>
                    <div className={styles.comparisonBarTrack}>
                      <div className={styles.comparisonBarFill} style={{ width: "34%" }} />
                    </div>
                  </div>
                  <div className={styles.comparisonBarRow}>
                    <span>{content.panels.smart.comparison.hagicode}</span>
                    <div className={styles.comparisonBarTrack}>
                      <div className={styles.comparisonBarFillAccent} style={{ width: "100%" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.panelVisual}>
              <div className={styles.visualHeader}>
                <h4 className={styles.visualTitle}>{content.panels.smart.workflowTitle}</h4>
                <p className={styles.visualHint}>{content.panels.smart.workflowHint}</p>
              </div>
              <ol className={styles.workflowGrid}>
                {content.panels.smart.workflow.map((stage) => {
                  const Icon = workflowIcons[stage.id] ?? Bot
                  return (
                    <li key={stage.id} className={styles.workflowCard}>
                      <div className={styles.workflowIconWrap}>
                        <Icon aria-hidden="true" className={styles.icon} />
                      </div>
                      <div>
                        <p className={styles.workflowLabel}>{stage.label}</p>
                        <p className={styles.workflowDescription}>{stage.description}</p>
                      </div>
                    </li>
                  )
                })}
              </ol>
            </div>
          </article>

          <article
            aria-labelledby={panelIds.efficient}
            className={styles.panel}
            data-panel-id="efficient"
          >
            <div className={styles.panelCopy}>
              <span className={styles.panelBadge}>{content.panels.efficient.badge}</span>
              <h3 id={panelIds.efficient} className={styles.panelTitle}>
                {content.panels.efficient.title}
              </h3>
              <p className={styles.panelSubtitle}>{content.panels.efficient.subtitle}</p>
              <p className={styles.panelDescription}>{content.panels.efficient.description}</p>

              <div className={styles.efficientSummary}>
                <div className={styles.efficiencyArrow} aria-hidden="true">
                  <div className={styles.comparisonBarTrack}>
                    <div className={styles.comparisonBarFill} style={{ width: "22%" }} />
                  </div>
                  <span className={styles.arrowMark}>→</span>
                  <div className={styles.comparisonBarTrack}>
                    <div className={styles.comparisonBarFillAccent} style={{ width: "100%" }} />
                  </div>
                </div>
                <div className={styles.comparisonLabels}>
                  <span>{content.panels.efficient.comparison.traditional}</span>
                  <span>{content.panels.efficient.comparison.multiAgent}</span>
                </div>
                <div className={styles.throughputBadge}>
                  <span>{content.panels.efficient.throughputLabel}</span>
                  <strong>{content.panels.efficient.throughputValue}</strong>
                </div>
              </div>
            </div>

            <div className={styles.panelVisual}>
              <div className={styles.visualHeader}>
                <h4 className={styles.visualTitle}>{content.panels.efficient.matrixTitle}</h4>
                <p className={styles.visualHint}>{content.panels.efficient.matrixBadge}</p>
              </div>

              <div className={styles.providerPanel}>
                <p className={styles.providerTitle}>{content.panels.efficient.providersTitle}</p>
                <ul className={styles.providerGrid}>
                  {content.panels.efficient.supportedProviders.map((provider) => (
                    <li key={provider.id} className={styles.providerPill}>
                      <span aria-hidden="true" className={styles.providerMonogram}>
                        {providerMonogram(provider.name)}
                      </span>
                      <span>{provider.name}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <ul className={styles.agentLaneList}>
                {content.panels.efficient.lanes.map((lane) => {
                  const Icon = laneIcons[lane.id] ?? Bot
                  return (
                    <li key={lane.id} className={styles.agentLane}>
                      <div className={styles.agentLaneHeader}>
                        <div className={styles.agentMeta}>
                          <span className={styles.agentIconBadge}>
                            <Icon aria-hidden="true" className={styles.icon} />
                          </span>
                          <div>
                            <p className={styles.agentName}>{lane.name}</p>
                            <p className={styles.agentRole}>{lane.role}</p>
                          </div>
                        </div>
                      </div>
                      <div className={styles.instanceStrip}>
                        {lane.instances.map((instance) => (
                          <span key={instance} className={styles.instancePill}>
                            {instance}
                          </span>
                        ))}
                      </div>
                    </li>
                  )
                })}
              </ul>
              <div className={styles.matrixStatus}>
                <span aria-hidden="true" className={styles.statusDot} />
                <span>{content.panels.efficient.matrixStatus}</span>
              </div>
            </div>
          </article>

          <article
            aria-labelledby={panelIds.interesting}
            className={styles.panel}
            data-panel-id="interesting"
          >
            <div className={styles.panelCopy}>
              <span className={styles.panelBadge}>{content.panels.interesting.badge}</span>
              <h3 id={panelIds.interesting} className={styles.panelTitle}>
                {content.panels.interesting.title}
              </h3>
              <p className={styles.panelSubtitle}>{content.panels.interesting.subtitle}</p>
              <p className={styles.panelDescription}>{content.panels.interesting.description}</p>

              <ul className={styles.featurePills}>
                {content.panels.interesting.featurePills.map((feature) => {
                  const Icon = interestingIcons[feature.id] ?? Sparkles
                  return (
                    <li key={feature.id} className={styles.featurePillCard}>
                      <Icon aria-hidden="true" className={styles.icon} />
                      <div>
                        <p className={styles.featurePillLabel}>{feature.label}</p>
                        <p className={styles.featurePillDescription}>{feature.description}</p>
                      </div>
                    </li>
                  )
                })}
              </ul>

              <div className={styles.leftDungeonCards}>
                <div className={styles.dungeonCardGrid}>
                  {content.panels.interesting.dungeonCards.map((card) => {
                    const Icon = interestingIcons[card.id] ?? Sparkles
                    return (
                      <div key={card.id} className={styles.dungeonCard}>
                        <div className={styles.dungeonCardHeader}>
                          <span className={styles.dungeonCardIcon}>
                            <Icon aria-hidden="true" className={styles.icon} />
                          </span>
                          <span className={styles.dungeonStatus}>{card.status}</span>
                        </div>
                        <p className={styles.dungeonTitle}>{card.title}</p>
                        <p className={styles.dungeonDescription}>{card.description}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className={styles.panelVisual}>
              <div className={styles.interestingGrid}>
                <div className={styles.battlePanel}>
                  <div className={styles.visualHeader}>
                    <h4 className={styles.visualTitle}>{content.panels.interesting.battleReport.title}</h4>
                    <p className={styles.visualHint}>{content.panels.interesting.battleReport.badge}</p>
                  </div>
                  <div className={styles.battleMetrics}>
                    {content.panels.interesting.battleReport.metrics.map((metric) => (
                      <div key={metric.id} className={styles.battleMetric}>
                        <p className={styles.battleMetricValue}>{metric.value}</p>
                        <p className={styles.battleMetricLabel}>{metric.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className={styles.battleMeter} aria-hidden="true">
                    <div className={styles.battleMeterFill} />
                  </div>
                  <p className={styles.battleNote}>{content.panels.interesting.battleReport.note}</p>
                </div>
              </div>

              <div className={styles.galleryGrid}>
                <section aria-labelledby="cost-dungeon-gallery-title" className={styles.galleryPanel}>
                  <div className={styles.galleryHeading}>
                    <h4 id="cost-dungeon-gallery-title" className={styles.visualTitle}>
                      {content.panels.interesting.gallery.dungeons.title}
                    </h4>
                    <p className={styles.visualHint}>{content.panels.interesting.gallery.dungeons.subtitle}</p>
                  </div>
                  <div className={styles.galleryViewport}>
                    <ul className={styles.galleryTrack}>
                      {content.panels.interesting.gallery.dungeons.assets.map((asset, index) => (
                        <li key={`${asset.src}-${index}`} className={styles.galleryCard}>
                          <img
                            alt={asset.alt}
                            className={styles.galleryImage}
                            decoding="async"
                            loading="lazy"
                            src={asset.src}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>

                <section aria-labelledby="cost-hero-gallery-title" className={styles.galleryPanel}>
                  <div className={styles.galleryHeading}>
                    <h4 id="cost-hero-gallery-title" className={styles.visualTitle}>
                      {content.panels.interesting.gallery.heroes.title}
                    </h4>
                    <p className={styles.visualHint}>{content.panels.interesting.gallery.heroes.subtitle}</p>
                  </div>
                  <div className={styles.galleryViewport}>
                    <ul className={`${styles.galleryTrack} ${styles.galleryTrackReverse}`}>
                      {content.panels.interesting.gallery.heroes.assets.map((asset, index) => (
                        <li key={`${asset.src}-${index}`} className={styles.galleryCard}>
                          <img
                            alt={asset.alt}
                            className={styles.galleryImage}
                            decoding="async"
                            loading="lazy"
                            src={asset.src}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              </div>

              <section aria-labelledby="cost-roster-title" className={styles.rosterPanel}>
                <div className={styles.visualHeader}>
                  <h4 id="cost-roster-title" className={styles.visualTitle}>
                    {content.panels.interesting.roster.title}
                  </h4>
                </div>
                <ul className={styles.rosterList}>
                  {content.panels.interesting.roster.heroes.map((hero) => {
                    const Icon = interestingIcons[hero.id] ?? Sparkles
                    return (
                      <li key={hero.id} className={styles.rosterHero}>
                        <span className={styles.rosterAvatar}>
                          <Icon aria-hidden="true" className={styles.icon} />
                        </span>
                        <div>
                          <p className={styles.rosterName}>{hero.name}</p>
                          <p className={styles.rosterRole}>{hero.role}</p>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </section>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
