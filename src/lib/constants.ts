import {
  AntiDilutionType,
  FundingRound,
  LiquidationPreferenceType,
  RoundStage,
  SeniorityType,
  TermSheet,
} from "./engine/types";

export const STAKEHOLDER_COLORS: Record<string, string> = {
  Founders: "#2563eb",
  "Option Pool": "#8b5cf6",
  "Pre-Seed": "#f59e0b",
  Seed: "#10b981",
  "Series A": "#ef4444",
  "Series B": "#ec4899",
  "Series C": "#06b6d4",
  "Series D+": "#f97316",
  Note: "#84cc16",
  SAFE: "#a3e635",
};

export function getStakeholderColor(stakeholder: string): string {
  for (const [key, color] of Object.entries(STAKEHOLDER_COLORS)) {
    if (stakeholder.includes(key)) return color;
  }
  // Fallback colors
  const fallback = ["#64748b", "#0ea5e9", "#a855f7", "#14b8a6", "#f43f5e"];
  const hash = stakeholder.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return fallback[hash % fallback.length];
}

export const DEFAULT_FOUNDER_SHARES = 10_000_000;

export const EXIT_VALUE_RANGE = {
  min: 0,
  max: 500_000_000,
  default: 50_000_000,
};

export const DEFAULT_TERMS: TermSheet = {
  liquidationMultiple: 1,
  liquidationType: LiquidationPreferenceType.NonParticipating,
  participationCap: null,
  antiDilution: AntiDilutionType.BroadBasedWeightedAverage,
  hasProRataRights: true,
  seniorityRank: 1,
  seniorityType: SeniorityType.Standard,
  dividends: {
    enabled: false,
    ratePercent: 8,
    cumulative: false,
    compounding: false,
  },
  payToPlay: false,
  hasDragAlong: false,
  hasTagAlong: false,
  protectiveProvisions: true,
  boardSeats: 0,
  hasRedemptionRights: false,
  redemptionStartYear: null,
};

export const ROUND_PRESETS: Record<RoundStage, Partial<FundingRound>> = {
  [RoundStage.PreSeed]: {
    preMoneyValuation: 4_000_000,
    investmentAmount: 500_000,
    optionPoolPercent: 10,
    optionPoolIsPreMoney: true,
  },
  [RoundStage.Seed]: {
    preMoneyValuation: 8_000_000,
    investmentAmount: 2_000_000,
    optionPoolPercent: 10,
    optionPoolIsPreMoney: true,
  },
  [RoundStage.SeriesA]: {
    preMoneyValuation: 30_000_000,
    investmentAmount: 8_000_000,
    optionPoolPercent: 10,
    optionPoolIsPreMoney: true,
  },
  [RoundStage.SeriesB]: {
    preMoneyValuation: 80_000_000,
    investmentAmount: 25_000_000,
    optionPoolPercent: 5,
    optionPoolIsPreMoney: true,
  },
  [RoundStage.SeriesC]: {
    preMoneyValuation: 250_000_000,
    investmentAmount: 50_000_000,
    optionPoolPercent: 3,
    optionPoolIsPreMoney: true,
  },
  [RoundStage.SeriesD]: {
    preMoneyValuation: 500_000_000,
    investmentAmount: 100_000_000,
    optionPoolPercent: 2,
    optionPoolIsPreMoney: true,
  },
};

