import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { InvestmentWithdrawRequest } from "@/types/InvestmentWithdraw/investmentWithdraw";

interface InvestmentWithdrawTableProps {
  requests: InvestmentWithdrawRequest[];
  onReview: (req: InvestmentWithdrawRequest) => void;
  isLoading?: boolean;
  isError?: boolean;
}

// Same logic as modal, but simplified for table status display
const canonicalStatus = (raw?: string) => {
  const s = (raw ?? "").toString().trim().toLowerCase();
  if (!s) return "unknown";
  if (s.includes("pend")) return "pending";
  if (s.includes("reject")) return "rejected";
  if (s.includes("approv") || s.includes("complete")) return "approved";
  return s;
};

const StatusBadge = ({ status }: { status: string }) => {
  const canonical = canonicalStatus(status);
  let cls =
    "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium";

  if (canonical === "pending") {
    cls += " bg-amber-100 text-amber-800";
  } else if (canonical === "approved") {
    cls += " bg-emerald-100 text-emerald-800";
  } else if (canonical === "rejected") {
    cls += " bg-red-100 text-red-800";
  } else {
    cls += " bg-slate-100 text-slate-800";
  }

  return <span className={cls}>{canonical}</span>;
};

export function InvestmentWithdrawTable({
  requests,
  onReview,
  isLoading,
  isError,
}: InvestmentWithdrawTableProps) {
  // Loading skeleton
  if (isLoading) {
    const skeletonRows = Array.from({ length: 5 });

    return (
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {skeletonRows.map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-24 rounded-md" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="p-12 text-center text-red-500">
          Failed to load withdrawal requests.
        </CardContent>
      </Card>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center text-muted-foreground">
          No withdrawal requests found.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Withdrawal Requests</CardTitle>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {requests.map((req) => (
              <TableRow key={req.id}>
                <TableCell>
                  <div className="font-medium">{req.clientName}</div>
                  <div className="text-sm text-muted-foreground">
                    {req.clientEmail}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="font-mono">
                    ${req.amount.toLocaleString()}
                  </div>
                </TableCell>

                <TableCell>
                  {new Date(req.date).toLocaleString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </TableCell>

                <TableCell>
                  <StatusBadge status={req.status} />
                </TableCell>

                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => onReview(req)}
                  >
                    <Eye className="w-4 h-4" />
                    Review
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
