import type { TFunction } from "i18next"

import type { FutureFeatureId, RootState } from "@/lib/store"

interface FutureFeatureViewModel {
  id: FutureFeatureId
  title: string
  description: string
  status: string
}

const futureFeatureKeyMap: Record<FutureFeatureId, string> = {
  "job-profile": "jobProfile",
  "task-breakdown": "taskBreakdown",
  "result-brief": "resultBrief",
  "action-path": "actionPath",
}

const statusKeyMap = {
  planned: "planned",
  research: "research",
  "ready-for-ui": "readyForUi",
} as const

export function getHomePageContent(t: TFunction, siteState: RootState["site"]) {
  return {
    hero: {
      eyebrow: t("hero.eyebrow"),
      title: t("hero.title"),
      description: t("hero.description"),
      primaryCta: t("hero.primaryCta"),
      secondaryCta: t("hero.secondaryCta"),
      statCards: [0, 1, 2].map((index) => ({
        title: t(`hero.stats.${index}.title`),
        description: t(`hero.stats.${index}.description`),
      })),
    },
    storyCards: [0, 1, 2].map((index) => ({
      eyebrow: t(`story.cards.${index}.eyebrow`),
      title: t(`story.cards.${index}.title`),
      description: t(`story.cards.${index}.description`),
    })),
    methodology: {
      title: t("methodology.title"),
      description: t("methodology.description"),
      pillars: [0, 1, 2].map((index) => ({
        title: t(`methodology.pillars.${index}.title`),
        description: t(`methodology.pillars.${index}.description`),
      })),
      note: t("methodology.note"),
    },
    futureFeatures: siteState.futureFeatures.map<FutureFeatureViewModel>((item) => ({
      id: item.id,
      title: t(`futureFeatures.items.${futureFeatureKeyMap[item.id]}.title`),
      description: t(`futureFeatures.items.${futureFeatureKeyMap[item.id]}.description`),
      status: t(`futureFeatures.status.${statusKeyMap[item.status]}`),
    })),
    formBlueprint: {
      title: t("formBlueprint.title"),
      description: t("formBlueprint.description"),
      labels: {
        role: t("formBlueprint.labels.role"),
        industry: t("formBlueprint.labels.industry"),
        context: t("formBlueprint.labels.context"),
      },
      placeholders: {
        role: t("formBlueprint.placeholders.role"),
        industry: t("formBlueprint.placeholders.industry"),
        context: t("formBlueprint.placeholders.context"),
      },
      helper: t("formBlueprint.helper"),
      button: t("formBlueprint.button"),
      foundationStatus: t(`formBlueprint.foundationStatus.${siteState.foundationStatus}`),
    },
    footer: {
      disclaimerTitle: t("footer.disclaimerTitle"),
      disclaimer: t("footer.disclaimer"),
      extensionNote: t("footer.extensionNote"),
      copyright: t("footer.copyright"),
    },
  }
}
