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
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold mb-2">Cap Table</h1>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p className="mb-2">No funding rounds configured yet.</p>
            <p className="text-sm">
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
        <h1 className="text-2xl font-bold">Cap Table</h1>
        <p className="text-muted-foreground mt-1">
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
                <div className="text-sm text-muted-foreground">Post-Money</div>
                <div className="text-xl font-bold">
                  {formatCurrency(activeSnapshot.postMoneyValuation, true)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">
                  Price/Share
                </div>
                <div className="text-xl font-bold">
                  ${activeSnapshot.pricePerShare.toFixed(4)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">
                  Option Pool
                </div>
                <div className="text-xl font-bold">
                  {formatPercent(
                    activeSnapshot.optionPool.poolPercentOfFullyDiluted,
                    1
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">
                  Total Raised
                </div>
                <div className="text-xl font-bold">
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
                <CardTitle className="text-base">Ownership Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <CapTableChart entries={activeSnapshot.entries} />
              </CardContent>
            </Card>

            {snapshots.length > 1 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    Dilution Over Time
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
              <CardTitle className="text-base">Detailed Ownership</CardTitle>
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
