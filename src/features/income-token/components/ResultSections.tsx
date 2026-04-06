import type { ResultViewModel } from "@/features/income-token/lib/build-result-view-model"
import type { EvaluationInput } from "@/features/income-token/lib/calculate-ai-risk"
import type { SalaryCurrency } from "@/features/income-token/lib/currency"
import { AgentVerdictSection } from "./AgentVerdictSection"
import { HagicodeBoostSection } from "./HagicodeBoostSection"
import { CostImpactSection } from "./CostImpactSection"
import { TokenCeilingListSection } from "./TokenCeilingListSection"

interface ResultSectionsProps {
  result: ResultViewModel
  baseInput: EvaluationInput
  selectedCurrency: SalaryCurrency
}

export function ResultSections({ result, baseInput, selectedCurrency }: ResultSectionsProps) {
  return (
    <div className="space-y-6 pt-8 sm:px-6">
      <AgentVerdictSection data={result.summarySection} />
      <HagicodeBoostSection baseInput={baseInput} selectedCurrency={selectedCurrency} />
      <CostImpactSection data={result.costSection} />
      <TokenCeilingListSection data={result.tokenListSection} />
    </div>
  )
}
