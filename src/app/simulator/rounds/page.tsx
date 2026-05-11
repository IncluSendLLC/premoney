"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
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
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Funding Rounds</h1>
        <p className="text-muted-foreground mt-1">
          Configure your company and add funding rounds to simulate the cap
          table and exit outcomes.
        </p>
      </div>

      {/* Company Setup */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Company Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-4">
            <div className="space-y-2 flex-1">
              <Label htmlFor="founderShares" className="flex items-center">
                Founder Shares at Inception
                <InfoTooltip
                  term="Fully Diluted"
                  definition="The initial number of common shares issued to founders. A typical number is 10,000,000 shares, which makes the math cleaner for future rounds."
                />
              </Label>
              <Input
                id="founderShares"
                type="text"
                value={formatShares(founderShares)}
                onChange={(e) => {
                  const val = parseInt(e.target.value.replace(/,/g, ""), 10);
                  if (!isNaN(val) && val > 0) setFounderShares(val);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label>Load Preset</Label>
              <Select onValueChange={(v) => v && loadPreset(v as "seed" | "seriesA" | "seriesB")}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Choose preset..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seed">Seed Round</SelectItem>
                  <SelectItem value="seriesA">Seed + Series A</SelectItem>
                  <SelectItem value="seriesB">
                    Seed + A + B
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" size="icon" onClick={resetAll} title="Reset all">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Round List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Rounds ({rounds.length})
          </h2>
          <Button onClick={handleAddRound} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Round
          </Button>
        </div>

        {rounds.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <p className="mb-2">No funding rounds configured yet.</p>
              <p className="text-sm">
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
