import {
  CapTableSnapshot,
  ExitConfig,
  ExitType,
  FundingRound,
  LiquidationPreferenceType,
  SeniorityType,
  WaterfallProceeds,
  WaterfallRangePoint,
  WaterfallResult,
} from "./types";

interface InvestorInfo {
  stakeholder: string;
  roundId: string;
  investedCapital: number;
  sharesOwned: number;
  asConvertedShares: number; // shares * conversionRatio
  liquidationMultiple: number;
  liquidationType: LiquidationPreferenceType;
  participationCap: number | null;
  seniorityRank: number;
  seniorityType: SeniorityType;
  accruedDividends: number;
  payToPlay: boolean;
  convertedToCommon: boolean; // forced by pay-to-play
}

interface CommonHolder {
  stakeholder: string;
  roundId: string | null;
  shares: number;
  isCarveoutRecipient: boolean;
}

function buildInvestorInfo(
  capTable: CapTableSnapshot,
  rounds: FundingRound[],
  yearsFromFirstRound: number
): InvestorInfo[] {
  const roundMap = new Map(rounds.map((r) => [r.id, r]));

  return capTable.entries
    .filter((e) => e.isPreferred && e.roundId)
    .map((entry) => {
      const round = roundMap.get(entry.roundId!);
      if (!round) {
        // Could be a converted note/SAFE — use default terms
        return {
          stakeholder: entry.stakeholder,
          roundId: entry.roundId!,
          investedCapital: entry.investedCapital,
          sharesOwned: entry.sharesOwned,
          asConvertedShares: entry.sharesOwned * (entry.conversionRatio || 1),
          liquidationMultiple: 1,
          liquidationType: LiquidationPreferenceType.NonParticipating,
          participationCap: null,
          seniorityRank: 999,
          seniorityType: SeniorityType.PariPassu,
          accruedDividends: entry.accruedDividends || 0,
          payToPlay: false,
          convertedToCommon: false,
        };
      }

      // Calculate accrued dividends
      let accruedDividends = entry.accruedDividends || 0;
      if (round.terms.dividends.enabled && round.terms.dividends.cumulative) {
        const rate = round.terms.dividends.ratePercent / 100;
        if (round.terms.dividends.compounding) {
          accruedDividends =
            entry.investedCapital *
            (Math.pow(1 + rate, yearsFromFirstRound) - 1);
        } else {
          accruedDividends = entry.investedCapital * rate * yearsFromFirstRound;
        }
      }

      return {
        stakeholder: entry.stakeholder,
        roundId: entry.roundId!,
        investedCapital: entry.investedCapital,
        sharesOwned: entry.sharesOwned,
        asConvertedShares: entry.sharesOwned * (entry.conversionRatio || 1),
        liquidationMultiple: round.terms.liquidationMultiple,
        liquidationType: round.terms.liquidationType,
        participationCap: round.terms.participationCap,
        seniorityRank: round.terms.seniorityRank,
        seniorityType: round.terms.seniorityType || SeniorityType.Standard,
        accruedDividends,
        payToPlay: round.terms.payToPlay || false,
        convertedToCommon: false,
      };
    });
}

function buildCommonHolders(capTable: CapTableSnapshot): CommonHolder[] {
  return capTable.entries
    .filter((e) => !e.isPreferred)
    .map((entry) => ({
      stakeholder: entry.stakeholder,
      roundId: entry.roundId,
      shares: entry.sharesOwned,
      isCarveoutRecipient:
        entry.stakeholder === "Option Pool" ||
        entry.stakeholder.includes("Founder"),
    }));
}

/**
 * Calculate waterfall distribution for a given exit configuration.
 *
 * Supports:
 * - Transaction costs and escrow holdbacks
 * - Management carve-outs
 * - Cumulative dividends added to preference stack
 * - Pari passu vs stacked seniority (pro-rata within tiers)
 * - Non-participating, participating, and capped participating preferred
 * - Iterative convergence for conversion decisions
 * - IPO auto-conversion, dissolution, and acqui-hire modes
 */
