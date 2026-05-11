"use client";

import { useState, useCallback } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { CurrencyInput } from "@/components/shared/currency-input";
import { InfoTooltip } from "@/components/shared/info-tooltip";
import {
  AntiDilutionType,
  FundingRound,
  LiquidationPreferenceType,
  RoundStage,
  SeniorityType,
} from "@/lib/engine/types";
import { GLOSSARY, ROUND_PRESETS, DEFAULT_TERMS } from "@/lib/constants";
import { formatCurrency } from "@/lib/formatters";

interface RoundFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (round: FundingRound) => void;
  initialRound?: FundingRound;
  roundNumber: number;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export function RoundForm({
  open,
  onClose,
  onSave,
  initialRound,
  roundNumber,
}: RoundFormProps) {
  const isEditing = !!initialRound;

  // Basic round fields
  const [stage, setStage] = useState<RoundStage>(
    initialRound?.stage ?? RoundStage.Seed
  );
  const [investorName, setInvestorName] = useState(
    initialRound?.investorName ?? ""
  );
  const [preMoneyValuation, setPreMoneyValuation] = useState(
    initialRound?.preMoneyValuation ?? 8_000_000
  );
  const [investmentAmount, setInvestmentAmount] = useState(
    initialRound?.investmentAmount ?? 2_000_000
  );
  const [optionPoolPercent, setOptionPoolPercent] = useState(
    initialRound?.optionPoolPercent ?? 10
  );
  const [optionPoolIsPreMoney, setOptionPoolIsPreMoney] = useState(
    initialRound?.optionPoolIsPreMoney ?? true
  );

  // Core term sheet
  const [liquidationMultiple, setLiquidationMultiple] = useState(
    initialRound?.terms.liquidationMultiple ?? 1
  );
  const [liquidationType, setLiquidationType] =
    useState<LiquidationPreferenceType>(
      initialRound?.terms.liquidationType ??
        LiquidationPreferenceType.NonParticipating
    );
  const [participationCap, setParticipationCap] = useState<number | null>(
    initialRound?.terms.participationCap ?? null
  );
  const [antiDilution, setAntiDilution] = useState<AntiDilutionType>(
    initialRound?.terms.antiDilution ??
      AntiDilutionType.BroadBasedWeightedAverage
  );
  const [hasProRataRights, setHasProRataRights] = useState(
    initialRound?.terms.hasProRataRights ?? true
  );
  const [seniorityType, setSeniorityType] = useState<SeniorityType>(
    initialRound?.terms.seniorityType ?? SeniorityType.Standard
  );

  // Dividends
  const [dividendsEnabled, setDividendsEnabled] = useState(
    initialRound?.terms.dividends?.enabled ?? false
  );
  const [dividendRate, setDividendRate] = useState(
    initialRound?.terms.dividends?.ratePercent ?? 8
  );
  const [dividendCumulative, setDividendCumulative] = useState(
    initialRound?.terms.dividends?.cumulative ?? false
  );
  const [dividendCompounding, setDividendCompounding] = useState(
    initialRound?.terms.dividends?.compounding ?? false
  );

  // Governance & advanced
  const [payToPlay, setPayToPlay] = useState(
    initialRound?.terms.payToPlay ?? false
  );
  const [hasDragAlong, setHasDragAlong] = useState(
    initialRound?.terms.hasDragAlong ?? false
  );
  const [hasTagAlong, setHasTagAlong] = useState(
    initialRound?.terms.hasTagAlong ?? false
  );
  const [protectiveProvisions, setProtectiveProvisions] = useState(
    initialRound?.terms.protectiveProvisions ?? true
  );
  const [boardSeats, setBoardSeats] = useState(
    initialRound?.terms.boardSeats ?? 0
  );
  const [hasRedemptionRights, setHasRedemptionRights] = useState(
    initialRound?.terms.hasRedemptionRights ?? false
  );
  const [redemptionStartYear, setRedemptionStartYear] = useState<
    number | null
  >(initialRound?.terms.redemptionStartYear ?? 5);

  const handleStageChange = useCallback(
    (newStage: RoundStage) => {
      setStage(newStage);
      if (!isEditing) {
        const preset = ROUND_PRESETS[newStage];
        if (preset.preMoneyValuation)
          setPreMoneyValuation(preset.preMoneyValuation);
        if (preset.investmentAmount)
          setInvestmentAmount(preset.investmentAmount);
        if (preset.optionPoolPercent !== undefined)
          setOptionPoolPercent(preset.optionPoolPercent);
      }
    },
    [isEditing]
  );

  const handleSave = useCallback(() => {
    const round: FundingRound = {
      id: initialRound?.id ?? generateId(),
      stage,
      investorName: investorName.trim() || `${stage} Investor`,
      preMoneyValuation,
      investmentAmount,
      optionPoolPercent,
      optionPoolIsPreMoney,
      terms: {
        liquidationMultiple,
        liquidationType,
        participationCap:
          liquidationType === LiquidationPreferenceType.CappedParticipating
            ? participationCap
            : null,
        antiDilution,
        hasProRataRights,
        seniorityRank: initialRound?.terms.seniorityRank ?? roundNumber,
        seniorityType,
        dividends: {
          enabled: dividendsEnabled,
          ratePercent: dividendRate,
          cumulative: dividendCumulative,
          compounding: dividendCompounding,
        },
        payToPlay,
        hasDragAlong,
        hasTagAlong,
        protectiveProvisions,
        boardSeats,
        hasRedemptionRights,
        redemptionStartYear: hasRedemptionRights ? redemptionStartYear : null,
      },
    };
    onSave(round);
    onClose();
  }, [
    initialRound,
    stage,
    investorName,
    preMoneyValuation,
    investmentAmount,
    optionPoolPercent,
    optionPoolIsPreMoney,
    liquidationMultiple,
    liquidationType,
    participationCap,
    antiDilution,
    hasProRataRights,
    seniorityType,
    dividendsEnabled,
    dividendRate,
    dividendCumulative,
    dividendCompounding,
    payToPlay,
    hasDragAlong,
    hasTagAlong,
    protectiveProvisions,
    boardSeats,
    hasRedemptionRights,
    redemptionStartYear,
    roundNumber,
    onSave,
    onClose,
  ]);

  const postMoney = preMoneyValuation + investmentAmount;

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {isEditing ? "Edit Round" : "Add Funding Round"}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Basic info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stage">Round Stage</Label>
              <Select
                value={stage}
                onValueChange={(v) => v && handleStageChange(v as RoundStage)}
              >
                <SelectTrigger id="stage">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(RoundStage).map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="investor">Investor Name</Label>
              <Input
                id="investor"
                value={investorName}
                onChange={(e) => setInvestorName(e.target.value)}
                placeholder={`${stage} Investor`}
              />
            </div>
          </div>

          <Separator />

          {/* Valuation */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Valuation</h3>

            <div className="space-y-2">
              <Label htmlFor="premoney" className="flex items-center">
                Pre-Money Valuation
                <InfoTooltip
                  term="Pre-Money Valuation"
                  definition={GLOSSARY["Pre-Money Valuation"]}
                />
              </Label>
              <CurrencyInput
                id="premoney"
                value={preMoneyValuation}
                onChange={setPreMoneyValuation}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="investment">Investment Amount</Label>
              <CurrencyInput
                id="investment"
                value={investmentAmount}
                onChange={setInvestmentAmount}
              />
            </div>

            <div className="rounded-lg bg-muted p-3 text-sm">
              <span className="text-muted-foreground">Post-Money: </span>
              <span className="font-medium">
                {formatCurrency(postMoney, true)}
              </span>
              <InfoTooltip
                term="Post-Money Valuation"
                definition={GLOSSARY["Post-Money Valuation"]}
              />
            </div>
          </div>

          <Separator />

          {/* Option Pool */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center">
              Option Pool
              <InfoTooltip
                term="Option Pool"
                definition={GLOSSARY["Option Pool"]}
              />
            </h3>

            <div className="space-y-2">
              <Label htmlFor="poolPercent">Target Pool %</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="poolPercent"
                  type="number"
                  min={0}
                  max={50}
                  value={optionPoolPercent}
                  onChange={(e) =>
                    setOptionPoolPercent(parseFloat(e.target.value) || 0)
                  }
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">
                  % of post-money
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="poolShuffle"
                checked={optionPoolIsPreMoney}
                onCheckedChange={setOptionPoolIsPreMoney}
              />
              <Label htmlFor="poolShuffle" className="flex items-center">
                Pre-money pool (option pool shuffle)
                <InfoTooltip
                  term="Option Pool Shuffle"
                  definition={GLOSSARY["Option Pool Shuffle"]}
                />
              </Label>
            </div>
          </div>

          <Separator />

          {/* Term Sheet */}
          <Accordion defaultValue={["terms"]}>
            <AccordionItem value="terms">
              <AccordionTrigger className="text-sm font-medium">
                Liquidation & Anti-Dilution
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                {/* Liquidation Preference */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium flex items-center">
                    Liquidation Preference
                    <InfoTooltip
                      term="Liquidation Preference"
                      definition={GLOSSARY["Liquidation Preference"]}
                    />
                  </h4>

                  <div className="space-y-2">
                    <Label htmlFor="liqMult">Multiple</Label>
                    <Select
                      value={liquidationMultiple.toString()}
                      onValueChange={(v) =>
                        v && setLiquidationMultiple(parseFloat(v))
                      }
                    >
                      <SelectTrigger id="liqMult">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1x</SelectItem>
                        <SelectItem value="1.5">1.5x</SelectItem>
                        <SelectItem value="2">2x</SelectItem>
                        <SelectItem value="3">3x</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="liqType">Type</Label>
                    <Select
                      value={liquidationType}
                      onValueChange={(v) =>
                        v &&
                        setLiquidationType(v as LiquidationPreferenceType)
                      }
                    >
                      <SelectTrigger id="liqType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          value={LiquidationPreferenceType.NonParticipating}
                        >
                          Non-Participating
                        </SelectItem>
                        <SelectItem
                          value={LiquidationPreferenceType.Participating}
                        >
                          Participating
                        </SelectItem>
                        <SelectItem
                          value={LiquidationPreferenceType.CappedParticipating}
                        >
                          Capped Participating
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {liquidationType ===
                    LiquidationPreferenceType.CappedParticipating && (
                    <div className="space-y-2">
                      <Label htmlFor="partCap">
                        Participation Cap
                        <InfoTooltip
                          term="Capped Participating"
                          definition={GLOSSARY["Capped Participating"]}
                        />
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="partCap"
                          type="number"
                          min={1}
                          max={10}
                          step={0.5}
                          value={participationCap ?? 3}
                          onChange={(e) =>
                            setParticipationCap(
                              parseFloat(e.target.value) || 3
                            )
                          }
                          className="w-24"
                        />
                        <span className="text-sm text-muted-foreground">
                          x invested capital
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Anti-Dilution */}
                <div className="space-y-2">
                  <Label htmlFor="antiDilution" className="flex items-center">
                    Anti-Dilution Protection
                    <InfoTooltip
                      term="Anti-Dilution"
                      definition={GLOSSARY["Anti-Dilution"]}
                    />
                  </Label>
                  <Select
                    value={antiDilution}
                    onValueChange={(v) =>
                      v && setAntiDilution(v as AntiDilutionType)
                    }
                  >
                    <SelectTrigger id="antiDilution">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={AntiDilutionType.None}>
                        None
                      </SelectItem>
                      <SelectItem
                        value={AntiDilutionType.BroadBasedWeightedAverage}
                      >
                        Broad-Based Weighted Average
                      </SelectItem>
                      <SelectItem
                        value={AntiDilutionType.NarrowBasedWeightedAverage}
                      >
                        Narrow-Based Weighted Average
                      </SelectItem>
                      <SelectItem value={AntiDilutionType.FullRatchet}>
                        Full Ratchet
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Seniority */}
                <div className="space-y-2">
                  <Label htmlFor="seniorityType" className="flex items-center">
                    Seniority Type
                    <InfoTooltip
                      term="Seniority"
                      definition={GLOSSARY["Seniority"]}
                    />
                  </Label>
                  <Select
                    value={seniorityType}
                    onValueChange={(v) =>
                      v && setSeniorityType(v as SeniorityType)
                    }
                  >
                    <SelectTrigger id="seniorityType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={SeniorityType.Standard}>
                        Standard (stacked)
                      </SelectItem>
                      <SelectItem value={SeniorityType.PariPassu}>
                        Pari Passu (equal footing)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Pro-Rata */}
                <div className="flex items-center gap-3">
                  <Switch
                    id="proRata"
                    checked={hasProRataRights}
                    onCheckedChange={setHasProRataRights}
                  />
                  <Label htmlFor="proRata" className="flex items-center">
                    Pro-Rata Rights
                    <InfoTooltip
                      term="Pro-Rata Rights"
                      definition={GLOSSARY["Pro-Rata Rights"]}
                    />
                  </Label>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="dividends">
              <AccordionTrigger className="text-sm font-medium">
                Dividends
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <div className="flex items-center gap-3">
                  <Switch
                    id="dividendsEnabled"
                    checked={dividendsEnabled}
                    onCheckedChange={setDividendsEnabled}
                  />
                  <Label
                    htmlFor="dividendsEnabled"
                    className="flex items-center"
                  >
                    Enable Dividends
                    <InfoTooltip
                      term="Dividends"
                      definition={GLOSSARY["Dividends"]}
                    />
                  </Label>
                </div>

                {dividendsEnabled && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="divRate">Annual Rate</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="divRate"
                          type="number"
                          min={0}
                          max={25}
                          step={0.5}
                          value={dividendRate}
                          onChange={(e) =>
                            setDividendRate(parseFloat(e.target.value) || 0)
                          }
                          className="w-24"
                        />
                        <span className="text-sm text-muted-foreground">
                          % per year
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Switch
                        id="divCumulative"
                        checked={dividendCumulative}
                        onCheckedChange={setDividendCumulative}
                      />
                      <Label
                        htmlFor="divCumulative"
                        className="flex items-center"
                      >
                        Cumulative
                        <InfoTooltip
                          term="Cumulative Dividends"
                          definition={GLOSSARY["Cumulative Dividends"]}
                        />
                      </Label>
                    </div>

                    {dividendCumulative && (
                      <div className="flex items-center gap-3">
                        <Switch
                          id="divCompounding"
                          checked={dividendCompounding}
                          onCheckedChange={setDividendCompounding}
                        />
                        <Label htmlFor="divCompounding">Compounding</Label>
                      </div>
                    )}
                  </>
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="governance">
              <AccordionTrigger className="text-sm font-medium">
                Governance & Control
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <div className="flex items-center gap-3">
                  <Switch
                    id="payToPlay"
                    checked={payToPlay}
                    onCheckedChange={setPayToPlay}
                  />
                  <Label htmlFor="payToPlay" className="flex items-center">
                    Pay-to-Play
                    <InfoTooltip
                      term="Pay-to-Play"
                      definition={GLOSSARY["Pay-to-Play"]}
                    />
                  </Label>
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    id="dragAlong"
                    checked={hasDragAlong}
                    onCheckedChange={setHasDragAlong}
                  />
                  <Label htmlFor="dragAlong" className="flex items-center">
                    Drag-Along Rights
                    <InfoTooltip
                      term="Drag-Along Rights"
                      definition={GLOSSARY["Drag-Along Rights"]}
                    />
                  </Label>
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    id="tagAlong"
                    checked={hasTagAlong}
                    onCheckedChange={setHasTagAlong}
                  />
                  <Label htmlFor="tagAlong" className="flex items-center">
                    Tag-Along Rights
                    <InfoTooltip
                      term="Tag-Along Rights"
                      definition={GLOSSARY["Tag-Along Rights"]}
                    />
                  </Label>
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    id="protectiveProvisions"
                    checked={protectiveProvisions}
                    onCheckedChange={setProtectiveProvisions}
                  />
                  <Label
                    htmlFor="protectiveProvisions"
                    className="flex items-center"
                  >
                    Protective Provisions
                    <InfoTooltip
                      term="Protective Provisions"
                      definition={GLOSSARY["Protective Provisions"]}
                    />
                  </Label>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="boardSeats" className="flex items-center">
                    Board Seats
                    <InfoTooltip
                      term="Board Seats"
                      definition={GLOSSARY["Board Seats"]}
                    />
                  </Label>
                  <Input
                    id="boardSeats"
                    type="number"
                    min={0}
                    max={5}
                    value={boardSeats}
                    onChange={(e) =>
                      setBoardSeats(parseInt(e.target.value) || 0)
                    }
                    className="w-24"
                  />
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <Switch
                    id="redemptionRights"
                    checked={hasRedemptionRights}
                    onCheckedChange={setHasRedemptionRights}
                  />
                  <Label
                    htmlFor="redemptionRights"
                    className="flex items-center"
                  >
                    Redemption Rights
                    <InfoTooltip
                      term="Redemption Rights"
                      definition={GLOSSARY["Redemption Rights"]}
                    />
                  </Label>
                </div>

                {hasRedemptionRights && (
                  <div className="space-y-2">
                    <Label htmlFor="redemptionYear">
                      Starts After Year
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="redemptionYear"
                        type="number"
                        min={1}
                        max={10}
                        value={redemptionStartYear ?? 5}
                        onChange={(e) =>
                          setRedemptionStartYear(
                            parseInt(e.target.value) || 5
                          )
                        }
                        className="w-24"
                      />
                      <span className="text-sm text-muted-foreground">
                        years after investment
                      </span>
                    </div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Button onClick={handleSave} className="w-full">
            {isEditing ? "Update Round" : "Add Round"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
