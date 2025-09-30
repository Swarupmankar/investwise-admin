import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/formatters";

// Entry shape coming from useFinancialData hook (normalized)
export interface BalanceHistoryEntry {
  id: number | string;
  amount: number;
  delta: number;
  notes?: string | null;
  isCurrent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface BalanceHistoryTableProps {
  entries: BalanceHistoryEntry[]; // expects normalized entries
}

export const BalanceHistoryTable = ({ entries }: BalanceHistoryTableProps) => {
  // Ensure we have Date objects; sort newest first
  const sorted = [...(entries || [])].sort((a, b) => {
    const ta =
      a.createdAt instanceof Date
        ? a.createdAt.getTime()
        : new Date(a.createdAt).getTime();
    const tb =
      b.createdAt instanceof Date
        ? b.createdAt.getTime()
        : new Date(b.createdAt).getTime();
    return tb - ta;
  });

  return (
    <Card className="bg-gradient-card border-card-border shadow-card">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-foreground">
          Current Balance History
        </CardTitle>
      </CardHeader>

      <CardContent>
        {sorted.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No balance entries recorded yet
          </div>
        ) : (
          <div className="rounded-md border border-card-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-muted-foreground">Date</TableHead>
                  <TableHead className="text-muted-foreground">
                    Balance
                  </TableHead>
                  <TableHead className="text-muted-foreground">Delta</TableHead>
                  <TableHead className="text-muted-foreground">Notes</TableHead>
                  <TableHead className="text-muted-foreground">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {sorted.map((entry, idx) => (
                  <TableRow key={String(entry.id)}>
                    <TableCell className="text-foreground whitespace-nowrap">
                      {formatDate(entry.createdAt)}
                    </TableCell>

                    <TableCell className="font-medium text-foreground">
                      {formatCurrency(entry.amount)}
                    </TableCell>

                    <TableCell className="text-foreground">
                      {entry.delta >= 0
                        ? `+${formatCurrency(entry.delta)}`
                        : formatCurrency(entry.delta)}
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {entry.notes ?? "—"}
                    </TableCell>

                    <TableCell>
                      {entry.isCurrent ? (
                        <Badge
                          variant="outline"
                          className="border-primary text-primary"
                        >
                          Current
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