export function calculateWaterfall(
  capTable: CapTableSnapshot,
  rounds: FundingRound[],
  exitConfigOrValue: ExitConfig | number
): WaterfallResult {
  const exitConfig: ExitConfig =
    typeof exitConfigOrValue === "number"
      ? {
          exitValue: exitConfigOrValue,
          exitType: ExitType.Acquisition,
          transactionCostPercent: 0,
          escrowPercent: 0,
          managementCarveout: 0,
          earnoutAmount: 0,
          earnoutProbabilityPercent: 100,
          yearsFromFirstRound: 0,
        }
      : exitConfigOrValue;

  const {
    exitValue,
    exitType,
    transactionCostPercent,
    escrowPercent,
    managementCarveout,
    yearsFromFirstRound,
  } = exitConfig;

  if (exitValue <= 0) {
    return createZeroResult(capTable, rounds, exitConfig);
  }

  // Transaction costs and escrow come off the top
  const transactionCosts = exitValue * (transactionCostPercent / 100);
  const escrowHoldback = exitValue * (escrowPercent / 100);
  let distributable = exitValue - transactionCosts - escrowHoldback;

  // IPO: all preferred auto-converts to common, no preference waterfall
  if (exitType === ExitType.IPO) {
    return calculateIPODistribution(
      capTable,
      rounds,
      distributable,
      exitConfig
    );
  }

  const investors = buildInvestorInfo(capTable, rounds, yearsFromFirstRound);
  const commonHolders = buildCommonHolders(capTable);

  // Management carve-out comes off before the waterfall
  const carveout = Math.min(managementCarveout, distributable);
  distributable -= carveout;

  // Acqui-hire: most value goes to carve-out, minimal waterfall
  // (carve-out already handled above)

  // Sort by seniority (lower rank = more senior = paid first)
  const sortedInvestors = [...investors].sort(
    (a, b) => a.seniorityRank - b.seniorityRank
  );

  // Group investors by seniority rank for pari passu handling
  const seniorityTiers = new Map<number, InvestorInfo[]>();
  for (const inv of sortedInvestors) {
    const tier = seniorityTiers.get(inv.seniorityRank) || [];
    tier.push(inv);
    seniorityTiers.set(inv.seniorityRank, tier);
  }
  const sortedTierRanks = Array.from(seniorityTiers.keys()).sort(
    (a, b) => a - b
  );

  // Iterative conversion decision loop
  const convertDecisions = new Map<string, boolean>();
  investors.forEach((inv) => convertDecisions.set(inv.roundId, false));

  for (let iteration = 0; iteration < 20; iteration++) {
    let changed = false;

    // Total common shares (base common + converted investors)
    let totalCommonShares = commonHolders.reduce(
      (sum, h) => sum + h.shares,
      0
    );
    for (const inv of investors) {
      if (convertDecisions.get(inv.roundId)) {
        totalCommonShares += inv.asConvertedShares;
      }
    }

    // Calculate total participating shares for participation phase
    let totalParticipatingShares = totalCommonShares;
    for (const inv of investors) {
      if (convertDecisions.get(inv.roundId)) continue;
      if (
        inv.liquidationType === LiquidationPreferenceType.Participating ||
        inv.liquidationType === LiquidationPreferenceType.CappedParticipating
      ) {
        totalParticipatingShares += inv.asConvertedShares;
      }
    }

    // Calculate remaining after preferences
    let remaining = distributable;
    for (const rank of sortedTierRanks) {
      const tier = seniorityTiers.get(rank)!;
      const tierTotal = tier
        .filter((inv) => !convertDecisions.get(inv.roundId))
        .reduce(
          (sum, inv) =>
            sum +
            inv.investedCapital * inv.liquidationMultiple +
            inv.accruedDividends,
          0
        );

      if (remaining >= tierTotal) {
        remaining -= tierTotal;
      } else {
        // Pro-rata within the tier
        remaining = 0;
        break;
      }
    }

    // Calculate participation
    let remainingAfterParticipation = remaining;
    for (const inv of investors) {
      if (convertDecisions.get(inv.roundId)) continue;
      if (
        inv.liquidationType === LiquidationPreferenceType.Participating ||
        inv.liquidationType === LiquidationPreferenceType.CappedParticipating
      ) {
        const proRata =
          totalParticipatingShares > 0
            ? (inv.asConvertedShares / totalParticipatingShares) * remaining
            : 0;
        let participation = proRata;
        if (
          inv.liquidationType ===
            LiquidationPreferenceType.CappedParticipating &&
          inv.participationCap
        ) {
          const prefPaid =
            inv.investedCapital * inv.liquidationMultiple +
            inv.accruedDividends;
          const maxTotal = inv.investedCapital * inv.participationCap;
          participation = Math.min(participation, Math.max(0, maxTotal - prefPaid));
        }
        remainingAfterParticipation -= participation;
      }
    }

    // For non-participating preferred: check if converting is better
    for (const inv of investors) {
      if (
        inv.liquidationType !== LiquidationPreferenceType.NonParticipating
      ) {
        continue;
      }

      const pref =
        inv.investedCapital * inv.liquidationMultiple + inv.accruedDividends;

      // What they'd get as common (all non-participating share the final remaining)
      const commonPoolShares =
        totalCommonShares +
        (convertDecisions.get(inv.roundId) ? 0 : inv.asConvertedShares);
      const commonPoolRemaining =
        remainingAfterParticipation +
        (convertDecisions.get(inv.roundId) ? 0 : pref);

      const commonProceeds =
        commonPoolShares > 0
          ? (inv.asConvertedShares / commonPoolShares) * commonPoolRemaining
          : 0;

      const currentPref = Math.min(pref, distributable);
      const shouldConvert = commonProceeds > currentPref;

      if (shouldConvert !== convertDecisions.get(inv.roundId)) {
        convertDecisions.set(inv.roundId, shouldConvert);
        changed = true;
      }
    }

    if (!changed) break;
  }

  // === Final distribution with settled decisions ===
  const results: WaterfallProceeds[] = [];
  let remaining = distributable;

  // Recalculate totals with final decisions
  let totalCommonShares = commonHolders.reduce(
    (sum, h) => sum + h.shares,
    0
  );
  for (const inv of investors) {
    if (convertDecisions.get(inv.roundId)) {
      totalCommonShares += inv.asConvertedShares;
    }
  }

  // Phase 1: Pay preferences by seniority tier (pari passu within tier)
  const prefPayments = new Map<string, number>();
  const dividendPayments = new Map<string, number>();

  for (const rank of sortedTierRanks) {
    const tier = seniorityTiers.get(rank)!;
    const activeTier = tier.filter(
      (inv) => !convertDecisions.get(inv.roundId)
    );

    const tierTotalPref = activeTier.reduce(
      (sum, inv) =>
        sum +
        inv.investedCapital * inv.liquidationMultiple +
        inv.accruedDividends,
      0
    );

    if (remaining >= tierTotalPref) {
      // Pay in full
      for (const inv of activeTier) {
        const pref = inv.investedCapital * inv.liquidationMultiple;
        prefPayments.set(inv.roundId, pref);
        dividendPayments.set(inv.roundId, inv.accruedDividends);
        remaining -= pref + inv.accruedDividends;
      }
    } else {
      // Pro-rata distribution within tier
      for (const inv of activeTier) {
        const invTotal =
          inv.investedCapital * inv.liquidationMultiple +
          inv.accruedDividends;
        const proRata =
          tierTotalPref > 0 ? (invTotal / tierTotalPref) * remaining : 0;
        const prefPortion =
          tierTotalPref > 0
            ? (inv.investedCapital * inv.liquidationMultiple) / invTotal
            : 0;
        prefPayments.set(inv.roundId, proRata * prefPortion);
        dividendPayments.set(inv.roundId, proRata * (1 - prefPortion));
      }
      remaining = 0;
    }
  }

  // Converted investors get no preference
  for (const inv of investors) {
    if (convertDecisions.get(inv.roundId)) {
      prefPayments.set(inv.roundId, 0);
      dividendPayments.set(inv.roundId, 0);
    }
  }

  // Phase 2: Participation
  let totalParticipatingShares = totalCommonShares;
  const participatingInvestors = investors.filter(
    (inv) =>
      !convertDecisions.get(inv.roundId) &&
      (inv.liquidationType === LiquidationPreferenceType.Participating ||
        inv.liquidationType === LiquidationPreferenceType.CappedParticipating)
  );
  for (const inv of participatingInvestors) {
    totalParticipatingShares += inv.asConvertedShares;
  }

  const participationPayments = new Map<string, number>();
  for (const inv of investors) {
    if (convertDecisions.get(inv.roundId)) {
      participationPayments.set(inv.roundId, 0);
      continue;
    }

    if (
      inv.liquidationType === LiquidationPreferenceType.Participating ||
      inv.liquidationType === LiquidationPreferenceType.CappedParticipating
    ) {
      const proRata =
        totalParticipatingShares > 0
          ? (inv.asConvertedShares / totalParticipatingShares) * remaining
          : 0;

      let participation = proRata;
      if (
        inv.liquidationType ===
          LiquidationPreferenceType.CappedParticipating &&
        inv.participationCap
      ) {
        const prefPaid =
          (prefPayments.get(inv.roundId) || 0) +
          (dividendPayments.get(inv.roundId) || 0);
        const maxTotal = inv.investedCapital * inv.participationCap;
        participation = Math.min(
          participation,
          Math.max(0, maxTotal - prefPaid)
        );
      }

      participationPayments.set(inv.roundId, participation);
    } else {
      participationPayments.set(inv.roundId, 0);
    }
  }

  // Deduct participation from remaining
  for (const [, amount] of participationPayments) {
    remaining -= amount;
  }
  remaining = Math.max(0, remaining);

  // Phase 3: Distribute remaining to common + converted investors
  const commonPayments = new Map<string, number>();
  for (const holder of commonHolders) {
    const share =
      totalCommonShares > 0
        ? (holder.shares / totalCommonShares) * remaining
        : 0;
    commonPayments.set(holder.stakeholder, share);
  }

  const convertedCommonPayments = new Map<string, number>();
  for (const inv of investors) {
    if (convertDecisions.get(inv.roundId)) {
      const share =
        totalCommonShares > 0
          ? (inv.asConvertedShares / totalCommonShares) * remaining
          : 0;
      convertedCommonPayments.set(inv.roundId, share);
    }
  }

  // Distribute carve-out to common holders (founders + pool)
  const carveoutRecipients = commonHolders.filter(
    (h) => h.isCarveoutRecipient
  );
  const totalCarveoutShares = carveoutRecipients.reduce(
    (sum, h) => sum + h.shares,
    0
  );
  const carveoutPayments = new Map<string, number>();
  for (const holder of commonHolders) {
    if (holder.isCarveoutRecipient && totalCarveoutShares > 0) {
      carveoutPayments.set(
        holder.stakeholder,
        (holder.shares / totalCarveoutShares) * carveout
      );
    } else {
      carveoutPayments.set(holder.stakeholder, 0);
    }
  }

  // Build investor results
  for (const inv of investors) {
    const didConvert = convertDecisions.get(inv.roundId) || false;
    const prefAmount = prefPayments.get(inv.roundId) || 0;
    const divAmount = dividendPayments.get(inv.roundId) || 0;
    const partAmount = participationPayments.get(inv.roundId) || 0;
    const convAmount = convertedCommonPayments.get(inv.roundId) || 0;
    const total = prefAmount + divAmount + partAmount + convAmount;

    results.push({
      stakeholder: inv.stakeholder,
      roundId: inv.roundId,
      proceedsFromPreference: prefAmount + divAmount,
      proceedsFromParticipation: partAmount,
      proceedsFromConversion: convAmount,
      proceedsFromCarveout: 0,
      totalProceeds: total,
      didConvert,
      moic: inv.investedCapital > 0 ? total / inv.investedCapital : 0,
      investedCapital: inv.investedCapital,
      accruedDividends: inv.accruedDividends,
    });
  }

  // Build common holder results
  for (const holder of commonHolders) {
    const commonAmount = commonPayments.get(holder.stakeholder) || 0;
    const carveoutAmount = carveoutPayments.get(holder.stakeholder) || 0;
    const total = commonAmount + carveoutAmount;

    results.push({
      stakeholder: holder.stakeholder,
      roundId: holder.roundId,
      proceedsFromPreference: 0,
      proceedsFromParticipation: 0,
      proceedsFromConversion: 0,
      proceedsFromCarveout: carveoutAmount,
      totalProceeds: total,
      didConvert: false,
      moic: 0,
      investedCapital: 0,
      accruedDividends: 0,
    });
  }

  return {
    exitValue,
    netExitValue: distributable + carveout,
    transactionCosts,
    escrowHoldback,
    managementCarveout: carveout,
    proceeds: results,
    remainingToCommon: 0,
  };
}

