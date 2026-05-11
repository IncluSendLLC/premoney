"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, RotateCcw } from "lucide-react";
import { useSimulatorStore } from "@/lib/store/simulator-store";
import { RoundCard } from "@/components/rounds/round-card";
import { RoundForm } from "@/components/rounds/round-form";
import { FundingRound } from "@/lib/engine/types";
import { formatShares } from "@/lib/formatters";
import { InfoTooltip } from "@/components/shared/info-tooltip";
import { GLOSSARY } from "@/lib/constants";

export default function RoundsPage() {
  const {
    founderShares,
    rounds,
    setFounderShares,
    addRound,
    updateRound,
    removeRound,
    resetAll,
    loadPreset,
  } = useSimulatorStore();

  const [formOpen, setFormOpen] = useState(false);
  const [editingRound, setEditingRound] = useState<FundingRound | undefined>();

  const handleAddRound = useCallback(() => {
    setEditingRound(undefined);
    setFormOpen(true);
  }, []);

  const handleEditRound = useCallback((round: FundingRound) => {
    setEditingRound(round);
    setFormOpen(true);
  }, []);

  const handleSaveRound = useCallback(
    (round: FundingRound) => {
      if (editingRound) {
        updateRound(round.id, round);
      } else {
        addRound(round);
      }
    },
    [editingRound, addRound, updateRound]
  );

  return (
    <div className="max-w-4xl space-y-8">
      {/* Page header */}
      <div>
        <p className="serif-lead mb-2">
          <em>the structure of</em>
        </p>
        <h1 className="caps-label" style={{ fontSize: "12px", marginBottom: "8px" }}>
          Funding Rounds
        </h1>
        <p style={{ fontSize: "14px", color: "var(--ink-60)", lineHeight: 1.55 }}>
          Configure your company and add funding rounds to simulate the cap
          table and exit outcomes.
        </p>
      </div>

      {/* Company Setup */}
      <Card>
        <CardContent style={{ padding: "26px" }}>
          <h3 className="caps-label-sm mb-5" style={{ color: "var(--navy-500)" }}>
            Company Setup
          </h3>
          <div className="flex items-end gap-4">
            <div className="space-y-2 flex-1">
              <Label htmlFor="founderShares" className="flex items-center" style={{ fontSize: "13px" }}>
                Founder shares at inception
                <InfoTooltip
                  term="Fully Diluted"
                  definition="The initial number of common shares issued to founders. A typical number is 10,000,000 shares, which makes the math cleaner for future rounds."
                />
              </Label>
              <Input
                id="founderShares"
                type="text"
                className="nums"
                value={formatShares(founderShares)}
                onChange={(e) => {
                  const val = parseInt(e.target.value.replace(/,/g, ""), 10);
                  if (!isNaN(val) && val > 0) setFounderShares(val);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label style={{ fontSize: "13px" }}>Load preset</Label>
              <Select onValueChange={(v) => v && loadPreset(v as "seed" | "seriesA" | "seriesB")}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Choose preset..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seed">Seed Round</SelectItem>
                  <SelectItem value="seriesA">Seed + Series A</SelectItem>
                  <SelectItem value="seriesB">Seed + A + B</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" size="icon" onClick={resetAll} title="Reset all">
              <RotateCcw style={{ width: "14px", height: "14px" }} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Round List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="caps-label-sm" style={{ color: "var(--navy-500)" }}>
            Rounds ({rounds.length})
          </h2>
          <Button onClick={handleAddRound} size="sm">
            <Plus style={{ width: "14px", height: "14px", marginRight: "4px" }} />
            Add Round
          </Button>
        </div>

        {rounds.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center" style={{ color: "var(--ink-40)" }}>
              <p className="mb-2">No funding rounds configured yet.</p>
              <p style={{ fontSize: "13px" }}>
                Add a round or load a preset to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {rounds.map((round) => (
              <RoundCard
                key={round.id}
                round={round}
                onEdit={() => handleEditRound(round)}
                onRemove={() => removeRound(round.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Round Form Sheet */}
      <RoundForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSaveRound}
        initialRound={editingRound}
        roundNumber={rounds.length + 1}
      />
    </div>
  );
}
