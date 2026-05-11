import { FundingRound } from "./types";

export function validateRound(round: FundingRound): string[] {
  const errors: string[] = [];

  if (!round.investorName.trim()) {
    errors.push("Investor name is required");
  }

  if (round.preMoneyValuation <= 0) {
    errors.push("Pre-money valuation must be positive");
  }

  if (round.investmentAmount <= 0) {
    errors.push("Investment amount must be positive");
  }

  if (round.investmentAmount >= round.preMoneyValuation) {
    errors.push("Investment amount should be less than pre-money valuation");
  }

  if (round.optionPoolPercent < 0 || round.optionPoolPercent > 50) {
    errors.push("Option pool percentage must be between 0% and 50%");
  }

  if (round.terms.liquidationMultiple < 1 || round.terms.liquidationMultiple > 5) {
    errors.push("Liquidation multiple should be between 1x and 5x");
  }

  if (
    round.terms.participationCap !== null &&
    round.terms.participationCap <= round.terms.liquidationMultiple
  ) {
    errors.push("Participation cap must be greater than the liquidation multiple");
  }

  return errors;
}

export function validateRoundSequence(rounds: FundingRound[]): string[] {
  const warnings: string[] = [];

  for (let i = 1; i < rounds.length; i++) {
    const prev = rounds[i - 1];
    const curr = rounds[i];
    const prevPostMoney = prev.preMoneyValuation + prev.investmentAmount;

    if (curr.preMoneyValuation < prevPostMoney) {
      warnings.push(
        `${curr.stage} pre-money ($${(curr.preMoneyValuation / 1_000_000).toFixed(1)}M) is less than ${prev.stage} post-money ($${(prevPostMoney / 1_000_000).toFixed(1)}M) — this is a down round`
      );
    }
  }

  return warnings;
}
