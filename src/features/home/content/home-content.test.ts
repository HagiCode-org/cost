import type { TFunction } from "i18next"
import { describe, expect, it } from "vitest"

import { getHomePageContent } from "./home-content"
import type { RootState } from "@/lib/store"

const t = ((key: string) => key) as unknown as TFunction

const siteState: RootState["site"] = {
  locale: "zh-CN",
  foundationStatus: "baseline-ready",
  futureFeatures: [
    { id: "job-profile", status: "ready-for-ui" },
    { id: "task-breakdown", status: "research" },
    { id: "result-brief", status: "planned" },
    { id: "action-path", status: "planned" },
  ],
}

describe("getHomePageContent", () => {
  it("maps all future feature placeholders from configuration", () => {
    const content = getHomePageContent(t, siteState)

    expect(content.futureFeatures).toHaveLength(4)
    expect(content.futureFeatures[0].title).toBe("futureFeatures.items.jobProfile.title")
    expect(content.formBlueprint.foundationStatus).toBe("formBlueprint.foundationStatus.baseline-ready")
  })
})
