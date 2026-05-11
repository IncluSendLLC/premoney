"use client";

import { useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Copy } from "lucide-react";
import { useSimulatorStore } from "@/lib/store/simulator-store";
import { useScenarioStore } from "@/lib/store/scenario-store";
import type { ScenarioData } from "@/lib/store/scenario-store";
import { buildCapTable } from "@/lib/engine/cap-table";
import { calculateWaterfall } from "@/lib/engine/waterfall";
import {
  LiquidationPreferenceType,
  FundingRound,
  ExitType,
} from "@/lib/engine/types";
import { formatCurrency, formatMultiple, formatPercent } from "@/lib/formatters";
import { EXIT_VALUE_RANGE } from "@/lib/constants";
import { getStakeholderColor } from "@/lib/constants";

function deepCloneRounds(rounds: FundingRound[]): FundingRound[] {
  return rounds.map((r) => ({
    ...r,
    terms: { ...r.terms, dividends: { ...r.terms.dividends } },
    id: r.id,
  }));
}

function buildScenario(data: ScenarioData, id: string) {
  return {
    id,
    name: data.name,
    rounds: data.rounds,
    convertibles: data.convertibles ?? [],
    founders: data.founders ?? [],
    employeeGrants: data.employeeGrants ?? [],
    founderShares: data.founderShares,
    exitConfig: {
      exitValue: 0,
      exitType: ExitType.Acquisition,
      transactionCostPercent: 0,
      escrowPercent: 0,
      managementCarveout: 0,
      earnoutAmount: 0,
      earnoutProbabilityPercent: 100,
      yearsFromFirstRound: 0,
    },
  };
}

