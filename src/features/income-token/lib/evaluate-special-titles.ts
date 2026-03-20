import { specialTitleCatalog } from "./title-definitions"
import type {
  EvaluatedSpecialTitles,
  SpecialTitleId,
  SpecialTitleRuleContext,
  SpecialTitleState,
  SpecialTitleViewModel,
} from "./title-types"

interface EvaluateSpecialTitlesOptions extends SpecialTitleRuleContext {
  earnedTitleIds: readonly SpecialTitleId[]
  newlyEarnedTitleIds?: readonly SpecialTitleId[]
}

function getTitleState(isMatched: boolean, isPreviouslyEarned: boolean): SpecialTitleState {
  if (!isMatched) return "locked"
  return isPreviouslyEarned ? "earned" : "newly-earned"
}

export function evaluateSpecialTitles({
  rawInput,
  calculationResult,
  earnedTitleIds,
  newlyEarnedTitleIds = [],
}: EvaluateSpecialTitlesOptions): EvaluatedSpecialTitles {
  const matchedTitleIds = specialTitleCatalog
    .filter((title) => title.matches({ rawInput, calculationResult }))
    .map((title) => title.id)

  const matchedTitleIdSet = new Set(matchedTitleIds)
  const earnedTitleIdSet = new Set(earnedTitleIds)
  const newlyEarnedTitleIdSet = new Set(newlyEarnedTitleIds)

  const titles = specialTitleCatalog.map<SpecialTitleViewModel>((title) => {
    const isMatched = matchedTitleIdSet.has(title.id)
    const isPreviouslyEarned = earnedTitleIdSet.has(title.id)
    const state = isMatched && newlyEarnedTitleIdSet.has(title.id)
      ? "newly-earned"
      : getTitleState(isMatched, isPreviouslyEarned)

    return {
      id: title.id,
      translationKey: title.translationKey,
      source: title.source,
      state,
      isMatched,
      isNewlyEarned: state === "newly-earned",
    }
  })

  const newlyEarnedTitles = titles.filter((title) => title.state === "newly-earned")
  const earnedTitles = titles.filter((title) => title.state === "earned")
  const lockedTitles = titles.filter((title) => title.state === "locked")
  const matchedTitles = titles.filter((title) => title.isMatched)

  return {
    titles,
    matchedTitleIds,
    newlyEarnedTitleIds: newlyEarnedTitles.map((title) => title.id),
    earnedTitleIds: earnedTitles.map((title) => title.id),
    lockedTitleIds: lockedTitles.map((title) => title.id),
    matchedTitles,
    newlyEarnedTitles,
    earnedTitles,
    lockedTitles,
  }
}
