"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCapTable } from "@/hooks/use-cap-table";
import { useSimulatorStore } from "@/lib/store/simulator-store";
import { CapTableChart } from "@/components/cap-table/cap-table-chart";
import { DilutionTimeline } from "@/components/cap-table/dilution-timeline";
import { CapTableGrid } from "@/components/cap-table/cap-table-grid";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { GlossaryTerm } from "@/components/shared/glossary-term";

export default function CapTablePage() {
  const rounds = useSimulatorStore((s) => s.rounds);
  const { snapshots, currentSnapshot } = useCapTable();
  const [selectedRoundIdx, setSelectedRoundIdx] = useState<number>(-1);

  const activeSnapshot =
    selectedRoundIdx >= 0 && selectedRoundIdx < snapshots.length
      ? snapshots[selectedRoundIdx]
      : currentSnapshot;

  if (rounds.length === 0) {
    return (
      <div className="max-w-6xl">
        <div>
          <p className="serif-lead mb-2">
            <em>the allocation of</em>
          </p>
          <h1 className="caps-label" style={{ fontSize: "12px", marginBottom: "8px" }}>
            Cap Table
          </h1>
        </div>
        <Card>
          <CardContent className="py-12 text-center" style={{ color: "var(--ink-60)" }}>
            <p className="mb-2">No funding rounds configured yet.</p>
            <p style={{ fontSize: "13px", lineHeight: 1.55 }}>
              Go to the Rounds page to add funding rounds, then return here to
              see the cap table.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <p className="serif-lead mb-2">
          <em>the allocation of</em>
        </p>
        <h1 className="caps-label" style={{ fontSize: "12px", marginBottom: "8px" }}>
          Cap Table
        </h1>
        <p style={{ fontSize: "14px", color: "var(--ink-60)", lineHeight: 1.55 }}>
          View ownership breakdown after each funding round.
        </p>
      </div>

      {/* Round Selector */}
      <Tabs
        value={selectedRoundIdx.toString()}
        onValueChange={(v) => setSelectedRoundIdx(parseInt(v, 10))}
      >
        <TabsList>
          {snapshots.map((snapshot, i) => (
            <TabsTrigger key={i} value={i.toString()}>
              {i === 0 ? "Inception" : rounds[i - 1]?.stage ?? `Round ${i}`}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {activeSnapshot && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="caps-label-sm" style={{ color: "var(--navy-500)", marginBottom: "4px" }}>
                  <GlossaryTerm term="Post-Money Valuation">Post-Money</GlossaryTerm>
                </div>
                <div
                  className="nums"
                  style={{ fontWeight: 500, fontSize: "32px", letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}
                >
                  {formatCurrency(activeSnapshot.postMoneyValuation, true)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="caps-label-sm" style={{ color: "var(--navy-500)", marginBottom: "4px" }}>
                  <GlossaryTerm term="Price Per Share">Price/Share</GlossaryTerm>
                </div>
                <div
                  className="nums"
                  style={{ fontWeight: 500, fontSize: "32px", letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}
                >
                  ${activeSnapshot.pricePerShare.toFixed(4)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="caps-label-sm" style={{ color: "var(--navy-500)", marginBottom: "4px" }}>
                  <GlossaryTerm term="Option Pool">Option Pool</GlossaryTerm>
                </div>
                <div
                  className="nums"
                  style={{ fontWeight: 500, fontSize: "32px", letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}
                >
                  {formatPercent(
                    activeSnapshot.optionPool.poolPercentOfFullyDiluted,
                    1
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="caps-label-sm" style={{ color: "var(--navy-500)", marginBottom: "4px" }}>
                  Total Raised
                </div>
                <div
                  className="nums"
                  style={{ fontWeight: 500, fontSize: "32px", letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}
                >
                  {formatCurrency(
                    activeSnapshot.entries.reduce(
                      (sum, e) => sum + e.investedCapital,
                      0
                    ),
                    true
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="caps-label-sm" style={{ color: "var(--navy-500)" }}>
                  <GlossaryTerm term="Fully Diluted">Ownership Breakdown</GlossaryTerm>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CapTableChart entries={activeSnapshot.entries} />
              </CardContent>
            </Card>

            {snapshots.length > 1 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="caps-label-sm" style={{ color: "var(--navy-500)" }}>
                    <GlossaryTerm term="Anti-Dilution">Dilution Over Time</GlossaryTerm>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DilutionTimeline snapshots={snapshots} />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Detailed Table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="caps-label-sm" style={{ color: "var(--navy-500)" }}>
                Detailed Ownership
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CapTableGrid snapshot={activeSnapshot} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
