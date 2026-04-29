import type { SupportedLanguage } from "@/i18n/config"
import i18n from "@/i18n/config"

export interface ShareCopyValues {
  annualIncome: string
  annualTotalCost: string
  annualAiCost: string
  effectivePeopleEquivalent: string
  modelName: string
  verdictHeadline: string
  exchangeRateText?: string
}

export const DEFAULT_SHARE_COPY_TEMPLATE_ID = "cost-impact"

const shareTemplateKeys = {
  verdict: "shareTemplates.verdict",
  "cost-impact": "shareTemplates.costImpact",
  challenge: "shareTemplates.challenge",
} as const

export function buildShareCopy(
  language: SupportedLanguage,
  values: ShareCopyValues,
  templateId = DEFAULT_SHARE_COPY_TEMPLATE_ID,
) {
  const templateKey = shareTemplateKeys[templateId as keyof typeof shareTemplateKeys] ?? shareTemplateKeys["cost-impact"]
  const t = i18n.getFixedT(language)

  return t(templateKey as string, { ...values }).replace(/\s+/g, " ").trim()
}
