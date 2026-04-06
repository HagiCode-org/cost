import { describe, expect, it } from "vitest"

import { buildShareCopy } from "./share-copy"

describe("buildShareCopy", () => {
  it("keeps USD formatting in English share copy", () => {
    const copy = buildShareCopy("en-US", {
      annualIncome: "$41,379",
      annualTotalCost: "$58,276",
      annualAiCost: "$4,831",
      effectivePeopleEquivalent: "2.40 workers",
      modelName: "GPT-5",
      verdictHeadline: "The threat is already high.",
      exchangeRateText: "Estimated with the static rate 1 USD = 7.25 CNY.",
    })

    expect(copy).toContain("$58,276")
    expect(copy).toContain("$4,831")
    expect(copy).toContain("GPT-5")
    expect(copy).toContain("1 USD = 7.25 CNY")
  })

  it("keeps CNY formatting in Chinese share copy", () => {
    const copy = buildShareCopy("zh-CN", {
      annualIncome: "¥30,000",
      annualTotalCost: "¥44,500",
      annualAiCost: "¥3,600",
      effectivePeopleEquivalent: "2.40 人",
      modelName: "DeepSeek-V3",
      verdictHeadline: "威胁已经很高。",
    })

    expect(copy).toContain("¥44,500")
    expect(copy).toContain("¥3,600")
    expect(copy).toContain("DeepSeek-V3")
    expect(copy).not.toContain("$")
  })
})
