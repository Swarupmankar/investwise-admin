import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

import DepositStatusBadge from "./DepositStatusBadge";
import { TXIDCopy } from "./TXIDCopy";
import { ScreenshotPreview } from "./ScreenshotPreview";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, User, Mail, Hash } from "lucide-react";
import { DepositRequest } from "@/types/transactions/deposit";

interface DepositReviewModalProps {
  deposit: DepositRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (
    id: number | string,
    message?: string,
    emailSent?: boolean
  ) => Promise<any>;
  onReject: (
    id: number | string,
    message?: string,
    emailSent?: boolean
  ) => Promise<any>;
}

const canonicalStatus = (raw?: string) => {
  const s = (raw ?? "").toString().trim().toLowerCase();
  if (!s) return "unknown";
  if (s.includes("pend") || s.includes("process") || s.includes("await"))
    return "pending";
  if (s.includes("reject")) return "rejected";
  if (
    s.includes("approv") ||
    s.includes("paid") ||
    s.includes("complete") ||
    s.includes("success")
  )
    return "approved";
  return s;
};

export function DepositReviewModal({
  deposit,
  isOpen,
  onClose,
  onApprove,
  onReject,
}: DepositReviewModalProps) {
  const [adminMessage, setAdminMessage] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Reset message/sendEmail each time modal opens for a new deposit
  useEffect(() => {
    if (isOpen) {
      setAdminMessage("");
      setSendEmail(true);
    }
  }, [isOpen, deposit?.id]);

  if (!deposit) return null;

  const status = canonicalStatus(deposit.status);

  const canTakeAction = status === "pending";

  const handleAction = async (action: "approve" | "reject") => {
    setIsProcessing(true);
    try {
      const idToSend = deposit.id;

      // call the parent handler and await its promise
      if (action === "approve") {
        await onApprove(idToSend, adminMessage || undefined, sendEmail);
        toast({
          title: "Deposit Approved",
          description: `Deposit of ${formatCurrency(
            deposit.amount
          )} has been approved.`,
        });
      } else {
        await onReject(idToSend, adminMessage || undefined, sendEmail);
        toast({
          title: "Deposit Rejected",
          description: `Deposit of ${formatCurrency(
            deposit.amount
          )} has been rejected.`,
        });
      }

      // close and reset
      setAdminMessage("");
      setSendEmail(true);
      onClose();
    } catch (err: any) {
      // log and show detailed error if available
      console.error("Deposit action failed:", err);
      toast({
        title: "Error",
        description:
          err?.message ??
          (err?.data?.message as string) ??
          "Failed to process deposit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>Deposit Review</span>
            <span className="font-medium">— {deposit.clientName}</span>
            <div className="ml-2">
              <DepositStatusBadge status={deposit.status} />
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - User & Deposit Info */}
          <div className="space-y-6">
            {/* User Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Client Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{deposit.clientName}</span>
                </div>

                {deposit.clientEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{deposit.clientEmail}</span>
                  </div>
                )}

                {("clientId" in deposit || (deposit as any).clientId) && (
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{(deposit as any).clientId}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Deposit Details */}
            <Card>
              <CardHeader>
                <CardTitle>Deposit Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Amount</Label>
                  <div className="text-2xl font-bold font-mono">
                    {formatCurrency(deposit.amount)} USDT
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground">Submitted</Label>
                  <div className="text-sm">
                    {deposit.submittedAt ? (
                      <>
                        {formatDate(deposit.submittedAt)} at{" "}
                        {new Date(deposit.submittedAt).toLocaleTimeString()}
                      </>
                    ) : (
                      "—"
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground">
                    Transaction ID
                  </Label>
                  <div className="mt-1">
                    {deposit.txid ? (
                      <TXIDCopy txid={deposit.txid} showFullTxid />
                    ) : (
                      <div className="text-sm text-muted-foreground">—</div>
                    )}
                  </div>
                </div>

                {("reviewedAt" in deposit || (deposit as any).reviewedAt) && (
                  <div>
                    <Label className="text-muted-foreground">Reviewed</Label>
                    <div className="text-sm">
                      {(deposit as any).reviewedAt ? (
                        <>
                          {formatDate((deposit as any).reviewedAt)} at{" "}
                          {new Date(
                            (deposit as any).reviewedAt
                          ).toLocaleTimeString()}
                          {(deposit as any).reviewedBy
                            ? ` by ${(deposit as any).reviewedBy}`
                            : ""}
                        </>
                      ) : (
                        "—"
                      )}
                    </div>
                  </div>
                )}

                {("adminMessage" in deposit || (deposit as any).adminMessage) &&
                  (deposit as any).adminMessage && (
                    <div>
                      <Label className="text-muted-foreground">
                        Admin Message
                      </Label>
                      <div className="text-sm bg-muted p-3 rounded-lg mt-1">
                        {(deposit as any).adminMessage}
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Screenshot & Actions */}
          <div className="space-y-6">
            {/* Screenshot */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Proof</CardTitle>
              </CardHeader>
              <CardContent>
                {deposit.screenshot ? (
                  <div className="w-full">
                    <ScreenshotPreview imageUrl={deposit.screenshot} />
                  </div>
                ) : (
                  <div className="h-48 bg-muted rounded-lg flex items-center justify-center">
                    <span className="text-muted-foreground">
                      No screenshot provided
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Admin Actions */}
            {canTakeAction ? (
              <Card>
                <CardHeader>
                  <CardTitle>Admin Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminMessage">
                      Message to Client (Optional)
                    </Label>
                    <Textarea
                      id="adminMessage"
                      placeholder="Add a message to explain your decision..."
                      value={adminMessage}
                      onChange={(e) => setAdminMessage(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sendEmail"
                      checked={sendEmail}
                      onCheckedChange={(checked) =>
                        setSendEmail(Boolean(checked))
                      }
                    />
                    <Label htmlFor="sendEmail" className="text-sm">
                      Send notification via email
                    </Label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={() => handleAction("approve")}
                      disabled={isProcessing}
                      className="flex-1 gap-2"
                      variant="default"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve Deposit
                    </Button>
                    <Button
                      onClick={() => handleAction("reject")}
                      disabled={isProcessing}
                      className="flex-1 gap-2"
                      variant="destructive"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject Deposit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    This deposit is{" "}
                    <strong>{canonicalStatus(deposit.status)}</strong>. No admin
                    actions are available.
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DepositReviewModal;
