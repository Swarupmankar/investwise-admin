import { useEffect, useRef, useState } from "react";

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
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate } from "@/lib/formatters";
import {
  CheckCircle,
  XCircle,
  User,
  Mail,
  Hash,
  CalendarClock,
} from "lucide-react";
import { InvestmentWithdrawRequest } from "@/types/InvestmentWithdraw/investmentWithdraw";

interface InvestmentWithdrawReviewModalProps {
  request: InvestmentWithdrawRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: number | string) => Promise<any>;
  onReject: (id: number | string, rejectionReason: string) => Promise<any>;
}

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

export function InvestmentWithdrawReviewModal({
  request,
  isOpen,
  onClose,
  onApprove,
  onReject,
}: InvestmentWithdrawReviewModalProps) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const reasonRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setRejectionReason("");
    }
  }, [isOpen, request?.id]);

  if (!request) return null;

  const status = canonicalStatus(request.status);
  const canTakeAction = status === "pending";

  const handleAction = async (action: "approve" | "reject") => {
    if (action === "reject" && !rejectionReason.trim()) {
      toast({
        title: "Rejection reason required",
        description:
          "Please provide a reason for rejecting this settlement request.",
        variant: "destructive",
      });
      reasonRef.current?.focus();
      return;
    }

    setIsProcessing(true);
    try {
      const idToSend = request.id;

      if (action === "approve") {
        await onApprove(idToSend);
        toast({
          title: "Settlement Approved",
          description: `Principal Withdrawal settlement of ${formatCurrency(
            request.amount
          )} has been approved.`,
        });
      } else {
        await onReject(idToSend, rejectionReason.trim());
        toast({
          title: "Settlement Rejected",
          description: `Principal Withdrawal settlement of ${formatCurrency(
            request.amount
          )} has been rejected.`,
        });
      }

      setRejectionReason("");
      onClose();
    } catch (err: any) {
      console.error("Settlement action failed:", err);
      toast({
        title: "Error",
        description:
          err?.message ??
          (err?.data?.message as string) ??
          "Failed to process settlement. Please try again.",
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
            <span>Withdrawal Settlement Review</span>
            <span className="font-medium">— {request.clientName}</span>
            <div className="ml-2">
              <StatusBadge status={request.status} />
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Client & Settlement Info */}
          <div className="space-y-6">
            {/* Client Information */}
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
                  <span className="font-medium">{request.clientName}</span>
                </div>

                {request.clientEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{request.clientEmail}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Settlement ID: {request.id}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    Investment ID: {request.investmentId}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Settlement Details */}
            <Card>
              <CardHeader>
                <CardTitle>Settlement Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Amount</Label>
                  <div className="text-2xl font-bold font-mono">
                    {formatCurrency(request.amount)}
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground">Created</Label>
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarClock className="w-4 h-4 text-muted-foreground" />
                    {request.date ? (
                      <>
                        {formatDate(request.date)} at{" "}
                        {new Date(request.date).toLocaleTimeString()}
                      </>
                    ) : (
                      "—"
                    )}
                  </div>
                </div>

                {/* ✅ Approved at (only when backend status is COMPLETED) */}
                {request.rawStatus === "COMPLETED" && request.approvedAt && (
                  <div>
                    <Label className="text-muted-foreground">Approved at</Label>
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarClock className="w-4 h-4 text-muted-foreground" />
                      <>
                        {formatDate(request.approvedAt)} at{" "}
                        {new Date(request.approvedAt).toLocaleTimeString()}
                      </>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Admin Actions */}
          <div className="space-y-6">
            {canTakeAction ? (
              <Card>
                <CardHeader>
                  <CardTitle>Admin Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={() => handleAction("approve")}
                      disabled={isProcessing}
                      className="flex-1 gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve Settlement
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent>
                  <div className="text-sm pt-5 text-muted-foreground">
                    This settlement is{" "}
                    <strong>{canonicalStatus(request.status)}</strong>.
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
