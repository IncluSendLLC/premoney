import { CapTableEntry } from "./types";

export function calcPostMoneyValuation(
  preMoneyValuation: number,
  investmentAmount: number
): number {
  return preMoneyValuation + investmentAmount;
}

/**
 * Calculate the option pool shuffle and effective pre-money.
 *
 * When the option pool is carved from pre-money (the "shuffle"):
 *   postMoney = preMoney + investment
 *   targetPoolShares = totalPostMoneyShares * targetPoolPercent
 *   The new pool shares dilute existing holders (founders), not the new investor.
 *
 * Returns the price per share and number of new pool shares to create.
 */
export function calcOptionPoolExpansion(
  existingTotalShares: number,
  existingPoolShares: number,
  preMoneyValuation: number,
  investmentAmount: number,
  targetPoolPercent: number,
  isPreMoney: boolean
): {
  pricePerShare: number;
  newPoolShares: number;
  investorShares: number;
  totalSharesAfter: number;
} {
  const postMoney = preMoneyValuation + investmentAmount;

  if (!isPreMoney || targetPoolPercent <= 0) {
    const pricePerShare = preMoneyValuation / existingTotalShares;
    const investorShares = investmentAmount / pricePerShare;
    const totalSharesAfter = existingTotalShares + investorShares;

    let newPoolShares = 0;
    if (targetPoolPercent > 0) {
      const currentPoolPercent =
        existingPoolShares / (existingTotalShares + investorShares);
      if (currentPoolPercent < targetPoolPercent / 100) {
        const targetShares =
          (targetPoolPercent / 100) *
          (totalSharesAfter / (1 - targetPoolPercent / 100));
        newPoolShares = Math.max(0, targetShares - existingPoolShares);
      }
    }

    return {
      pricePerShare,
      newPoolShares,
      investorShares,
      totalSharesAfter: totalSharesAfter + newPoolShares,
    };
  }

  // Pre-money pool shuffle:
  // T = totalPostMoneyShares, p = targetPoolPercent/100
  // T = (existingNonPoolShares) / (1 - p - investmentAmount/postMoney)
  const p = targetPoolPercent / 100;
  const existingNonPoolShares = existingTotalShares - existingPoolShares;
  const investRatio = investmentAmount / postMoney;

  const denominator = 1 - p - investRatio;
  if (denominator <= 0) {
    const pricePerShare = preMoneyValuation / existingTotalShares;
    const investorShares = investmentAmount / pricePerShare;
    return {
      pricePerShare,
      newPoolShares: 0,
      investorShares,
      totalSharesAfter: existingTotalShares + investorShares,
    };
  }

  const totalPostMoneyShares = existingNonPoolShares / denominator;
  const pricePerShare = postMoney / totalPostMoneyShares;
  const investorShares = investmentAmount / pricePerShare;
  const targetPoolShares = totalPostMoneyShares * p;
  const newPoolShares = Math.max(0, targetPoolShares - existingPoolShares);

  return {
    pricePerShare,
    newPoolShares,
    investorShares,
    totalSharesAfter:
      existingNonPoolShares +
      existingPoolShares +
      newPoolShares +
      investorShares,
  };
}

export function applyDilution(
  existingEntries: CapTableEntry[],
  newTotalShares: number
): CapTableEntry[] {
  return existingEntries.map((entry) => ({
    ...entry,
    ownershipPercent: (entry.sharesOwned / newTotalShares) * 100,
  }));
}