export const GLOSSARY: Record<string, string> = {
  // Valuation
  "Pre-Money Valuation":
    "The company's valuation before the new investment is added. This is the price tag investors and founders agree on before the money comes in.",
  "Post-Money Valuation":
    "Pre-money valuation plus the investment amount. This represents the company's value immediately after the round closes.",
  "409A Valuation":
    "An independent appraisal of the fair market value of a company's common stock, required by IRS Section 409A. Used to set the strike price for stock options. Typically 25-35% of the most recent preferred price for early-stage companies.",
  "Price Per Share":
    "The cost of one share of stock in a given round. Calculated as the pre-money valuation divided by the total pre-money shares outstanding (including the option pool if pre-money).",

  // Option Pool
  "Option Pool":
    "Shares reserved for future employee grants (stock options). The pool is typically 10-20% of fully diluted shares.",
  "Option Pool Shuffle":
    "When the option pool is created from the pre-money valuation, it effectively reduces the founders' valuation while the investor's ownership is calculated on the post-money. This is standard practice in most VC deals.",

  // Liquidation Preferences
  "Liquidation Preference":
    "The amount investors get paid before common shareholders in an exit. A 1x preference means they get their money back first; 2x means double their investment back first.",
  "Non-Participating Preferred":
    "Investors choose the greater of: (1) their liquidation preference, or (2) converting to common stock and sharing pro rata. They cannot do both.",
  "Participating Preferred":
    'Investors get their liquidation preference AND share in the remaining proceeds on an as-converted basis. Sometimes called "double dipping."',
  "Capped Participating":
    "Like participating preferred, but total proceeds are capped at a multiple of the original investment (e.g., 3x cap). Once the cap is reached, the investor would typically convert to common.",

  // Anti-Dilution
  "Anti-Dilution":
    "Protection for investors if the company raises a future round at a lower price (a down round). Adjusts the investor's conversion ratio to compensate for the price drop.",
  "Broad-Based Weighted Average":
    "The most common (and founder-friendly) anti-dilution formula. It adjusts the conversion price based on the weighted average of the old and new prices, using all fully diluted shares in the calculation.",
  "Narrow-Based Weighted Average":
    "Similar to broad-based but uses only preferred shares outstanding (not all fully diluted shares) in the calculation. More investor-friendly.",
  "Full Ratchet":
    "The most aggressive anti-dilution protection. Reprices the investor's shares entirely to the new lower price, regardless of how small the down round is.",

  // Conversion & Voting
  Conversion:
    "When preferred shareholders convert their shares to common stock, typically to get a larger share of exit proceeds when the exit value is high enough.",
  "Conversion Ratio":
    "The number of common shares each preferred share converts into. Starts at 1:1 but can increase through anti-dilution adjustments in a down round.",
  "Pro-Rata Rights":
    "The right for existing investors to invest in future rounds to maintain their ownership percentage.",

  // Seniority & Structure
  Seniority:
    "The order in which investor classes get paid in a liquidation. Senior investors are paid before junior investors.",
  "Pari Passu":
    "Latin for 'on equal footing.' When multiple investor classes share the same seniority rank, they split the available proceeds pro-rata rather than in a strict order.",
  "Standard Seniority":
    "Later rounds are paid before earlier rounds in a liquidation waterfall. Series B gets paid before Series A, which gets paid before Seed.",

  // Dividends
  Dividends:
    "Periodic payments to preferred shareholders, usually expressed as an annual percentage of the original investment. Can be cumulative (accruing whether or not declared) or non-cumulative.",
  "Cumulative Dividends":
    "Dividends that accrue over time whether or not they are actually paid out. They accumulate and are added to the liquidation preference at exit. Compounding dividends earn interest on prior unpaid dividends.",

  // Convertible Instruments
  "Convertible Note":
    "A short-term debt instrument that converts into equity at a future financing round. Typically includes a valuation cap, discount rate, and interest rate. The interest accrues and converts alongside the principal.",
  "Pre-Money SAFE":
    "Simple Agreement for Future Equity. Converts at the next priced round. The valuation cap is applied to pre-money shares, meaning all SAFE holders dilute each other.",
  "Post-Money SAFE":
    "A SAFE where the valuation cap is applied to post-money capitalization (including the SAFE itself). This gives the investor a known ownership percentage at the cap price, regardless of how many SAFEs are issued.",
  "Valuation Cap":
    "The maximum valuation at which a convertible note or SAFE will convert. If the next round prices above the cap, the instrument converts at the cap, giving the holder more shares.",
  "Discount Rate":
    "A percentage discount on the next round's price per share that convertible holders receive. For example, a 20% discount means they convert at 80% of the round price.",
  "MFN Clause":
    "Most Favored Nation. Gives the SAFE holder the right to adopt the terms of any subsequently issued SAFE if those terms are more favorable.",

  // Employee Equity
  "Stock Options":
    "The right to purchase company shares at a fixed price (the strike price) after vesting. ISOs (Incentive Stock Options) have favorable tax treatment for employees; NSOs (Non-Qualified Stock Options) are taxed as ordinary income.",
  "Strike Price":
    "The price at which an option holder can purchase shares. Set based on the 409A fair market value at the time of the grant.",
  RSU: "Restricted Stock Unit. A promise to deliver shares (or cash equivalent) after vesting. Unlike options, RSUs have value even if the stock price doesn't increase above the grant price.",
  Vesting:
    "The process of earning ownership over time. Standard is 4 years with a 1-year cliff: 25% vests after 12 months, then the remainder vests monthly over the next 36 months.",
  Cliff:
    "The minimum period before any shares vest. Typically 12 months for employee grants. If an employee leaves before the cliff, they receive nothing.",
  "83(b) Election":
    "An IRS tax election that allows founders to pay taxes on restricted stock at grant (when value is low) rather than at vesting (when value may be much higher). Must be filed within 30 days of the stock grant.",

  // Governance & Control
  "Pay-to-Play":
    "A provision requiring investors to participate in future funding rounds (pro-rata) or face conversion of their preferred shares to common stock, losing their preferential rights.",
  "Drag-Along Rights":
    "Allows majority shareholders (often the board or a supermajority of preferred) to force minority shareholders to join in the sale of the company.",
  "Tag-Along Rights":
    "Allows minority shareholders to join a transaction if a majority shareholder sells their stake. Protects minority investors from being left behind in favorable deals.",
  "Protective Provisions":
    "Veto rights that give preferred shareholders the ability to block certain company actions (e.g., issuing new stock, taking on debt, changing the charter, or selling the company).",
  "Board Seats":
    "The number of seats on the board of directors granted to investors in a funding round. Gives investors formal governance power and oversight.",
  "Redemption Rights":
    "The right for investors to require the company to repurchase their shares after a specified period (typically 5-7 years). A safety valve if no exit has occurred.",

  // Exit & Distribution
  MOIC: "Multiple on Invested Capital. Total proceeds divided by the amount invested. A 3x MOIC means the investor received 3 times their original investment.",
  "Fully Diluted":
    "Total share count including all outstanding shares, options (granted and ungranted), warrants, and any other convertible instruments.",
  "Transaction Costs":
    "Fees paid to investment bankers, lawyers, accountants, and other advisors during an exit event. Typically 1-5% of the deal value.",
  Escrow:
    "A portion of the exit proceeds held back (typically 10-15%) to cover potential post-closing indemnification claims or purchase price adjustments.",
  "Management Carve-Out":
    "A bonus pool set aside from exit proceeds for key employees and management, paid before the waterfall distribution to incentivize them to close the deal.",
  Earnout:
    "A portion of the acquisition price that is contingent on the company meeting certain performance milestones after closing. Common in acqui-hires or when buyer and seller disagree on valuation.",
  "Exit Types":
    "Acquisition (company sold), IPO (public offering where all preferred converts to common), Dissolution (company shuts down, minimal proceeds), Acqui-hire (talent acquisition with small exit value and large management carve-out).",
};
