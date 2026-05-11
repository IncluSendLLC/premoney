"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CapTableSnapshot } from "@/lib/engine/types";
import {
  formatCurrency,
  formatPercent,
  formatShares,
} from "@/lib/formatters";
import { getStakeholderColor } from "@/lib/constants";
import { GlossaryTerm } from "@/components/shared/glossary-term";

interface CapTableGridProps {
  snapshot: CapTableSnapshot;
}

export function CapTableGrid({ snapshot }: CapTableGridProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Stakeholder</TableHead>
          <TableHead className="text-right">Shares</TableHead>
          <TableHead className="text-right"><GlossaryTerm term="Fully Diluted">Ownership %</GlossaryTerm></TableHead>
          <TableHead className="text-right">Invested</TableHead>
          <TableHead className="text-right"><GlossaryTerm term="Price Per Share">Price/Share</GlossaryTerm></TableHead>
          <TableHead>Type</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {snapshot.entries.map((entry, i) => (
          <TableRow key={i}>
            <TableCell>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: getStakeholderColor(entry.stakeholder),
                  }}
                />
                <span className="font-medium">{entry.stakeholder}</span>
              </div>
            </TableCell>
            <TableCell className="text-right font-mono">
              {formatShares(entry.sharesOwned)}
            </TableCell>
            <TableCell className="text-right font-mono font-medium">
              {formatPercent(entry.ownershipPercent)}
            </TableCell>
            <TableCell className="text-right font-mono">
              {entry.investedCapital > 0
                ? formatCurrency(entry.investedCapital)
                : "—"}
            </TableCell>
            <TableCell className="text-right font-mono">
              {entry.pricePerShare > 0
                ? `$${entry.pricePerShare.toFixed(4)}`
                : "—"}
            </TableCell>
            <TableCell>
              <Badge variant={entry.isPreferred ? "default" : "secondary"}>
                {entry.isPreferred ? "Preferred" : "Common"}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
        <TableRow className="font-bold">
          <TableCell>Total</TableCell>
          <TableCell className="text-right font-mono">
            {formatShares(snapshot.totalFullyDilutedShares)}
          </TableCell>
          <TableCell className="text-right font-mono">100.00%</TableCell>
          <TableCell className="text-right font-mono">
            {formatCurrency(
              snapshot.entries.reduce((sum, e) => sum + e.investedCapital, 0)
            )}
          </TableCell>
          <TableCell className="text-right font-mono">
            ${snapshot.pricePerShare.toFixed(4)}
          </TableCell>
          <TableCell />
        </TableRow>
      </TableBody>
    </Table>
  );
}
