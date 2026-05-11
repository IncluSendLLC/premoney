"use client";

import { useMemo } from "react";
import { useSimulatorStore } from "@/lib/store/simulator-store";
import { useCapTable } from "./use-cap-table";
import {
  calculateWaterfall,
  calculateWaterfallRange,
} from "@/lib/engine/waterfall";

export function useWaterfall() {
  const rounds = useSimulatorStore((s) => s.rounds);
  const exitValue = useSimulatorStore((s) => s.exitValue);
  const exitConfig = useSimulatorStore((s) => s.exitConfig);
  const { currentSnapshot } = useCapTable();

  const waterfallResult = useMemo(() => {
    if (!currentSnapshot || rounds.length === 0) return null;
    return calculateWaterfall(currentSnapshot, rounds, {
      ...exitConfig,
      exitValue,
    });
  }, [currentSnapshot, rounds, exitValue, exitConfig]);

  const waterfallRange = useMemo(() => {
    if (!currentSnapshot || rounds.length === 0) return [];
    const maxRange = Math.max(exitValue * 3, 100_000_000);
    return calculateWaterfallRange(currentSnapshot, rounds, 0, maxRange, 150, {
      ...exitConfig,
    });
  }, [currentSnapshot, rounds, exitValue, exitConfig]);

  return { waterfallResult, waterfallRange };
}