/**
 * IPO distribution: all preferred converts to common, no preference waterfall.
 */
function calculateIPODistribution(
  capTable: CapTableSnapshot,
  rounds: FundingRound[],
  distributable: number,
  exitConfig: ExitConfig
): WaterfallResult {
  // In an IPO, all shares are common (preferred auto-converts)
  let totalShares = 0;
  for (const entry of capTable.entries) {
    if (entry.isPreferred) {
      totalShares += entry.sharesOwned * (entry.conversionRatio || 1);
    } else {
      totalShares += entry.sharesOwned;
    }
  }

  const results: WaterfallProceeds[] = capTable.entries.map((entry) => {
    const effectiveShares = entry.isPreferred
      ? entry.sharesOwned * (entry.conversionRatio || 1)
      : entry.sharesOwned;
    const proceeds =
      totalShares > 0 ? (effectiveShares / totalShares) * distributable : 0;

    return {
      stakeholder: entry.stakeholder,
      roundId: entry.roundId,
      proceedsFromPreference: 0,
      proceedsFromParticipation: 0,
      proceedsFromConversion: proceeds,
      proceedsFromCarveout: 0,
      totalProceeds: proceeds,
      didConvert: true,
      moic:
        entry.investedCapital > 0 ? proceeds / entry.investedCapital : 0,
      investedCapital: entry.isPreferred ? entry.investedCapital : 0,
      accruedDividends: 0,
    };
  });

  return {
    exitValue: exitConfig.exitValue,
    netExitValue: distributable,
    transactionCosts:
      exitConfig.exitValue * (exitConfig.transactionCostPercent / 100),
    escrowHoldback:
      exitConfig.exitValue * (exitConfig.escrowPercent / 100),
    managementCarveout: 0,
    proceeds: results,
    remainingToCommon: 0,
  };
}

