import { beforeEach, describe, expect, it } from "vitest"

import {
  SPECIAL_TITLE_STORAGE_KEY,
  SPECIAL_TITLE_STORAGE_VERSION,
  mergeEarnedTitleIds,
  readEarnedTitleIds,
  writeEarnedTitleIds,
} from "./title-storage"

beforeEach(() => {
  localStorage.clear()
})

describe("title-storage", () => {
  it("persists and restores normalized stable title ids", () => {
    const storedTitleIds = writeEarnedTitleIds([
      "prompt-alchemist",
      "prompt-alchemist",
      "budget-coordinator",
    ])

    expect(storedTitleIds).toEqual(["prompt-alchemist", "budget-coordinator"])
    expect(readEarnedTitleIds()).toEqual(["prompt-alchemist", "budget-coordinator"])
    expect(JSON.parse(localStorage.getItem(SPECIAL_TITLE_STORAGE_KEY) ?? "null")).toEqual({
      version: SPECIAL_TITLE_STORAGE_VERSION,
      earnedTitleIds: ["prompt-alchemist", "budget-coordinator"],
    })
  })

  it("falls back to an empty set when the payload version is incompatible", () => {
    localStorage.setItem(
      SPECIAL_TITLE_STORAGE_KEY,
      JSON.stringify({ version: SPECIAL_TITLE_STORAGE_VERSION + 1, earnedTitleIds: ["prompt-alchemist"] })
    )

    expect(readEarnedTitleIds()).toEqual([])
  })

  it("recovers safely from malformed payloads", () => {
    localStorage.setItem(SPECIAL_TITLE_STORAGE_KEY, "not-json")

    expect(readEarnedTitleIds()).toEqual([])
  })

  it("deduplicates merged earned-title ids before persistence", () => {
    expect(mergeEarnedTitleIds(["prompt-alchemist"], ["prompt-alchemist", "cost-tamer"]))
      .toEqual(["prompt-alchemist", "cost-tamer"])
  })
})