export default function ComparePage() {
  const mainRounds = useSimulatorStore((s) => s.rounds);
  const mainFounderShares = useSimulatorStore((s) => s.founderShares);
  const mainConvertibles = useSimulatorStore((s) => s.convertibles);
  const mainFounders = useSimulatorStore((s) => s.founders);
  const mainEmployeeGrants = useSimulatorStore((s) => s.employeeGrants);

  const {
    scenarioA,
    scenarioB,
    comparisonExitValue,
    setScenarioA,
    setScenarioB,
    setComparisonExitValue,
    updateScenarioARound,
    updateScenarioBRound,
  } = useScenarioStore();

  const handleCopyToA = useCallback(() => {
    setScenarioA({
      name: "Scenario A",
      founderShares: mainFounderShares,
      rounds: deepCloneRounds(mainRounds),
      convertibles: mainConvertibles,
      founders: mainFounders,
      employeeGrants: mainEmployeeGrants,
    });
  }, [mainRounds, mainFounderShares, mainConvertibles, mainFounders, mainEmployeeGrants, setScenarioA]);

  const handleCopyToB = useCallback(() => {
    setScenarioB({
      name: "Scenario B",
      founderShares: mainFounderShares,
      rounds: deepCloneRounds(mainRounds),
      convertibles: mainConvertibles,
      founders: mainFounders,
      employeeGrants: mainEmployeeGrants,
    });
  }, [mainRounds, mainFounderShares, mainConvertibles, mainFounders, mainEmployeeGrants, setScenarioB]);

  const handleTermChange = useCallback(
    (
      scenario: "A" | "B",
      roundId: string,
      field: string,
      value: string | number | null | undefined
    ) => {
      if (value == null) return;
      const update = scenario === "A" ? updateScenarioARound : updateScenarioBRound;
      const rounds = scenario === "A" ? scenarioA?.rounds : scenarioB?.rounds;
      const round = rounds?.find((r) => r.id === roundId);
      if (!round) return;

      const newTerms = { ...round.terms, dividends: { ...round.terms.dividends } };
      if (field === "liquidationMultiple") {
        newTerms.liquidationMultiple = value as number;
      } else if (field === "liquidationType") {
        newTerms.liquidationType = value as LiquidationPreferenceType;
      } else if (field === "participationCap") {
        newTerms.participationCap = value as number | null;
      }
      update(roundId, { terms: newTerms });
    },
    [scenarioA, scenarioB, updateScenarioARound, updateScenarioBRound]
  );

  const resultA = useMemo(() => {
    if (!scenarioA || scenarioA.rounds.length === 0) return null;
    const snapshots = buildCapTable(buildScenario(scenarioA, "a"));
    const capTable = snapshots[snapshots.length - 1];
    return calculateWaterfall(capTable, scenarioA.rounds, comparisonExitValue);
  }, [scenarioA, comparisonExitValue]);

  const resultB = useMemo(() => {
    if (!scenarioB || scenarioB.rounds.length === 0) return null;
    const snapshots = buildCapTable(buildScenario(scenarioB, "b"));
    const capTable = snapshots[snapshots.length - 1];
    return calculateWaterfall(capTable, scenarioB.rounds, comparisonExitValue);
  }, [scenarioB, comparisonExitValue]);

  if (mainRounds.length === 0) {
    return (
      <div className="max-w-4xl">
        <p className="serif-lead">Compare scenarios</p>
        <h1 className="caps-label">Scenario Comparison</h1>
        <Card>
          <CardContent className="py-12 text-center" style={{ color: "var(--ink-40)" }}>
            <p className="mb-2">No funding rounds configured yet.</p>
            <p className="text-sm">
              Go to the Rounds page to set up your cap table, then come back
              here to compare different term configurations.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl space-y-6">
      <div>
        <p className="serif-lead">Compare scenarios</p>
        <h1 className="caps-label">Scenario Comparison</h1>
        <p className="mt-1" style={{ color: "var(--ink-60)" }}>
          Compare how different term sheet configurations affect exit outcomes.
          Copy your current rounds into each scenario, then modify the terms.
        </p>
      </div>

      {/* Exit Value Slider */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="caps-label-sm">
                Exit Value:{" "}
                <span className="nums">{formatCurrency(comparisonExitValue, true)}</span>
              </Label>
            </div>
            <Slider
              value={[comparisonExitValue]}
              onValueChange={(v) => setComparisonExitValue(Array.isArray(v) ? v[0] : v)}
              min={EXIT_VALUE_RANGE.min}
              max={EXIT_VALUE_RANGE.max}
              step={1_000_000}
            />
          </div>
        </CardContent>
      </Card>

      {/* Side-by-side Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scenario A */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="caps-label-sm" style={{ color: "var(--navy-500)" }}>Scenario A</CardTitle>
              <Button variant="outline" size="sm" onClick={handleCopyToA}>
                <Copy className="h-3.5 w-3.5 mr-1" />
                Copy Current Rounds
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!scenarioA ? (
              <p className="text-sm text-center py-6" style={{ color: "var(--ink-40)" }}>
                Click &quot;Copy Current Rounds&quot; to load your rounds.
              </p>
            ) : (
              <>
                {scenarioA.rounds.map((round) => (
                  <div
                    key={round.id}
                    className="border rounded-lg p-3 space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{round.stage}</Badge>
                      <span className="text-sm font-medium">
                        {round.investorName}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Liq. Multiple</Label>
                        <Select
                          value={round.terms.liquidationMultiple.toString()}
                          onValueChange={(v) =>
                            handleTermChange(
                              "A",
                              round.id,
                              "liquidationMultiple",
                              v ? parseFloat(v) : null
                            )
                          }
                        >
                          <SelectTrigger className="h-8 text-xs">
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
                      <div>
                        <Label className="text-xs">Type</Label>
                        <Select
                          value={round.terms.liquidationType}
                          onValueChange={(v) =>
                            handleTermChange("A", round.id, "liquidationType", v)
                          }
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="non-participating">
                              Non-Part.
                            </SelectItem>
                            <SelectItem value="participating">Part.</SelectItem>
                            <SelectItem value="capped-participating">
                              Capped
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}

                {resultA && (
                  <div className="space-y-2 pt-2">
                    <h4 className="caps-label-sm">
                      Proceeds at <span className="nums">{formatCurrency(comparisonExitValue, true)}</span>
                    </h4>
                    {resultA.proceeds.map((p, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{
                              backgroundColor: getStakeholderColor(
                                p.stakeholder
                              ),
                            }}
                          />
                          <span className="truncate max-w-[140px]">
                            {p.stakeholder}
                          </span>
                        </div>
                        <div className="nums font-medium">
                          {formatCurrency(p.totalProceeds, true)}
                          {p.investedCapital > 0 && (
                            <span className="ml-1" style={{ color: "var(--ink-60)" }}>
                              (<span className="nums">{formatMultiple(p.moic)}</span>)
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Scenario B */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="caps-label-sm" style={{ color: "var(--navy-500)" }}>Scenario B</CardTitle>
              <Button variant="outline" size="sm" onClick={handleCopyToB}>
                <Copy className="h-3.5 w-3.5 mr-1" />
                Copy Current Rounds
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!scenarioB ? (
              <p className="text-sm text-center py-6" style={{ color: "var(--ink-40)" }}>
                Click &quot;Copy Current Rounds&quot; to load your rounds.
              </p>
            ) : (
              <>
                {scenarioB.rounds.map((round) => (
                  <div
                    key={round.id}
                    className="border rounded-lg p-3 space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{round.stage}</Badge>
                      <span className="text-sm font-medium">
                        {round.investorName}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Liq. Multiple</Label>
                        <Select
                          value={round.terms.liquidationMultiple.toString()}
                          onValueChange={(v) =>
                            handleTermChange(
                              "B",
                              round.id,
                              "liquidationMultiple",
                              v ? parseFloat(v) : null
                            )
                          }
                        >
                          <SelectTrigger className="h-8 text-xs">
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
                      <div>
                        <Label className="text-xs">Type</Label>
                        <Select
                          value={round.terms.liquidationType}
                          onValueChange={(v) =>
                            handleTermChange("B", round.id, "liquidationType", v)
                          }
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="non-participating">
                              Non-Part.
                            </SelectItem>
                            <SelectItem value="participating">Part.</SelectItem>
                            <SelectItem value="capped-participating">
                              Capped
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}

                {resultB && (
                  <div className="space-y-2 pt-2">
                    <h4 className="caps-label-sm">
                      Proceeds at <span className="nums">{formatCurrency(comparisonExitValue, true)}</span>
                    </h4>
                    {resultB.proceeds.map((p, i) => {
                      // Calculate diff from scenario A
                      const aProceeds = resultA?.proceeds.find(
                        (ap) => ap.stakeholder === p.stakeholder
                      );
                      const diff = aProceeds
                        ? p.totalProceeds - aProceeds.totalProceeds
                        : 0;
                      const diffPct =
                        aProceeds && aProceeds.totalProceeds > 0
                          ? (diff / aProceeds.totalProceeds) * 100
                          : 0;

                      return (
                        <div
                          key={i}
                          className="flex items-center justify-between text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2.5 h-2.5 rounded-full"
                              style={{
                                backgroundColor: getStakeholderColor(
                                  p.stakeholder
                                ),
                              }}
                            />
                            <span className="truncate max-w-[140px]">
                              {p.stakeholder}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="nums font-medium">
                              {formatCurrency(p.totalProceeds, true)}
                            </span>
                            {Math.abs(diffPct) > 0.5 && (
                              <Badge
                                variant={diff > 0 ? "default" : "destructive"}
                                className="text-xs"
                              >
                                {diff > 0 ? "+" : ""}
                                {formatPercent(diffPct, 0)}
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
