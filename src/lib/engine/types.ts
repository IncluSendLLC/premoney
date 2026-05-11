// ============================================================
// ENUMS
// ============================================================

export enum RoundStage {
  PreSeed = "Pre-Seed",
  Seed = "Seed",
  SeriesA = "Series A",
  SeriesB = "Series B",
  SeriesC = "Series C",
  SeriesD = "Series D+",
}

export enum LiquidationPreferenceType {
  NonParticipating = "non-participating",
  Participating = "participating",
  CappedParticipating = "capped-participating",
}

export enum AntiDilutionType {
  None = "none",
  BroadBasedWeightedAverage = "broad-based-weighted-average",
  NarrowBasedWeightedAverage = "narrow-based-weighted-average",
  FullRatchet = "full-ratchet",
}

export enum SeniorityType {
  PariPassu = "pari-passu",
  Standard = "standard",
}

export enum ExitType {
  Acquisition = "acquisition",
  IPO = "ipo",
  Dissolution = "dissolution",
  AcquiHire = "acqui-hire",
}

export enum ConvertibleInstrumentType {
  ConvertibleNote = "convertible-note",
  PreMoneySAFE = "pre-money-safe",
  PostMoneySAFE = "post-money-safe",
}

export enum OptionType {
  ISO = "iso",
  NSO = "nso",
  RSU = "rsu",
}

// ============================================================
// TERM SHEET
// ============================================================

export interface DividendTerms {
  enabled: boolean;
  ratePercent: number; // annual rate, e.g. 8
  cumulative: boolean; // cumulative (accrues) vs non-cumulative
  compounding: boolean; // whether dividends compound
}

export interface TermSheet {
  liquidationMultiple: number;
  liquidationType: LiquidationPreferenceType;
  participationCap: number | null;
  antiDilution: AntiDilutionType;
  hasProRataRights: boolean;
  seniorityRank: number;
  seniorityType: SeniorityType;
  dividends: DividendTerms;
  payToPlay: boolean;
  hasDragAlong: boolean;
  hasTagAlong: boolean;
  protectiveProvisions: boolean;
  boardSeats: number;
  hasRedemptionRights: boolean;
  redemptionStartYear: number | null; // years after investment
}

// ============================================================
// FUNDING ROUNDS
// ============================================================

export interface FundingRound {
  id: string;
  stage: RoundStage;
  investorName: string;
  preMoneyValuation: number;
  investmentAmount: number;
  optionPoolPercent: number;
  optionPoolIsPreMoney: boolean;
  terms: TermSheet;
}

// ============================================================
// CONVERTIBLE INSTRUMENTS (Notes & SAFEs)
// ============================================================

export interface ConvertibleInstrument {
  id: string;
  type: ConvertibleInstrumentType;
  investorName: string;
  principalAmount: number;
  valuationCap: number | null;
  discountPercent: number; // e.g. 20 for 20% discount
  interestRatePercent: number; // annual, 0 for SAFEs
  issueDate: string; // ISO date
  maturityDate: string | null; // ISO date, null for SAFEs
  mfnClause: boolean; // most favored nation (SAFEs)
  convertedInRoundId: string | null; // which round triggered conversion
}

export interface ConvertedInstrumentResult {
  instrumentId: string;
  conversionPrice: number;
  sharesIssued: number;
  principalPlusInterest: number;
  effectiveValuation: number;
  conversionMethod: "cap" | "discount" | "round-price";
}

// ============================================================
// FOUNDERS & EMPLOYEE EQUITY
// ============================================================

export interface Founder {
  id: string;
  name: string;
  sharesAllocated: number;
  vestingMonths: number;
  cliffMonths: number;
  monthsVested: number; // how many months have elapsed
  filed83b: boolean;
}

export interface EmployeeGrant {
  id: string;
  employeeName: string;
  shareCount: number;
  optionType: OptionType;
  strikePrice: number; // 409A FMV at grant
  vestingMonths: number;
  cliffMonths: number;
  monthsVested: number;
  grantDate: string;
}

// ============================================================
// CAP TABLE
// ============================================================

export interface CapTableEntry {
  stakeholder: string;
  sharesOwned: number;
  ownershipPercent: number;
  investedCapital: number;
  pricePerShare: number;
  isPreferred: boolean;
  roundId: string | null;
  conversionRatio: number; // preferred-to-common ratio, default 1.0
  accruedDividends: number; // accumulated unpaid dividends
}

export interface OptionPoolState {
  totalPoolShares: number;
  grantedShares: number;
  unallocatedShares: number;
  poolPercentOfFullyDiluted: number;
  strikePrice409A: number; // current 409A valuation per share
}

export interface CapTableSnapshot {
  afterRoundId: string | null;
  entries: CapTableEntry[];
  optionPool: OptionPoolState;
  totalSharesOutstanding: number;
  totalFullyDilutedShares: number;
  postMoneyValuation: number;
  pricePerShare: number;
}

// ============================================================
// EXIT / WATERFALL
// ============================================================

export interface ExitConfig {
  exitValue: number;
  exitType: ExitType;
  transactionCostPercent: number; // investment banking fees, legal, etc.
  escrowPercent: number; // holdback for indemnification
  managementCarveout: number; // dollar amount carved out for management
  earnoutAmount: number; // contingent portion of deal
  earnoutProbabilityPercent: number; // estimated probability of earnout
  yearsFromFirstRound: number; // for dividend accrual calculation
}

export interface WaterfallProceeds {
  stakeholder: string;
  roundId: string | null;
  proceedsFromPreference: number;
  proceedsFromParticipation: number;
  proceedsFromConversion: number;
  proceedsFromCarveout: number;
  totalProceeds: number;
  didConvert: boolean;
  moic: number;
  investedCapital: number;
  accruedDividends: number;
}

export interface WaterfallResult {
  exitValue: number;
  netExitValue: number; // after transaction costs, escrow
  transactionCosts: number;
  escrowHoldback: number;
  managementCarveout: number;
  proceeds: WaterfallProceeds[];
  remainingToCommon: number;
}

export interface WaterfallRangePoint {
  exitValue: number;
  [stakeholder: string]: number;
}

// ============================================================
// SCENARIO
// ============================================================

export interface Scenario {
  id: string;
  name: string;
  rounds: FundingRound[];
  convertibles: ConvertibleInstrument[];
  founders: Founder[];
  employeeGrants: EmployeeGrant[];
  founderShares: number;
  exitConfig: ExitConfig;
}
