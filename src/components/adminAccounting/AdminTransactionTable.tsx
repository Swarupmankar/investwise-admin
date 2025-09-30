// src/components/adminAccounting/AdminTransactionTable.tsx
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Eye,
  FileText,
  ExternalLink,
  Vault,
  TrendingUp,
  X,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { AdminTransaction } from "@/types/adminTransaction";

interface AdminTransactionTableProps {
  transactions: AdminTransaction[];
}

export const AdminTransactionTable = ({
  transactions,
}: AdminTransactionTableProps) => {
  const [selectedTransaction, setSelectedTransaction] =
    useState<AdminTransaction | null>(null);

  const [proofViewerUrl, setProofViewerUrl] = useState<string | null>(null);
  const [proofViewerIsPdf, setProofViewerIsPdf] = useState<boolean>(false);

  const getTypeBadge = (type: AdminTransaction["type"]) => {
    if (type === "net_profit") {
      return (
        <Badge
          variant="default"
          className="bg-success text-success-foreground inline-flex items-center gap-1"
        >
          <TrendingUp className="w-3 h-3" />
          <span>Net Profit</span>
        </Badge>
      );
    }
    return (
      <Badge
        variant="secondary"
        className="bg-primary text-primary-foreground inline-flex items-center gap-1"
      >
        <Vault className="w-3 h-3" />
        <span>Principal</span>
      </Badge>
    );
  };

  const TransactionDetailModal = ({
    transaction,
  }: {
    transaction: AdminTransaction;
  }) => {
    const proofUrl = transaction.proofScreenshot;
    const isValidUrl =
      typeof proofUrl === "string" &&
      proofUrl.length > 0 &&
      /^https?:\/\//i.test(proofUrl);
    const isPdf = isValidUrl && /\.pdf(\?.*)?$/i.test(proofUrl as string);

    const openProofViewer = () => {
      if (!isValidUrl) return;
      setProofViewerUrl(proofUrl as string);
      setProofViewerIsPdf(isPdf);
    };

    return (
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Transaction Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">
                Transaction Type
              </h4>
              {getTypeBadge(transaction.type)}
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">
                Amount
              </h4>
              <p className="text-2xl font-bold">
                {formatCurrency(transaction.amount)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">
                Date
              </h4>
              <p>{formatDate(transaction.date)}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">
                Admin
              </h4>
              <p>{transaction.adminName}</p>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">
              Purpose
            </h4>
            <p>{transaction.purpose}</p>
          </div>

          {transaction.notes && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">
                Notes
              </h4>
              <p className="text-sm bg-muted p-3 rounded-md">
                {transaction.notes}
              </p>
            </div>
          )}

          {(transaction.proofScreenshot || transaction.tronScanLink) && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">
                Attachments
              </h4>
              <div className="space-y-2">
                {transaction.proofScreenshot && (
                  <div className="flex items-center gap-2 p-2 border rounded-md">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm flex-1 truncate">
                      Proof Screenshot
                    </span>

                    {isValidUrl ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={openProofViewer}
                      >
                        View Proof
                      </Button>
                    ) : (
                      <div className="text-xs text-muted-foreground">
                        No preview available
                      </div>
                    )}
                  </div>
                )}

                {transaction.tronScanLink && (
                  <div className="flex items-center gap-2 p-2 border rounded-md">
                    <ExternalLink className="w-4 h-4" />
                    <span className="text-sm flex-1 truncate">
                      TronScan Transaction
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        window.open(transaction.tronScanLink, "_blank")
                      }
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Created: {new Date(transaction.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      </DialogContent>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Transaction Log</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Vault className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No transactions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Attachments</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      {formatDate(transaction.date)}
                    </TableCell>
                    <TableCell>{getTypeBadge(transaction.type)}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {transaction.purpose}
                    </TableCell>
                    <TableCell>{transaction.adminName}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {transaction.proofScreenshot && (
                          <FileText className="w-4 h-4 text-muted-foreground" />
                        )}
                        {transaction.tronScanLink && (
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedTransaction(transaction)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>

                        {/* DialogContent for details */}
                        {selectedTransaction?.id === transaction.id ? (
                          <TransactionDetailModal
                            transaction={selectedTransaction}
                          />
                        ) : (
                          <TransactionDetailModal transaction={transaction} />
                        )}
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {proofViewerUrl && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/75 p-4"
          onClick={() => setProofViewerUrl(null)}
        >
          <div
            className="relative bg-neutral-900 text-white rounded-md shadow-lg max-w-[96%] max-h-[96%] overflow-auto border border-neutral-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-2 border-b border-neutral-800">
              <div className="text-sm font-medium text-white">Proof Viewer</div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setProofViewerUrl(null)}
                className="text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-4 flex items-center justify-center">
              {proofViewerIsPdf ? (
                <iframe
                  src={proofViewerUrl}
                  title="Proof PDF"
                  className="w-[80vw] h-[80vh]"
                  style={{ backgroundColor: "#0f172a" }}
                />
              ) : (
                <img
                  src={proofViewerUrl}
                  alt="Proof screenshot"
                  className="max-h-[80vh] max-w-[80vw] object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
