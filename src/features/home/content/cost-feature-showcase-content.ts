import type { TFunction } from "i18next"

export const costFeatureShowcasePanelOrder = ["smart", "efficient", "interesting"] as const

export type CostFeaturePanelId = (typeof costFeatureShowcasePanelOrder)[number]
export type CostFeatureGalleryGroup = "dungeons" | "heroes"

type WorkflowStageId =
  | "idea"
  | "proposal"
  | "review"
  | "tasks"
  | "code"
  | "test"
  | "refactor"
  | "docs"
  | "archive"

type AgentLaneId = "claude" | "codex" | "router"
type SupportCliId =
  | "ClaudeCodeCli"
  | "CodexCli"
  | "GitHubCopilot"
  | "CodebuddyCli"
  | "OpenCodeCli"
  | "IFlowCli"
type DungeonCardId = "proposal" | "autotask" | "prompt"
type RosterHeroId = "strategist" | "runner" | "artist"
type BattleMetricId = "dungeons" | "level" | "xp"

type GalleryManifestEntry = {
  fileName: string
  altKey: string
}

const workflowStageIds: WorkflowStageId[] = [
  "idea",
  "proposal",
  "review",
  "tasks",
  "code",
  "test",
  "refactor",
  "docs",
  "archive",
]

const agentLaneIds: AgentLaneId[] = ["claude", "codex", "router"]
const supportedCliIds: SupportCliId[] = [
  "ClaudeCodeCli",
  "CodexCli",
  "GitHubCopilot",
  "CodebuddyCli",
  "OpenCodeCli",
  "IFlowCli",
]
const dungeonCardIds: DungeonCardId[] = ["proposal", "autotask", "prompt"]
const rosterHeroIds: RosterHeroId[] = ["strategist", "runner", "artist"]
const battleMetricIds: BattleMetricId[] = ["dungeons", "level", "xp"]

export const costFeatureShowcaseGalleryManifest: Record<CostFeatureGalleryGroup, readonly GalleryManifestEntry[]> = {
  dungeons: [
    { fileName: "docs-editorial-still-life.webp", altKey: "featureShowcase.interesting.gallery.images.dungeons.docsEditorialStillLife" },
    { fileName: "proposal-ff-futurist-poster.webp", altKey: "featureShowcase.interesting.gallery.images.dungeons.proposalFfFuturistPoster" },
    { fileName: "annotation-notebook-scrapbook.webp", altKey: "featureShowcase.interesting.gallery.images.dungeons.annotationNotebookScrapbook" },
    { fileName: "proposal-name-badge-forge.webp", altKey: "featureShowcase.interesting.gallery.images.dungeons.proposalNameBadgeForge" },
    { fileName: "proposal-new-fantasy-sketch.webp", altKey: "featureShowcase.interesting.gallery.images.dungeons.proposalNewFantasySketch" },
    { fileName: "index-blueprint-network.webp", altKey: "featureShowcase.interesting.gallery.images.dungeons.indexBlueprintNetwork" },
    { fileName: "proposal-apply-cyber-forge.webp", altKey: "featureShowcase.interesting.gallery.images.dungeons.proposalApplyCyberForge" },
    { fileName: "description-soft-editorial-room.webp", altKey: "featureShowcase.interesting.gallery.images.dungeons.descriptionSoftEditorialRoom" },
    { fileName: "title-minimal-editorial.webp", altKey: "featureShowcase.interesting.gallery.images.dungeons.titleMinimalEditorial" },
    { fileName: "proposal-explore-abstract-atlas.webp", altKey: "featureShowcase.interesting.gallery.images.dungeons.proposalExploreAbstractAtlas" },
  ],
  heroes: [
    { fileName: "cat-line-03.webp", altKey: "featureShowcase.interesting.gallery.images.heroes.catLine03" },
    { fileName: "cat-ink-09.webp", altKey: "featureShowcase.interesting.gallery.images.heroes.catInk09" },
    { fileName: "cat-sticker-02.webp", altKey: "featureShowcase.interesting.gallery.images.heroes.catSticker02" },
    { fileName: "cat-sticker-08.webp", altKey: "featureShowcase.interesting.gallery.images.heroes.catSticker08" },
    { fileName: "thorn-06.webp", altKey: "featureShowcase.interesting.gallery.images.heroes.thorn06" },
    { fileName: "cat-paper-04.webp", altKey: "featureShowcase.interesting.gallery.images.heroes.catPaper04" },
    { fileName: "tide-09.webp", altKey: "featureShowcase.interesting.gallery.images.heroes.tide09" },
    { fileName: "royal-10.webp", altKey: "featureShowcase.interesting.gallery.images.heroes.royal10" },
    { fileName: "cat-oil-09.webp", altKey: "featureShowcase.interesting.gallery.images.heroes.catOil09" },
    { fileName: "aurora-04.webp", altKey: "featureShowcase.interesting.gallery.images.heroes.aurora04" },
  ],
}

function buildLoopedGallery(
  group: CostFeatureGalleryGroup,
  t: TFunction,
) {
  const assets = costFeatureShowcaseGalleryManifest[group].map((entry) => ({
    src: `/img/home/interesting/${group}/${entry.fileName}`,
    alt: t(entry.altKey),
  }))

  return [...assets, ...assets]
}

