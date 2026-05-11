/**
 * Broad-based weighted average anti-dilution.
 *
 * NCP = OCP * (CSO + ($ / OCP)) / (CSO + NS)
 *
 * Where:
 *   NCP = New Conversion Price
 *   OCP = Old Conversion Price
 *   CSO = Common Stock Outstanding (fully diluted — broad-based includes all options/warrants)
 *   $   = New money raised
 *   NS  = New shares issued at the lower price
 */
export function broadBasedWeightedAverage(
  oldConversionPrice: number,
  commonStockOutstanding: number,
  newMoneyRaised: number,
  newSharesIssued: number
): number {
  const numerator =
    commonStockOutstanding + newMoneyRaised / oldConversionPrice;
  const denominator = commonStockOutstanding + newSharesIssued;
  return oldConversionPrice * (numerator / denominator);
}

/**
 * Narrow-based weighted average anti-dilution.
 * Same formula but CSO only includes outstanding preferred shares
 * (excludes options, warrants, and common).
 */
export function narrowBasedWeightedAverage(
  oldConversionPrice: number,
  preferredSharesOutstanding: number,
  newMoneyRaised: number,
  newSharesIssued: number
): number {
  const numerator =
    preferredSharesOutstanding + newMoneyRaised / oldConversionPrice;
  const denominator = preferredSharesOutstanding + newSharesIssued;
  return oldConversionPrice * (numerator / denominator);
}

/**
 * Full ratchet: new conversion price = price of the down round.
 */
export function fullRatchet(newPricePerShare: number): number {
  return newPricePerShare;
}

/**
 * Calculate the additional shares an investor receives due to anti-dilution adjustment.
 * When the conversion price drops, the investor effectively gets more shares
 * for the same invested capital.
 */
export function calcAntiDilutionShares(
  investedCapital: number,
  oldConversionPrice: number,
  newConversionPrice: number
): number {
  const oldShares = investedCapital / oldConversionPrice;
  const newShares = investedCapital / newConversionPrice;
  return newShares - oldShares;
}
