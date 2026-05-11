"use client";

import { useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useSimulatorStore } from "@/lib/store/simulator-store";
import { useWaterfall } from "@/hooks/use-waterfall";
import { WaterfallChart } from "@/components/waterfall/waterfall-chart";
import { WaterfallTable } from "@/components/waterfall/waterfall-table";
import { InfoTooltip } from "@/components/shared/info-tooltip";
import { CurrencyInput } from "@/components/shared/currency-input";
import { formatCurrency, formatMultiple } from "@/lib/formatters";
import { GLOSSARY, EXIT_VALUE_RANGE } from "@/lib/constants";
import { ExitType } from "@/lib/engine/types";

export default function WaterfallPage() {
  const rounds = useSimulatorStore((s) => s.rounds);
  const exitValue = useSimulatorStore((s) => s.exitValue);
  const exitConfig = useSimulatorStore((s) => s.exitConfig);
  const setExitValue = useSimulatorStore((s) => s.setExitValue);
  const setExitConfig = useSimulatorStore((s) => s.setExitConfig);
  const { waterfallResult, waterfallRange } = useWaterfall();

  const handleSliderChange = useCallback(
    (value: number | readonly number[]) => {
      setExitValue(Array.isArray(value) ? value[0] : value);
    },
    [setExitValue]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value.replace(/[^0-9]/g, ""));
      if (!isNaN(val)) setExitValue(val);
    },
    [setExitValue]
  );

  if (rounds.length === 0) {
    return (
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold mb-2">Exit Waterfall</h1>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p className="mb-2">No funding rounds configured yet.</p>
            <p className="text-sm">
              Go to the Rounds page to add funding rounds, then return here to
              simulate exits.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stakeholders = waterfallResult
    ? waterfallResult.proceeds.map((p) => p.stakeholder)
    : [];

  const totalRaised = rounds.reduce((sum, r) => sum + r.investmentAmount, 0);

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Exit Waterfall</h1>
        <p className="text-muted-foreground mt-1">
          See how exit proceeds are distributed among founders, investors, and
          employees based on liquidation preferences and conversion rights.
        </p>
      </div>

      {/* Exit Value Control */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium flex items-center">
                Exit Value
                <InfoTooltip
                  term="Liquidation Preference"
                  definition={GLOSSARY["Liquidation Preference"]}
                />
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">$</span>
                <Input
                  type="text"
                  value={formatCurrency(exitValue).replace("$", "")}
                  onChange={handleInputChange}
                  className="w-44 text-right font-mono"
                />
              </div>
            </div>
            <Slider
              value={[exitValue]}
              onValueChange={handleSliderChange}
              min={EXIT_VALUE_RANGE.min}
              max={EXIT_VALUE_RANGE.max}
              step={1_000_000}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>$0</span>
              <span>{formatCurrency(EXIT_VALUE_RANGE.max, true)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exit Configuration */}
      <Card>
        <Accordion defaultValue={[]}>
          <AccordionItem value="exit-config" className="border-0">
            <CardHeader className="pb-0">
              <AccordionTrigger className="text-base font-medium py-0">
                Exit Configuration
              </AccordionTrigger>
            </CardHeader>
            <AccordionContent>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center">
                      Exit Type
                      <InfoTooltip
                        term="Exit Types"
                        definition={GLOSSARY["Exit Types"]}
                      />
                    </Label>
                    <Select
                      value={exitConfig.exitType}
                      onValueChange={(v) =>
                        v && setExitConfig({ exitType: v as ExitType })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ExitType.Acquisition}>
                          Acquisition
                        </SelectItem>
                        <SelectItem value={ExitType.IPO}>IPO</SelectItem>
                        <SelectItem value={ExitType.Dissolution}>
                          Dissolution
                        </SelectItem>
                        <SelectItem value={ExitType.AcquiHire}>
                          Acqui-hire
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center">
                      Transaction Costs
                      <InfoTooltip
                        term="Transaction Costs"
                        definition={GLOSSARY["Transaction Costs"]}
                      />
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={0}
                        max={15}
                        step={0.5}
                        value={exitConfig.transactionCostPercent}
                        onChange={(e) =>
                          setExitConfig({
                            transactionCostPercent:
                              parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-24"
                      />
                      <span className="text-sm text-muted-foreground">
                        % of exit value
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center">
                      Escrow Holdback
                      <InfoTooltip
                        term="Escrow"
                        definition={GLOSSARY["Escrow"]}
                      />
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={0}
                        max={25}
                        step={0.5}
                        value={exitConfig.escrowPercent}
                        onChange={(e) =>
                          setExitConfig({
                            escrowPercent: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-24"
                      />
                      <span className="text-sm text-muted-foreground">
                        % of exit value
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center">
                      Management Carve-Out
                      <InfoTooltip
                        term="Management Carve-Out"
                        definition={GLOSSARY["Management Carve-Out"]}
                      />
                    </Label>
                    <CurrencyInput
                      value={exitConfig.managementCarveout}
                      onChange={(v) =>
                        setExitConfig({ managementCarveout: v })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center">
                      Earnout Amount
                      <InfoTooltip
                        term="Earnout"
                        definition={GLOSSARY["Earnout"]}
                      />
                    </Label>
                    <CurrencyInput
                      value={exitConfig.earnoutAmount}
                      onChange={(v) =>
                        setExitConfig({ earnoutAmount: v })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Years Since First Round</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={0}
                        max={20}
                        step={0.5}
                        value={exitConfig.yearsFromFirstRound}
                        onChange={(e) =>
                          setExitConfig({
                            yearsFromFirstRound:
                              parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-24"
                      />
                      <span className="text-sm text-muted-foreground">
                        years (for dividend accrual)
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>

      {/* Quick Stats */}
      {waterfallResult && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Exit Value</div>
              <div className="text-xl font-bold">
                {formatCurrency(exitValue, true)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Total Raised</div>
              <div className="text-xl font-bold">
                {formatCurrency(totalRaised, true)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">
                Exit / Raised
              </div>
              <div className="text-xl font-bold">
                {totalRaised > 0
                  ? formatMultiple(exitValue / totalRaised)
                  : "—"}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">
                Founders Receive
              </div>
              <div className="text-xl font-bold">
                {formatCurrency(
                  waterfallResult.proceeds.find((p) =>
                    p.stakeholder.includes("Founders")
                  )?.totalProceeds ?? 0,
                  true
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Proceeds Table */}
      {waterfallResult && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              Proceeds at {formatCurrency(exitValue, true)} Exit
              <InfoTooltip term="MOIC" definition={GLOSSARY["MOIC"]} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WaterfallTable result={waterfallResult} />
          </CardContent>
        </Card>
      )}

      {/* Waterfall Range Chart */}
      {waterfallRange.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Distribution Across Exit Values
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WaterfallChart data={waterfallRange} stakeholders={stakeholders} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
