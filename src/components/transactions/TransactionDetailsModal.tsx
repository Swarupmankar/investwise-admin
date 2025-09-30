import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Transaction } from "@/types/transaction";
import { TransactionTypeBadge } from "./TransactionTypeBadge";
import { TransactionStatusBadge } from "./TransactionStatusBadge";
import { Copy, ExternalLink, User, Calendar, CreditCard, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useWithdrawalsData } from "@/hooks/useWithdrawalsData";

interface TransactionDetailsModalProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransactionDetailsModal({ 
  transaction, 
  open, 
  onOpenChange 
}: TransactionDetailsModalProps) {
  const { getWithdrawalById } = useWithdrawalsData();
  if (!transaction) return null;

  const isWithdrawal = transaction.type.startsWith("withdrawal-");
  const relatedWithdrawal = transaction.sourceType === "withdrawal" ? getWithdrawalById(transaction.sourceId) : undefined;
  const hasAnyProof = Boolean(relatedWithdrawal?.tronScanScreenshot || relatedWithdrawal?.clientProofScreenshot || relatedWithdrawal?.tronScanLink);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: `${type} copied successfully`,
    });
  };

  const openTronScan = (value: string) => {
    const url = /^https?:\/\//i.test(value) ? value : `https://tronscan.org/#/transaction/${value}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Transaction Details
            <TransactionTypeBadge type={transaction.type} />
            <TransactionStatusBadge status={transaction.status} />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Client Information */}
          <div className="bg-card p-4 rounded-lg border border-card-border">
            <h3 className="flex items-center gap-2 font-semibold mb-3">
              <User className="h-4 w-4" />
              Client Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{transaction.clientName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{transaction.clientEmail}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Client ID</p>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm">{transaction.clientId}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(transaction.clientId, "Client ID")}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="bg-card p-4 rounded-lg border border-card-border">
            <h3 className="flex items-center gap-2 font-semibold mb-3">
              <CreditCard className="h-4 w-4" />
              Transaction Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="font-mono text-lg font-bold">{formatCurrency(transaction.amount)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(transaction.date)}
                </p>
              </div>
              {transaction.walletAddress && (
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Wallet Address</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm break-all">{transaction.walletAddress}</p>
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
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Transaction ID</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm break-all">{transaction.txid}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(transaction.txid!, "TXID")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openTronScan(transaction.txid!)}
                    >
                      <ExternalLink className="h-3 w-3 mr-2" />
                      TronScan
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Admin Messages & Notes */}
          {(transaction.adminMessage || transaction.notes) && (
            <div className="bg-card p-4 rounded-lg border border-card-border">
              <h3 className="flex items-center gap-2 font-semibold mb-3">
                <FileText className="h-4 w-4" />
                Admin Notes
              </h3>
              {transaction.adminMessage && (
                <div className="mb-3">
                  <p className="text-sm text-muted-foreground">Admin Message</p>
                  <p className="bg-muted p-3 rounded text-sm">{transaction.adminMessage}</p>
                </div>
              )}
              {transaction.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="bg-muted p-3 rounded text-sm">{transaction.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Screenshot */}
          {transaction.screenshot && !(isWithdrawal && hasAnyProof) && (
            <div className="bg-card p-4 rounded-lg border border-card-border">
              <h3 className="font-semibold mb-3">Proof Screenshot</h3>
              <div className="relative">
                <img 
                  src={transaction.screenshot} 
                  alt="Transaction proof"
                  className="w-full h-auto rounded border border-card-border"
                  loading="lazy"
                />
              </div>
            </div>
          )}
          
          {/* Payment Proofs (Principal Withdrawals) */}
          {isWithdrawal && hasAnyProof && (
            <div className="bg-card p-4 rounded-lg border border-card-border">
              <h3 className="flex items-center gap-2 font-semibold mb-3">
                <FileText className="h-4 w-4" />
                Payment Proofs
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(relatedWithdrawal?.tronScanLink || relatedWithdrawal?.tronScanScreenshot) && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Admin Proof (TronScan)</p>
                    {relatedWithdrawal?.tronScanLink && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openTronScan(relatedWithdrawal.tronScanLink!)}
                        className="mb-2"
                      >
                        <ExternalLink className="h-3 w-3 mr-2" />
                        View on TronScan
                      </Button>
                    )}
                    {relatedWithdrawal?.tronScanScreenshot && (
                      <img
                        src={relatedWithdrawal.tronScanScreenshot}
                        alt={`Admin TronScan proof screenshot for withdrawal ${transaction.id}`}
                        className="w-full h-auto rounded border border-card-border"
                        loading="lazy"
                      />
                    )}
                  </div>
                )}
                {relatedWithdrawal?.clientProofScreenshot && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Client Proof {relatedWithdrawal?.clientProofSubmittedAt ? `• Submitted ${formatDate(relatedWithdrawal.clientProofSubmittedAt)}` : ""}
                    </p>
                    <img
                      src={relatedWithdrawal.clientProofScreenshot}
                      alt={`Client payment proof screenshot for withdrawal ${transaction.id}`}
                      className="w-full h-auto rounded border border-card-border"
                      loading="lazy"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Source Information */}
          <div className="bg-muted p-3 rounded text-sm">
            <p className="text-muted-foreground">
              Source: {transaction.sourceType} (ID: {transaction.sourceId})
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}