import type { SupportedLanguage } from "@/i18n/config"

export interface ShareCopyTemplate {
  id: string
  templateZh: string
  templateEn: string
}

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

export const shareCopyTemplates: ShareCopyTemplate[] = [
  {
    id: "verdict",
    templateZh: "按当前口径看，我的年薪基线是 {{annualIncome}}，企业年度全用工成本 {{annualTotalCost}}。如果同事也用 {{modelName}}，他大约能放大到 {{effectivePeopleEquivalent}}。{{verdictHeadline}}",
    templateEn: "At my current setup, my annual salary baseline is {{annualIncome}} and the total annual employment cost is {{annualTotalCost}}. If a coworker uses {{modelName}}, they could scale to about {{effectivePeopleEquivalent}}. {{verdictHeadline}}",
  },
  {
    id: "cost-impact",
    templateZh: "算了一笔账：企业为我承担的年度全用工成本是 {{annualTotalCost}}，按当前强度全年 AI 成本约 {{annualAiCost}}。如果同事也用 {{modelName}}，他大约会变成 {{effectivePeopleEquivalent}}。{{exchangeRateText}}",
    templateEn: "Ran the numbers: my employer's total annual employment cost is {{annualTotalCost}}, and the annual AI spend at this intensity is about {{annualAiCost}}. If a coworker also uses {{modelName}}, they scale to roughly {{effectivePeopleEquivalent}}. {{exchangeRateText}}",
  },
  {
    id: "challenge",
    templateZh: "如果同事也照这套方法用 {{modelName}}，他大约能放大到 {{effectivePeopleEquivalent}}。我的企业年度全用工成本 {{annualTotalCost}}，全年 AI 成本 {{annualAiCost}}。你也来测测？{{exchangeRateText}}",
    templateEn: "If a coworker follows the same {{modelName}} workflow, they could scale to about {{effectivePeopleEquivalent}}. My total annual employment cost is {{annualTotalCost}}, with annual AI spend around {{annualAiCost}}. Try yours too. {{exchangeRateText}}",
  },
]

function interpolateTemplate(template: string, values: ShareCopyValues) {
  return template
    .replaceAll("{{annualIncome}}", values.annualIncome)
    .replaceAll("{{annualTotalCost}}", values.annualTotalCost)
    .replaceAll("{{annualAiCost}}", values.annualAiCost)
    .replaceAll("{{effectivePeopleEquivalent}}", values.effectivePeopleEquivalent)
    .replaceAll("{{modelName}}", values.modelName)
    .replaceAll("{{verdictHeadline}}", values.verdictHeadline)
    .replaceAll("{{exchangeRateText}}", values.exchangeRateText ?? "")
    .replace(/\s+/g, " ")
    .trim()
}

export function buildShareCopy(
  language: SupportedLanguage,
  values: ShareCopyValues,
  templateId = DEFAULT_SHARE_COPY_TEMPLATE_ID,
) {
  const template = shareCopyTemplates.find((item) => item.id === templateId) ?? shareCopyTemplates[1]

  return interpolateTemplate(
    language === "zh-CN" ? template.templateZh : template.templateEn,
    values,
  )
}
