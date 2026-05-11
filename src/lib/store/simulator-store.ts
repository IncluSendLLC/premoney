"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  AntiDilutionType,
  ConvertibleInstrument,
  EmployeeGrant,
  ExitConfig,
  ExitType,
  Founder,
  FundingRound,
  LiquidationPreferenceType,
  RoundStage,
  SeniorityType,
  TermSheet,
} from "../engine/types";
import { DEFAULT_FOUNDER_SHARES, DEFAULT_TERMS, EXIT_VALUE_RANGE } from "../constants";

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

interface SimulatorState {
  founderShares: number;
  rounds: FundingRound[];
  convertibles: ConvertibleInstrument[];
  founders: Founder[];
  employeeGrants: EmployeeGrant[];
  exitValue: number;
  exitConfig: ExitConfig;
  activeRoundId: string | null;

  setFounderShares: (shares: number) => void;
  addRound: (round: FundingRound) => void;
  updateRound: (id: string, updates: Partial<FundingRound>) => void;
  removeRound: (id: string) => void;
  addConvertible: (instrument: ConvertibleInstrument) => void;
  updateConvertible: (id: string, updates: Partial<ConvertibleInstrument>) => void;
  removeConvertible: (id: string) => void;
  addFounder: (founder: Founder) => void;
  updateFounder: (id: string, updates: Partial<Founder>) => void;
  removeFounder: (id: string) => void;
  addEmployeeGrant: (grant: EmployeeGrant) => void;
  updateEmployeeGrant: (id: string, updates: Partial<EmployeeGrant>) => void;
  removeEmployeeGrant: (id: string) => void;
  setExitValue: (value: number) => void;
  setExitConfig: (config: Partial<ExitConfig>) => void;
  setActiveRoundId: (id: string | null) => void;
  resetAll: () => void;
  loadPreset: (preset: "seed" | "seriesA" | "seriesB") => void;
}

function createDefaultTerms(overrides: Partial<TermSheet> = {}): TermSheet {
  return { ...DEFAULT_TERMS, ...overrides };
}

function createDefaultRound(
  stage: RoundStage,
  overrides: Partial<FundingRound> = {}
): FundingRound {
  return {
    id: generateId(),
    stage,
    investorName: "",
    preMoneyValuation: 8_000_000,
    investmentAmount: 2_000_000,
    optionPoolPercent: 10,
    optionPoolIsPreMoney: true,
    terms: createDefaultTerms(overrides.terms),
    ...overrides,
    // Ensure terms is fully populated even if overrides.terms is partial
    ...(overrides.terms ? { terms: createDefaultTerms(overrides.terms) } : {}),
  };
}

const defaultExitConfig: ExitConfig = {
  exitValue: EXIT_VALUE_RANGE.default,
  exitType: ExitType.Acquisition,
  transactionCostPercent: 0,
  escrowPercent: 0,
  managementCarveout: 0,
  earnoutAmount: 0,
  earnoutProbabilityPercent: 100,
  yearsFromFirstRound: 0,
};

const initialState = {
  founderShares: DEFAULT_FOUNDER_SHARES,
  rounds: [] as FundingRound[],
  convertibles: [] as ConvertibleInstrument[],
  founders: [] as Founder[],
  employeeGrants: [] as EmployeeGrant[],
  exitValue: EXIT_VALUE_RANGE.default,
  exitConfig: defaultExitConfig,
  activeRoundId: null as string | null,
};

