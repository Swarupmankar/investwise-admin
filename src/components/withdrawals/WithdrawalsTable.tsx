import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { WithdrawalStatusBadge } from "./WithdrawalStatusBadge";
import { WalletAddressCopy } from "./WalletAddressCopy";
import type { Withdrawal } from "@/types/transactions/withdraw";

interface WithdrawalsTableProps {
  withdrawals: Withdrawal[];
  onReview: (withdrawal: Withdrawal) => void;
}

const getTypeLabel = (type: Withdrawal["withdrawFrom"]) => {
  if (!type) return "-";
  const t = String(type).toLowerCase();
  switch (t) {
    case "return":
      return "Return";
    case "referral":
      return "Referral";
    case "principal":
      return "Principal";
    default:
      // fallback: title case
      return String(type)
        .split(/[ _-]/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
  }
};

/** normalize status for comparisons (handles "PENDING", "pending", "Proof_Submitted", etc.) */
const norm = (v?: string) => (v ? v.toString().trim().toLowerCase() : "");

export function WithdrawalsTable({
  withdrawals,
  onReview,
}: WithdrawalsTableProps) {
  if (!withdrawals || withdrawals.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No withdrawal requests found.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Wallet Address</TableHead>
            <TableHead>Request Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {withdrawals.map((w) => {
            const idKey = String(w.id);
            const statusNorm = norm(w.status);

            // map label for button depending on status (normalized)
            const actionLabel =
              statusNorm === "approved"
                ? "Waiting for Proof"
                : statusNorm === "proof_submitted" ||
                  statusNorm === "proof-submitted"
                ? "Review Proof"
                : statusNorm === "reviewed" || statusNorm === "completed"
                ? "View Details"
                : "Review";

            return (
              <TableRow key={idKey}>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{w.clientName ?? "-"}</div>
                    <div className="text-sm text-muted-foreground">
                      {w.clientEmail ?? "-"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ID: {w.clientId ?? "-"}
                    </div>
                  </div>
                </TableCell>

                <TableCell className="whitespace-nowrap">
                  <span className="font-medium">
                    {getTypeLabel(w.withdrawFrom)}
                  </span>
                </TableCell>

                <TableCell className="font-mono text-right whitespace-nowrap">
                  {formatCurrency(
                    typeof w.amount === "number"
                      ? w.amount
                      : Number(w.amount ?? 0)
                  )}
                </TableCell>

                <TableCell className="max-w-[260px]">
                  <WalletAddressCopy address={w.walletAddress ?? ""} />
                </TableCell>

                <TableCell className="text-sm whitespace-nowrap">
                  {w.createdAt ? formatDate(w.createdAt) : "—"}
                </TableCell>

                <TableCell className="whitespace-nowrap">
                  <WithdrawalStatusBadge status={w.status} />
                </TableCell>

                <TableCell className="whitespace-nowrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onReview(w)}
                    className="h-8"
                  >
                    {actionLabel}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
