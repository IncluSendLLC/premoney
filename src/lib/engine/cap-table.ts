import {
  AntiDilutionType,
  CapTableEntry,
  CapTableSnapshot,
  ConvertibleInstrument,
  ConvertibleInstrumentType,
  ConvertedInstrumentResult,
  FundingRound,
  OptionPoolState,
  Scenario,
} from "./types";
import { calcOptionPoolExpansion, applyDilution } from "./dilution";
import {
  broadBasedWeightedAverage,
  narrowBasedWeightedAverage,
  fullRatchet,
} from "./anti-dilution";

function createFounderEntry(
  name: string,
  shares: number,
  totalShares: number
): CapTableEntry {
  return {
    stakeholder: name,
    sharesOwned: shares,
    ownershipPercent: (shares / totalShares) * 100,
    investedCapital: 0,
    pricePerShare: 0.0001,
    isPreferred: false,
    roundId: null,
    conversionRatio: 1,
    accruedDividends: 0,
  };
}

function createPoolEntry(
  shares: number,
  totalShares: number,
  strikePrice: number
): CapTableEntry {
  return {
    stakeholder: "Option Pool",
    sharesOwned: shares,
    ownershipPercent: (shares / totalShares) * 100,
    investedCapital: 0,
    pricePerShare: 0,
    isPreferred: false,
    roundId: null,
    conversionRatio: 1,
    accruedDividends: 0,
  };
}

function createInceptionSnapshot(scenario: Scenario): CapTableSnapshot {
  const totalShares = scenario.founderShares;
  const entries: CapTableEntry[] = [];

  if (scenario.founders.length > 0) {
    for (const founder of scenario.founders) {
      entries.push(createFounderEntry(founder.name, founder.sharesAllocated, totalShares));
    }
  } else {
    entries.push(createFounderEntry("Founders", totalShares, totalShares));
  }

  return {
    afterRoundId: null,
    entries,
    optionPool: {
      totalPoolShares: 0,
      grantedShares: 0,
      unallocatedShares: 0,
      poolPercentOfFullyDiluted: 0,
      strikePrice409A: 0.0001,
    },
    totalSharesOutstanding: totalShares,
    totalFullyDilutedShares: totalShares,
    postMoneyValuation: totalShares * 0.0001,
    pricePerShare: 0.0001,
  };
}

/**
 * Convert convertible instruments (notes & SAFEs) at a priced round.
 * Returns the shares issued to each instrument holder.
 */
