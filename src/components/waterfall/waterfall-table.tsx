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
import { WaterfallResult } from "@/lib/engine/types";
import { formatCurrency, formatMultiple } from "@/lib/formatters";
import { getStakeholderColor } from "@/lib/constants";
import { GlossaryTerm } from "@/components/shared/glossary-term";

interface WaterfallTableProps {
  result: WaterfallResult;
}

export function WaterfallTable({ result }: WaterfallTableProps) {
  const hasCarveout = result.managementCarveout > 0;
  const hasDividends = result.proceeds.some((p) => p.accruedDividends > 0);

  return (
    <div className="space-y-4">
      {/* Transaction summary */}
      {(result.transactionCosts > 0 || result.escrowHoldback > 0 || hasCarveout) && (
        <div className="rounded-lg bg-muted p-3 text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Gross Exit Value</span>
            <span className="font-mono">{formatCurrency(result.exitValue, true)}</span>
          </div>
          {result.transactionCosts > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground"><GlossaryTerm term="Transaction Costs">Transaction Costs</GlossaryTerm></span>
              <span className="font-mono text-destructive">
                -{formatCurrency(result.transactionCosts, true)}
              </span>
            </div>
          )}
          {result.escrowHoldback > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground"><GlossaryTerm term="Escrow">Escrow Holdback</GlossaryTerm></span>
              <span className="font-mono text-destructive">
                -{formatCurrency(result.escrowHoldback, true)}
              </span>
            </div>
          )}
          {hasCarveout && (
            <div className="flex justify-between">
              <span className="text-muted-foreground"><GlossaryTerm term="Management Carve-Out">Management Carve-Out</GlossaryTerm></span>
              <span className="font-mono">
                {formatCurrency(result.managementCarveout, true)}
              </span>
            </div>
          )}
          <div className="flex justify-between font-medium border-t pt-1 mt-1">
            <span>Net Distributable</span>
            <span className="font-mono">{formatCurrency(result.netExitValue, true)}</span>
          </div>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Stakeholder</TableHead>
            <TableHead className="text-right">Invested</TableHead>
            <TableHead className="text-right"><GlossaryTerm term="Liquidation Preference">Preference</GlossaryTerm></TableHead>
            {hasDividends && (
              <TableHead className="text-right"><GlossaryTerm term="Dividends">Dividends</GlossaryTerm></TableHead>
            )}
            <TableHead className="text-right"><GlossaryTerm term="Participating Preferred">Participation</GlossaryTerm></TableHead>
            <TableHead className="text-right"><GlossaryTerm term="Conversion">Conversion</GlossaryTerm></TableHead>
            {hasCarveout && (
              <TableHead className="text-right"><GlossaryTerm term="Management Carve-Out">Carve-Out</GlossaryTerm></TableHead>
            )}
            <TableHead className="text-right">Total Proceeds</TableHead>
            <TableHead className="text-right"><GlossaryTerm term="MOIC">MOIC</GlossaryTerm></TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {result.proceeds.map((p, i) => (
            <TableRow key={i}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: getStakeholderColor(p.stakeholder),
                    }}
                  />
                  <span className="font-medium">{p.stakeholder}</span>
                </div>
              </TableCell>
              <TableCell className="text-right font-mono">
                {p.investedCapital > 0
                  ? formatCurrency(p.investedCapital, true)
                  : "—"}
              </TableCell>
              <TableCell className="text-right font-mono">
                {p.proceedsFromPreference > 0
                  ? formatCurrency(p.proceedsFromPreference, true)
                  : "—"}
              </TableCell>
              {hasDividends && (
                <TableCell className="text-right font-mono">
                  {p.accruedDividends > 0
                    ? formatCurrency(p.accruedDividends, true)
                    : "—"}
                </TableCell>
              )}
              <TableCell className="text-right font-mono">
                {p.proceedsFromParticipation > 0
                  ? formatCurrency(p.proceedsFromParticipation, true)
                  : "—"}
              </TableCell>
              <TableCell className="text-right font-mono">
                {p.proceedsFromConversion > 0
                  ? formatCurrency(p.proceedsFromConversion, true)
                  : "—"}
              </TableCell>
              {hasCarveout && (
                <TableCell className="text-right font-mono">
                  {p.proceedsFromCarveout > 0
                    ? formatCurrency(p.proceedsFromCarveout, true)
                    : "—"}
                </TableCell>
              )}
              <TableCell className="text-right font-mono font-bold">
                {formatCurrency(p.totalProceeds, true)}
              </TableCell>
              <TableCell className="text-right font-mono">
                {p.investedCapital > 0 ? formatMultiple(p.moic) : "—"}
              </TableCell>
              <TableCell>
                {p.investedCapital > 0 && (
                  <Badge variant={p.didConvert ? "secondary" : "outline"}>
                    {p.didConvert ? "Converted" : "Preference"}
                  </Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
