"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { FundingRound } from "@/lib/engine/types";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { GlossaryTerm } from "@/components/shared/glossary-term";

interface RoundCardProps {
  round: FundingRound;
  onEdit: () => void;
  onRemove: () => void;
}

function getLiqPrefLabel(round: FundingRound): string {
  const mult = `${round.terms.liquidationMultiple}x`;
  const type = {
    "non-participating": "Non-Part.",
    participating: "Part.",
    "capped-participating": `Part. (${round.terms.participationCap}x cap)`,
  }[round.terms.liquidationType];
  return `${mult} ${type}`;
}

function getAntiDilutionLabel(round: FundingRound): string {
  return {
    none: "None",
    "broad-based-weighted-average": "BBWA",
    "narrow-based-weighted-average": "NBWA",
    "full-ratchet": "Full Ratchet",
  }[round.terms.antiDilution];
}

export function RoundCard({ round, onEdit, onRemove }: RoundCardProps) {
  const postMoney = round.preMoneyValuation + round.investmentAmount;
  const investorOwnership = (round.investmentAmount / postMoney) * 100;

  return (
    <Card className="relative">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{round.stage}</Badge>
              <span className="font-medium">{round.investorName}</span>
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <div className="text-muted-foreground"><GlossaryTerm term="Pre-Money Valuation">Pre-Money</GlossaryTerm></div>
            <div className="font-medium">
              {formatCurrency(round.preMoneyValuation, true)}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Investment</div>
            <div className="font-medium">
              {formatCurrency(round.investmentAmount, true)}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground"><GlossaryTerm term="Post-Money Valuation">Post-Money</GlossaryTerm></div>
            <div className="font-medium">{formatCurrency(postMoney, true)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Investor Ownership</div>
            <div className="font-medium">
              ~{formatPercent(investorOwnership, 1)}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-3 flex-wrap">
          <Badge variant="outline" className="text-xs">
            <GlossaryTerm term="Liquidation Preference">{getLiqPrefLabel(round)}</GlossaryTerm>
          </Badge>
          <Badge variant="outline" className="text-xs">
            <GlossaryTerm term="Anti-Dilution">Anti-Dilution: {getAntiDilutionLabel(round)}</GlossaryTerm>
          </Badge>
          {round.optionPoolPercent > 0 && (
            <Badge variant="outline" className="text-xs">
              Pool: {round.optionPoolPercent}%
              {round.optionPoolIsPreMoney ? " (pre-$)" : " (post-$)"}
            </Badge>
          )}
          {round.terms.hasProRataRights && (
            <Badge variant="outline" className="text-xs">
              <GlossaryTerm term="Pro-Rata Rights">Pro-Rata</GlossaryTerm>
            </Badge>
          )}
          {round.terms.dividends?.enabled && (
            <Badge variant="outline" className="text-xs">
              <GlossaryTerm term="Dividends">Div: {round.terms.dividends.ratePercent}%{round.terms.dividends.cumulative ? " (cum.)" : ""}</GlossaryTerm>
            </Badge>
          )}
          {round.terms.payToPlay && (
            <Badge variant="outline" className="text-xs">
              <GlossaryTerm term="Pay-to-Play">Pay-to-Play</GlossaryTerm>
            </Badge>
          )}
          {round.terms.hasDragAlong && (
            <Badge variant="outline" className="text-xs">
              <GlossaryTerm term="Drag-Along Rights">Drag-Along</GlossaryTerm>
            </Badge>
          )}
          {round.terms.boardSeats > 0 && (
            <Badge variant="outline" className="text-xs">
              {round.terms.boardSeats} Board Seat{round.terms.boardSeats > 1 ? "s" : ""}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
