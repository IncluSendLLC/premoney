"use client";

import { create } from "zustand";
import {
  ConvertibleInstrument,
  EmployeeGrant,
  Founder,
  FundingRound,
} from "../engine/types";
import { EXIT_VALUE_RANGE } from "../constants";

interface ScenarioData {
  name: string;
  founderShares: number;
  rounds: FundingRound[];
  convertibles: ConvertibleInstrument[];
  founders: Founder[];
  employeeGrants: EmployeeGrant[];
}

interface ScenarioState {
  scenarioA: ScenarioData | null;
  scenarioB: ScenarioData | null;
  comparisonExitValue: number;

  setScenarioA: (data: ScenarioData) => void;
  setScenarioB: (data: ScenarioData) => void;
  setComparisonExitValue: (value: number) => void;
  updateScenarioARound: (
    roundId: string,
    updates: Partial<FundingRound>
  ) => void;
  updateScenarioBRound: (
    roundId: string,
    updates: Partial<FundingRound>
  ) => void;
  clearScenarios: () => void;
}

export type { ScenarioData };

export const useScenarioStore = create<ScenarioState>()((set) => ({
  scenarioA: null,
  scenarioB: null,
  comparisonExitValue: EXIT_VALUE_RANGE.default,

  setScenarioA: (data) => set({ scenarioA: data }),
  setScenarioB: (data) => set({ scenarioB: data }),
  setComparisonExitValue: (value) => set({ comparisonExitValue: value }),

  updateScenarioARound: (roundId, updates) =>
    set((state) => {
      if (!state.scenarioA) return {};
      return {
        scenarioA: {
          ...state.scenarioA,
          rounds: state.scenarioA.rounds.map((r) =>
            r.id === roundId ? { ...r, ...updates } : r
          ),
        },
      };
    }),

  updateScenarioBRound: (roundId, updates) =>
    set((state) => {
      if (!state.scenarioB) return {};
      return {
        scenarioB: {
          ...state.scenarioB,
          rounds: state.scenarioB.rounds.map((r) =>
            r.id === roundId ? { ...r, ...updates } : r
          ),
        },
      };
    }),

  clearScenarios: () =>
    set({
      scenarioA: null,
      scenarioB: null,
      comparisonExitValue: EXIT_VALUE_RANGE.default,
    }),
}));
