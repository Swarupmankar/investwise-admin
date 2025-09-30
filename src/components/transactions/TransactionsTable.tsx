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
import { Transaction } from "@/types/transaction";
import { TransactionTypeBadge } from "./TransactionTypeBadge";
import { TransactionStatusBadge } from "./TransactionStatusBadge";
import { Copy, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface TransactionsTableProps {
  transactions: Transaction[];
  onViewDetails: (transaction: Transaction) => void;
}

export function TransactionsTable({ transactions, onViewDetails }: TransactionsTableProps) {
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: `${type} copied successfully`,
    });
  };

  const openTronScan = (txid: string) => {
    window.open(`https://tronscan.org/#/transaction/${txid}`, '_blank');
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No transactions found.
      </div>
    );
  }

  return (
    <div className="rounded-md border border-card-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date & Time</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Wallet/TXID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="text-sm">
                {formatDate(transaction.date)}
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium">{transaction.clientName}</div>
                  <div className="text-sm text-muted-foreground">
                    {transaction.clientEmail}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ID: {transaction.clientId}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <TransactionTypeBadge type={transaction.type} />
              </TableCell>
              <TableCell className="font-mono font-semibold">
                {formatCurrency(transaction.amount)}
              </TableCell>
              <TableCell>
                {transaction.walletAddress && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono truncate max-w-32">
                        {transaction.walletAddress}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(transaction.walletAddress!, "Wallet address")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
                {transaction.txid && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono truncate max-w-32">
                      {transaction.txid}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(transaction.txid!, "TXID")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openTronScan(transaction.txid!)}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </TableCell>
              <TableCell>
                <TransactionStatusBadge status={transaction.status} />
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(transaction)}
                >
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}