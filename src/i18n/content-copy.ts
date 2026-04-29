import i18n, { type SupportedLanguage } from "./config"

export function getModelAvailabilityLabel(status: string, language: SupportedLanguage) {
  const t = i18n.getFixedT(language)

  if (status === "coming-soon") {
    return t("assessmentAvailability.comingSoon")
  }

  if (status === "legacy-mapped") {
    return t("assessmentAvailability.legacyMapped")
  }

  return t("assessmentAvailability.available")
}