export function getCostFeatureShowcaseContent(t: TFunction) {
  return {
    section: {
      eyebrow: t("featureShowcase.section.eyebrow"),
      title: t("featureShowcase.section.title"),
    },
    panels: {
      smart: {
        id: "smart" as const,
        badge: t("featureShowcase.smart.badge"),
        title: t("featureShowcase.smart.title"),
        subtitle: t("featureShowcase.smart.subtitle"),
        description: t("featureShowcase.smart.description"),
        efficiencyLabel: t("featureShowcase.smart.efficiencyLabel"),
        efficiencyValue: t("featureShowcase.smart.efficiencyValue"),
        comparison: {
          traditional: t("featureShowcase.smart.comparison.traditional"),
          hagicode: t("featureShowcase.smart.comparison.hagicode"),
        },
        workflowTitle: t("featureShowcase.smart.workflowTitle"),
        workflowHint: t("featureShowcase.smart.workflowHint"),
        workflow: workflowStageIds.map((stageId) => ({
          id: stageId,
          label: t(`featureShowcase.smart.workflow.${stageId}.label`),
          description: t(`featureShowcase.smart.workflow.${stageId}.description`),
        })),
      },
      efficient: {
        id: "efficient" as const,
        badge: t("featureShowcase.efficient.badge"),
        title: t("featureShowcase.efficient.title"),
        subtitle: t("featureShowcase.efficient.subtitle"),
        description: t("featureShowcase.efficient.description"),
        comparison: {
          traditional: t("featureShowcase.efficient.comparison.traditional"),
          multiAgent: t("featureShowcase.efficient.comparison.multiAgent"),
        },
        throughputLabel: t("featureShowcase.efficient.throughputLabel"),
        throughputValue: t("featureShowcase.efficient.throughputValue"),
        providersTitle: t("featureShowcase.efficient.providersTitle"),
        matrixTitle: t("featureShowcase.efficient.matrix.title"),
        matrixBadge: t("featureShowcase.efficient.matrix.badge"),
        matrixStatus: t("featureShowcase.efficient.matrix.status"),
        supportedProviders: supportedCliIds.map((providerId, index) => ({
          id: providerId,
          name: t(`featureShowcase.efficient.supportedProviders.${index}`),
        })),
        lanes: agentLaneIds.map((laneId) => ({
          id: laneId,
          name: t(`featureShowcase.efficient.matrix.agents.${laneId}.name`),
          role: t(`featureShowcase.efficient.matrix.agents.${laneId}.role`),
          instances: [0, 1, 2].map((instanceIndex) =>
            t(`featureShowcase.efficient.matrix.agents.${laneId}.instances.${instanceIndex}`),
          ),
        })),
      },
      interesting: {
        id: "interesting" as const,
        badge: t("featureShowcase.interesting.badge"),
        title: t("featureShowcase.interesting.title"),
        subtitle: t("featureShowcase.interesting.subtitle"),
        description: t("featureShowcase.interesting.description"),
        featurePills: ["dungeons", "captains", "battle"].map((featureId) => ({
          id: featureId,
          label: t(`featureShowcase.interesting.featurePills.${featureId}.label`),
          description: t(`featureShowcase.interesting.featurePills.${featureId}.description`),
        })),
        dungeonCards: dungeonCardIds.map((cardId) => ({
          id: cardId,
          title: t(`featureShowcase.interesting.dungeonCards.${cardId}.title`),
          description: t(`featureShowcase.interesting.dungeonCards.${cardId}.description`),
          status: t(`featureShowcase.interesting.dungeonCards.${cardId}.status`),
        })),
        battleReport: {
          title: t("featureShowcase.interesting.battleReport.title"),
          badge: t("featureShowcase.interesting.battleReport.badge"),
          note: t("featureShowcase.interesting.battleReport.note"),
          metrics: battleMetricIds.map((metricId) => ({
            id: metricId,
            value: t(`featureShowcase.interesting.battleReport.metrics.${metricId}.value`),
            label: t(`featureShowcase.interesting.battleReport.metrics.${metricId}.label`),
          })),
        },
        roster: {
          title: t("featureShowcase.interesting.roster.title"),
          heroes: rosterHeroIds.map((heroId) => ({
            id: heroId,
            name: t(`featureShowcase.interesting.roster.heroes.${heroId}.name`),
            role: t(`featureShowcase.interesting.roster.heroes.${heroId}.role`),
          })),
        },
        gallery: {
          dungeons: {
            title: t("featureShowcase.interesting.gallery.dungeons.title"),
            subtitle: t("featureShowcase.interesting.gallery.dungeons.subtitle"),
            assets: buildLoopedGallery("dungeons", t),
          },
          heroes: {
            title: t("featureShowcase.interesting.gallery.heroes.title"),
            subtitle: t("featureShowcase.interesting.gallery.heroes.subtitle"),
            assets: buildLoopedGallery("heroes", t),
          },
        },
      },
    },
  }
}
