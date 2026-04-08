import type { ResultViewModel } from "@/features/income-token/lib/build-result-view-model"
import type { EvaluationInput } from "@/features/income-token/lib/calculate-ai-risk"
import type { SalaryCurrency } from "@/features/income-token/lib/currency"
import type { SiteRegion } from "@/lib/region"
import { AgentVerdictSection } from "./AgentVerdictSection"
import { HagicodeBoostSection } from "./HagicodeBoostSection"
import { CostImpactSection } from "./CostImpactSection"
import { TokenCeilingListSection } from "./TokenCeilingListSection"

interface ResultSectionsProps {
  result: ResultViewModel
  baseInput: EvaluationInput
  selectedCurrency: SalaryCurrency
  region: SiteRegion
}

export function ResultSections({ result, baseInput, selectedCurrency, region }: ResultSectionsProps) {
  return (
    <div className="mx-auto max-w-7xl space-y-6 pt-10">
      <AgentVerdictSection data={result.summarySection} />
      <HagicodeBoostSection baseInput={baseInput} selectedCurrency={selectedCurrency} region={region} />
      <CostImpactSection data={result.costSection} />
      <TokenCeilingListSection data={result.tokenListSection} />
    </div>
  )
}