export const useSimulatorStore = create<SimulatorState>()(
  persist(
    (set) => ({
      ...initialState,

      setFounderShares: (shares) => set({ founderShares: shares }),

      addRound: (round) =>
        set((state) => ({ rounds: [...state.rounds, round] })),

      updateRound: (id, updates) =>
        set((state) => ({
          rounds: state.rounds.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        })),

      removeRound: (id) =>
        set((state) => ({
          rounds: state.rounds.filter((r) => r.id !== id),
          activeRoundId:
            state.activeRoundId === id ? null : state.activeRoundId,
        })),

      addConvertible: (instrument) =>
        set((state) => ({
          convertibles: [...state.convertibles, instrument],
        })),

      updateConvertible: (id, updates) =>
        set((state) => ({
          convertibles: state.convertibles.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),

      removeConvertible: (id) =>
        set((state) => ({
          convertibles: state.convertibles.filter((c) => c.id !== id),
        })),

      addFounder: (founder) =>
        set((state) => ({ founders: [...state.founders, founder] })),

      updateFounder: (id, updates) =>
        set((state) => ({
          founders: state.founders.map((f) =>
            f.id === id ? { ...f, ...updates } : f
          ),
        })),

      removeFounder: (id) =>
        set((state) => ({
          founders: state.founders.filter((f) => f.id !== id),
        })),

      addEmployeeGrant: (grant) =>
        set((state) => ({
          employeeGrants: [...state.employeeGrants, grant],
        })),

      updateEmployeeGrant: (id, updates) =>
        set((state) => ({
          employeeGrants: state.employeeGrants.map((g) =>
            g.id === id ? { ...g, ...updates } : g
          ),
        })),

      removeEmployeeGrant: (id) =>
        set((state) => ({
          employeeGrants: state.employeeGrants.filter((g) => g.id !== id),
        })),

      setExitValue: (value) =>
        set((state) => ({
          exitValue: value,
          exitConfig: { ...state.exitConfig, exitValue: value },
        })),

      setExitConfig: (config) =>
        set((state) => ({
          exitConfig: { ...state.exitConfig, ...config },
          ...(config.exitValue !== undefined
            ? { exitValue: config.exitValue }
            : {}),
        })),

      setActiveRoundId: (id) => set({ activeRoundId: id }),

      resetAll: () => set(initialState),

      loadPreset: (preset) => {
        const presets: Record<string, FundingRound[]> = {
          seed: [
            createDefaultRound(RoundStage.Seed, {
              investorName: "Seed Fund I",
              preMoneyValuation: 8_000_000,
              investmentAmount: 2_000_000,
              optionPoolPercent: 10,
              terms: createDefaultTerms({
                seniorityRank: 1,
              }),
            }),
          ],
          seriesA: [
            createDefaultRound(RoundStage.Seed, {
              investorName: "Seed Fund I",
              preMoneyValuation: 8_000_000,
              investmentAmount: 2_000_000,
              optionPoolPercent: 10,
              terms: createDefaultTerms({
                seniorityRank: 2,
              }),
            }),
            createDefaultRound(RoundStage.SeriesA, {
              investorName: "Venture Capital Partners",
              preMoneyValuation: 30_000_000,
              investmentAmount: 8_000_000,
              optionPoolPercent: 10,
              terms: createDefaultTerms({
                seniorityRank: 1,
              }),
            }),
          ],
          seriesB: [
            createDefaultRound(RoundStage.Seed, {
              investorName: "Seed Fund I",
              preMoneyValuation: 8_000_000,
              investmentAmount: 2_000_000,
              optionPoolPercent: 10,
              terms: createDefaultTerms({
                seniorityRank: 3,
              }),
            }),
            createDefaultRound(RoundStage.SeriesA, {
              investorName: "Venture Capital Partners",
              preMoneyValuation: 30_000_000,
              investmentAmount: 8_000_000,
              optionPoolPercent: 10,
              terms: createDefaultTerms({
                seniorityRank: 2,
              }),
            }),
            createDefaultRound(RoundStage.SeriesB, {
              investorName: "Growth Equity LLC",
              preMoneyValuation: 100_000_000,
              investmentAmount: 30_000_000,
              optionPoolPercent: 5,
              terms: createDefaultTerms({
                seniorityRank: 1,
              }),
            }),
          ],
        };

        set({
          ...initialState,
          rounds: presets[preset] || [],
        });
      },
    }),
    { name: "premoney-simulator" }
  )
);