function convertInstruments(
  instruments: ConvertibleInstrument[],
  roundId: string,
  roundPricePerShare: number,
  preMoneyShares: number,
  roundInvestment: number,
  preMoneyValuation: number
): ConvertedInstrumentResult[] {
  const results: ConvertedInstrumentResult[] = [];

  const unconverted = instruments.filter(
    (inst) => !inst.convertedInRoundId
  );

  for (const inst of unconverted) {
    // Calculate principal + accrued interest (notes only)
    let principal = inst.principalAmount;
    if (
      inst.type === ConvertibleInstrumentType.ConvertibleNote &&
      inst.interestRatePercent > 0 &&
      inst.issueDate
    ) {
      const issueDate = new Date(inst.issueDate);
      const now = new Date();
      const yearsElapsed =
        (now.getTime() - issueDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      principal =
        inst.principalAmount * (1 + (inst.interestRatePercent / 100) * yearsElapsed);
    }

    // Calculate conversion price based on cap and discount
    const postMoney = preMoneyValuation + roundInvestment;

    let capPrice = Infinity;
    if (inst.valuationCap && inst.valuationCap > 0) {
      if (inst.type === ConvertibleInstrumentType.PostMoneySAFE) {
        capPrice = inst.valuationCap / (preMoneyShares + principal / roundPricePerShare);
      } else {
        capPrice = inst.valuationCap / preMoneyShares;
      }
    }

    const discountPrice =
      inst.discountPercent > 0
        ? roundPricePerShare * (1 - inst.discountPercent / 100)
        : Infinity;

    let conversionPrice: number;
    let method: "cap" | "discount" | "round-price";

    if (capPrice <= discountPrice && capPrice <= roundPricePerShare) {
      conversionPrice = capPrice;
      method = "cap";
    } else if (discountPrice <= roundPricePerShare) {
      conversionPrice = discountPrice;
      method = "discount";
    } else {
      conversionPrice = roundPricePerShare;
      method = "round-price";
    }

    const sharesIssued = principal / conversionPrice;

    results.push({
      instrumentId: inst.id,
      conversionPrice,
      sharesIssued,
      principalPlusInterest: principal,
      effectiveValuation: conversionPrice * preMoneyShares,
      conversionMethod: method,
    });
  }

  return results;
}

/**
 * Apply anti-dilution adjustments when a down round occurs.
 * Modifies existing preferred entries' conversion ratios.
 */
function applyAntiDilutionAdjustments(
  entries: CapTableEntry[],
  rounds: FundingRound[],
  newRound: FundingRound,
  newPricePerShare: number,
  totalFullyDilutedShares: number
): CapTableEntry[] {
  const roundMap = new Map(rounds.map((r) => [r.id, r]));

  return entries.map((entry) => {
    if (!entry.isPreferred || !entry.roundId) return entry;

    const round = roundMap.get(entry.roundId);
    if (!round) return entry;

    // Only adjust if this is a down round for this investor
    if (newPricePerShare >= entry.pricePerShare) return entry;

    const antiDilution = round.terms.antiDilution;
    if (antiDilution === AntiDilutionType.None) return entry;

    const oldConversionPrice = entry.pricePerShare / entry.conversionRatio;
    let newConversionPrice: number;

    const newInvestorShares = newRound.investmentAmount / newPricePerShare;

    switch (antiDilution) {
      case AntiDilutionType.BroadBasedWeightedAverage:
        newConversionPrice = broadBasedWeightedAverage(
          oldConversionPrice,
          totalFullyDilutedShares,
          newRound.investmentAmount,
          newInvestorShares
        );
        break;
      case AntiDilutionType.NarrowBasedWeightedAverage: {
        const preferredShares = entries
          .filter((e) => e.isPreferred)
          .reduce((sum, e) => sum + e.sharesOwned, 0);
        newConversionPrice = narrowBasedWeightedAverage(
          oldConversionPrice,
          preferredShares,
          newRound.investmentAmount,
          newInvestorShares
        );
        break;
      }
      case AntiDilutionType.FullRatchet:
        newConversionPrice = fullRatchet(newPricePerShare);
        break;
      default:
        return entry;
    }

    // New conversion ratio: how many common shares per preferred share
    const newRatio = oldConversionPrice / newConversionPrice;
    const additionalShares =
      entry.investedCapital / newConversionPrice -
      entry.investedCapital / oldConversionPrice;

    return {
      ...entry,
      conversionRatio: newRatio,
      sharesOwned: entry.sharesOwned + additionalShares,
    };
  });
}

export function buildCapTable(scenario: Scenario): CapTableSnapshot[] {
  const snapshots: CapTableSnapshot[] = [];
  const inception = createInceptionSnapshot(scenario);
  snapshots.push(inception);

  let currentEntries = [...inception.entries];
  let totalShares = scenario.founderShares;
  let poolShares = 0;
  let currentStrikePrice = 0.0001;
  const convertibles = [...(scenario.convertibles || [])];

  for (const round of scenario.rounds) {
    const { pricePerShare, newPoolShares, investorShares, totalSharesAfter } =
      calcOptionPoolExpansion(
        totalShares,
        poolShares,
        round.preMoneyValuation,
        round.investmentAmount,
        round.optionPoolPercent,
        round.optionPoolIsPreMoney
      );

    // Apply anti-dilution if this is a down round
    const prevPricePerShare = snapshots[snapshots.length - 1].pricePerShare;
    if (pricePerShare < prevPricePerShare && snapshots.length > 1) {
      currentEntries = applyAntiDilutionAdjustments(
        currentEntries,
        scenario.rounds,
        round,
        pricePerShare,
        totalShares
      );
      // Recalculate total shares after anti-dilution share expansion
      const totalExistingShares = currentEntries.reduce(
        (sum, e) => sum + e.sharesOwned,
        0
      );
      totalShares =
        totalExistingShares + newPoolShares + investorShares;
    } else {
      poolShares += newPoolShares;
      totalShares = totalSharesAfter;
    }

    if (newPoolShares > 0) {
      poolShares += newPoolShares;
    }

    // Convert any convertible instruments at this round
    const conversions = convertInstruments(
      convertibles,
      round.id,
      pricePerShare,
      totalShares - investorShares,
      round.investmentAmount,
      round.preMoneyValuation
    );

    let convertibleShares = 0;
    const convertibleEntries: CapTableEntry[] = [];
    for (const conv of conversions) {
      convertibleShares += conv.sharesIssued;
      const inst = convertibles.find((c) => c.id === conv.instrumentId);
      if (inst) {
        inst.convertedInRoundId = round.id;
        convertibleEntries.push({
          stakeholder: `${inst.type === "convertible-note" ? "Note" : "SAFE"} — ${inst.investorName}`,
          sharesOwned: conv.sharesIssued,
          ownershipPercent: 0,
          investedCapital: inst.principalAmount,
          pricePerShare: conv.conversionPrice,
          isPreferred: true,
          roundId: round.id,
          conversionRatio: pricePerShare / conv.conversionPrice,
          accruedDividends: 0,
        });
      }
    }

    totalShares += convertibleShares;

    // Create investor entry
    const investorEntry: CapTableEntry = {
      stakeholder: `${round.stage} — ${round.investorName}`,
      sharesOwned: investorShares,
      ownershipPercent: 0,
      investedCapital: round.investmentAmount,
      pricePerShare,
      isPreferred: true,
      roundId: round.id,
      conversionRatio: 1,
      accruedDividends: 0,
    };

    // Rebuild entries
    const nonPoolEntries = currentEntries.filter(
      (e) => e.stakeholder !== "Option Pool"
    );
    const updatedEntries = applyDilution(nonPoolEntries, totalShares);

    const poolEntry = createPoolEntry(poolShares, totalShares, pricePerShare);
    investorEntry.ownershipPercent = (investorShares / totalShares) * 100;

    for (const ce of convertibleEntries) {
      ce.ownershipPercent = (ce.sharesOwned / totalShares) * 100;
    }

    const allEntries = [
      ...updatedEntries,
      poolEntry,
      ...convertibleEntries,
      investorEntry,
    ];

    currentStrikePrice = pricePerShare * 0.25; // 409A is typically ~25-35% of preferred price

    const postMoney = round.preMoneyValuation + round.investmentAmount;

    const grantedShares = (scenario.employeeGrants || []).reduce(
      (sum, g) => sum + g.shareCount,
      0
    );

    const optionPool: OptionPoolState = {
      totalPoolShares: poolShares,
      grantedShares: Math.min(grantedShares, poolShares),
      unallocatedShares: Math.max(0, poolShares - grantedShares),
      poolPercentOfFullyDiluted: (poolShares / totalShares) * 100,
      strikePrice409A: currentStrikePrice,
    };

    const snapshot: CapTableSnapshot = {
      afterRoundId: round.id,
      entries: allEntries,
      optionPool,
      totalSharesOutstanding: totalShares - poolShares,
      totalFullyDilutedShares: totalShares,
      postMoneyValuation: postMoney,
      pricePerShare,
    };

    snapshots.push(snapshot);
    currentEntries = allEntries;
  }

  return snapshots;
}

export function getCapTableAfterRound(
  scenario: Scenario,
  roundId: string
): CapTableSnapshot | null {
  const snapshots = buildCapTable(scenario);
  return snapshots.find((s) => s.afterRoundId === roundId) ?? null;
}

export function getCurrentCapTable(scenario: Scenario): CapTableSnapshot {
  const snapshots = buildCapTable(scenario);
  return snapshots[snapshots.length - 1];
}
