"use client";

import { useMemo } from "react";
import { useSimulatorStore } from "@/lib/store/simulator-store";
import { buildCapTable } from "@/lib/engine/cap-table";
import { ExitType } from "@/lib/engine/types";

export function useCapTable() {
  const founderShares = useSimulatorStore((s) => s.founderShares);
  const rounds = useSimulatorStore((s) => s.rounds);
  const convertibles = useSimulatorStore((s) => s.convertibles);
  const founders = useSimulatorStore((s) => s.founders);
  const employeeGrants = useSimulatorStore((s) => s.employeeGrants);
  const exitConfig = useSimulatorStore((s) => s.exitConfig);

  const snapshots = useMemo(
    () =>
      buildCapTable({
        id: "current",
        name: "Current",
        rounds,
        convertibles,
        founders,
        employeeGrants,
        founderShares,
        exitConfig: exitConfig ?? {
          exitValue: 0,
          exitType: ExitType.Acquisition,
          transactionCostPercent: 0,
          escrowPercent: 0,
          managementCarveout: 0,
          earnoutAmount: 0,
          earnoutProbabilityPercent: 100,
          yearsFromFirstRound: 0,
        },
      }),
    [rounds, convertibles, founders, employeeGrants, founderShares, exitConfig]
  );

  const currentSnapshot = snapshots.length > 0 ? snapshots[snapshots.length - 1] : null;

  return { snapshots, currentSnapshot };
}
