import { describe, expect, it } from "vitest"

import {
  costFeatureShowcaseGalleryManifest,
  costFeatureShowcasePanelOrder,
  getCostFeatureShowcaseContent,
} from "@/features/home/content/cost-feature-showcase-content"
import i18n from "@/i18n/config"

describe("cost feature showcase content", () => {
  it("preserves the source panel order and copied gallery counts", () => {
    expect(costFeatureShowcasePanelOrder).toEqual(["smart", "efficient", "interesting"])
    expect(costFeatureShowcaseGalleryManifest.dungeons).toHaveLength(10)
    expect(costFeatureShowcaseGalleryManifest.heroes).toHaveLength(10)

    for (const [group, manifest] of Object.entries(costFeatureShowcaseGalleryManifest)) {
      for (const entry of manifest) {
        expect(`/img/home/interesting/${group}/${entry.fileName}`).toMatch(
          /^\/img\/home\/interesting\/(dungeons|heroes)\/.+\.webp$/,
        )
      }
    }
  })

  it("keeps zh-CN and en-US locale strings aligned with every gallery alt key", async () => {
    await i18n.changeLanguage("zh-CN")
    const zhContent = getCostFeatureShowcaseContent(i18n.t.bind(i18n))

    await i18n.changeLanguage("en-US")
    const enContent = getCostFeatureShowcaseContent(i18n.t.bind(i18n))

    expect(zhContent.section.title).toBe("HagiCode 三大核心能力")
    expect(enContent.section.title).toBe(
      "The three core Hagicode capabilities",
    )

    for (const manifest of Object.values(costFeatureShowcaseGalleryManifest)) {
      const zhAssets = manifest.map((entry) => i18n.getFixedT("zh-CN")(entry.altKey))
      const enAssets = manifest.map((entry) => i18n.getFixedT("en-US")(entry.altKey))

      expect(zhAssets).toHaveLength(manifest.length)
      expect(enAssets).toHaveLength(manifest.length)

      zhAssets.forEach((alt) => {
        expect(alt).not.toMatch(/^featureShowcase\\./)
      })
      enAssets.forEach((alt) => {
        expect(alt).not.toMatch(/^featureShowcase\\./)
      })
    }
  })
})