function createZeroResult(
  capTable: CapTableSnapshot,
  rounds: FundingRound[],
  exitConfig: ExitConfig
): WaterfallResult {
  const proceeds: WaterfallProceeds[] = capTable.entries.map((entry) => ({
    stakeholder: entry.stakeholder,
    roundId: entry.roundId,
    proceedsFromPreference: 0,
    proceedsFromParticipation: 0,
    proceedsFromConversion: 0,
    proceedsFromCarveout: 0,
    totalProceeds: 0,
    didConvert: false,
    moic: 0,
    investedCapital: entry.isPreferred ? entry.investedCapital : 0,
    accruedDividends: 0,
  }));

  return {
    exitValue: 0,
    netExitValue: 0,
    transactionCosts: 0,
    escrowHoldback: 0,
    managementCarveout: 0,
    proceeds,
    remainingToCommon: 0,
  };
}

export function calculateWaterfallRange(
  capTable: CapTableSnapshot,
  rounds: FundingRound[],
  minExit: number,
  maxExit: number,
  steps: number,
  exitConfig?: Partial<ExitConfig>
): WaterfallRangePoint[] {
  const points: WaterfallRangePoint[] = [];
  const stepSize = (maxExit - minExit) / Math.max(steps - 1, 1);

  for (let i = 0; i < steps; i++) {
    const exitValue = minExit + stepSize * i;
    const config: ExitConfig = {
      exitValue,
      exitType: exitConfig?.exitType ?? ExitType.Acquisition,
      transactionCostPercent: exitConfig?.transactionCostPercent ?? 0,
      escrowPercent: exitConfig?.escrowPercent ?? 0,
      managementCarveout: exitConfig?.managementCarveout ?? 0,
      earnoutAmount: exitConfig?.earnoutAmount ?? 0,
      earnoutProbabilityPercent: exitConfig?.earnoutProbabilityPercent ?? 100,
      yearsFromFirstRound: exitConfig?.yearsFromFirstRound ?? 0,
    };
    const result = calculateWaterfall(capTable, rounds, config);

    const point: WaterfallRangePoint = { exitValue };
    for (const p of result.proceeds) {
      point[p.stakeholder] = p.totalProceeds;
    }
    points.push(point);
  }

  return points;
}
