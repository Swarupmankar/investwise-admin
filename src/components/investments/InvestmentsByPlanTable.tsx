import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Investment } from "@/types/client";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { ClientStatusBadge } from "@/components/clients/ClientStatusBadge";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface InvestmentWithDetails extends Investment {
  clientName: string;
  referredBy?: string;
  currentMonthReturns?: number;
}

interface InvestmentsByPlanTableProps {
  investments: InvestmentWithDetails[];
  sortField?: "amount" | "startDate" | "status" | null;
  sortDirection?: "asc" | "desc";
  onSort?: (field: "amount" | "startDate" | "status") => void;
}

export function InvestmentsByPlanTable({
  investments,
  sortField,
  sortDirection,
  onSort,
}: InvestmentsByPlanTableProps) {
  const SortIcon = ({
    field,
  }: {
    field: "amount" | "startDate" | "status";
  }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-2" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-4 w-4 ml-2" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-2" />
    );
  };

  return (
    <div className="rounded-lg border border-card-border bg-card shadow-card">
      <Table>
        <TableHeader>
          <TableRow className="border-card-border">
            <TableHead>Client Name</TableHead>
            <TableHead>Plan Type</TableHead>
            <TableHead
              className={cn(
                "text-center cursor-pointer hover:bg-muted/50 select-none",
                sortField === "amount" && "bg-muted/50"
              )}
              onClick={() => onSort?.("amount")}
            >
              <div className="flex items-center justify-center">
                Amount
                <SortIcon field="amount" />
              </div>
            </TableHead>
            <TableHead
              className={cn(
                "cursor-pointer hover:bg-muted/50 select-none",
                sortField === "startDate" && "bg-muted/50"
              )}
              onClick={() => onSort?.("startDate")}
            >
              <div className="flex items-center">
                Start Date
                <SortIcon field="startDate" />
              </div>
            </TableHead>
            <TableHead
              className={cn(
                "cursor-pointer hover:bg-muted/50 select-none",
                sortField === "status" && "bg-muted/50"
              )}
              onClick={() => onSort?.("status")}
            >
              <div className="flex items-center">
                Status
                <SortIcon field="status" />
              </div>
            </TableHead>
            <TableHead className="text-center">Current Month Returns</TableHead>
            <TableHead className="text-center">Lifetime Return</TableHead>
            <TableHead>Referred By</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {investments.map((investment) => (
            <TableRow key={investment.id} className="border-card-border">
              <TableCell className="font-medium">
                {investment.clientName}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    investment.planType === "monthly"
                      ? "border-blue-500 text-blue-500 bg-blue-500/10"
                      : "border-green-500 text-green-500 bg-green-500/10"
                  }
                >
                  {investment.planType === "monthly"
                    ? "Monthly (1%)"
                    : "Quarterly (5%)"}
                </Badge>
              </TableCell>
              <TableCell className="text-center font-semibold">
                {formatCurrency(investment.amount)}
              </TableCell>
              <TableCell>{formatDate(investment.startDate)}</TableCell>
              <TableCell>
                <ClientStatusBadge status={investment.status} />
              </TableCell>
              <TableCell className="text-center text-blue-600 dark:text-blue-400 font-medium">
                {formatCurrency(investment.currentMonthReturns ?? 0)}
              </TableCell>
              <TableCell className="text-center text-green-600 dark:text-green-400 font-medium">
                {formatCurrency(investment.returnCredited)}
              </TableCell>
              <TableCell>
                {investment.referredBy ? (
                  <span className="text-sm text-muted-foreground">
                    {investment.referredBy}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground/50">
                    Direct
                  </span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
