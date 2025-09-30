import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DepositStatusBadge } from "./DepositStatusBadge";
import { TXIDCopy } from "./TXIDCopy";
import { ScreenshotPreview } from "./ScreenshotPreview";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Eye } from "lucide-react";
import { DepositRequest } from "@/types/transactions/deposit";

interface DepositsTableProps {
  deposits: DepositRequest[];
  onReviewDeposit: (deposit: DepositRequest) => void;
}

export function DepositsTable({
  deposits,
  onReviewDeposit,
}: DepositsTableProps) {
  if (deposits.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="text-muted-foreground">
            No deposits found matching your criteria.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deposit Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Screenshot</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deposits.map((deposit) => (
              <TableRow key={deposit.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{deposit.clientName}</div>
                    <div className="text-sm text-muted-foreground">
                      {deposit.clientEmail}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-mono font-medium">
                    {formatCurrency(deposit.amount)}
                  </div>
                  <div className="text-xs text-muted-foreground">USDT</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {formatDate(deposit.submittedAt)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(deposit.submittedAt).toLocaleTimeString()}
                  </div>
                </TableCell>
                <TableCell>
                  <TXIDCopy txid={deposit.txid} />
                </TableCell>
                <TableCell>
                  <ScreenshotPreview
                    imageUrl={deposit.screenshot}
                    alt={`Deposit proof for ${deposit.clientName}`}
                  />
                </TableCell>
                <TableCell>
                  <DepositStatusBadge status={deposit.status} />
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onReviewDeposit(deposit)}
                    className="gap-2"
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
