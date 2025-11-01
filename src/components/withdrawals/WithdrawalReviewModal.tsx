import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/formatters";
import type { Withdrawal } from "@/types/transactions/withdraw.types";
import { WithdrawalStatusBadge } from "./WithdrawalStatusBadge";
import { WalletAddressCopy } from "./WalletAddressCopy";
import { ScreenshotPreview } from "@/components/deposits/ScreenshotPreview";
import { useToast } from "@/hooks/use-toast";
import { Upload, ExternalLink } from "lucide-react";
import { useGetUserByIdQuery } from "@/API/users.api";
import { useWithdrawalsData } from "@/hooks/useWithdrawalsData";

const canonicalStatus = (raw?: string) => {
  const s = (raw ?? "").toString().trim().toLowerCase();
  if (!s) return "unknown";
  if (
    s === "review" ||
    s === "reviewing" ||
    s === "review_request" ||
    s === "reviewrequested"
  )
    return "review";
  if (s.includes("pend") || s === "pending") return "pending";
  if (s.includes("proof") && s.includes("submitted")) return "proof_submitted";
  if (s.includes("proof") && s.includes("uploaded")) return "proof_submitted";
  if (s.includes("approv") || s === "approved" || s === "paid")
    return "approved";
  if (s.includes("reject") || s === "rejected") return "rejected";
  if (s === "reviewed" || s === "completed") return "reviewed";
  return s;
};

const withdrawFromLabel = (token?: string) => {
  const t = (token ?? "").toString().trim().toUpperCase();
  switch (t) {
    case "FUNDS_AVAILABLE":
      return "Principal Withdrawal";
    case "REFERRAL_EARNING":
      return "Referral Withdrawal";
    case "INVESTMENT_RETURNS":
      return "Return Withdrawal";
    default:
      return token ?? "Withdrawal";
  }
};

interface WithdrawalReviewModalProps {
  withdrawal: Withdrawal | null;
  open: boolean;
  onClose: () => void;
  onApprove: (
    id: string | number,
    adminMessage?: string,
    tronScanLink?: string,
    emailSent?: boolean
  ) => void | Promise<void>;
  onReject: (
    id: string | number,
    adminMessage: string,
    emailSent?: boolean
  ) => void | Promise<void>;
  onMarkReviewed?: (
    id: string | number,
    completionMessage?: string
  ) => void | Promise<void>;
}

export function WithdrawalReviewModal({
  withdrawal,
  open,
  onClose,
  onApprove,
  onReject,
  onMarkReviewed,
}: WithdrawalReviewModalProps) {
  const [adminMessage, setAdminMessage] = useState("");
  const [tronScanLink, setTronScanLink] = useState("");

  const [uploadingLocal, setUploadingLocal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [txId, setTxId] = useState("");
  const { toast } = useToast();

  // helper from central hook
  const { uploadWithdrawProof, isUploading: isUploadingGlobal } =
    useWithdrawalsData();

  // user info
  const userId =
    withdrawal?.userId ?? (withdrawal ? (withdrawal as any).userId : undefined);
  const { data: userData } = useGetUserByIdQuery(userId ?? 0, {
    skip: !userId,
  });

  // reset fields when opening / id changes
  useEffect(() => {
    if (open) {
      setAdminMessage("");
      setTronScanLink("");
      setSelectedFile(null);
      setUploadingLocal(false);
      setTxId("");
    }
  }, [open, withdrawal?.id]);

  // KEEP HOOKS ABOVE EARLY RETURN — parse txId if a TronScan URL is pasted
  useEffect(() => {
    const trimmed = (tronScanLink || "").trim();
    const match =
      trimmed.match(/[#/](?:transaction|tx)\/([a-fA-F0-9]{16,})/) ||
      trimmed.match(/\b([a-fA-F0-9]{16,})\b/);
    if (match && !txId) setTxId(match[1]);
  }, [tronScanLink, txId]);

  if (!withdrawal) return null;

  const statusKey = canonicalStatus(withdrawal.status);

  const clientProofUrl = withdrawal.userProofUrl ?? null;

  const clientProofSubmittedAt =
    (withdrawal as any).clientProofSubmittedAt ??
    (withdrawal as any).userProofSubmittedAt ??
    withdrawal.updatedAt ??
    null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setSelectedFile(f);
  };

  const doApprove = async () => {
    try {
      setUploadingLocal(true);

      // Require a screenshot + txId for the "Approve" step
      if (!selectedFile) {
        toast({
          title: "Screenshot required",
          description: "Please select a payment proof screenshot to upload.",
          variant: "destructive",
        });
        setUploadingLocal(false);
        return;
      }
      if (!txId.trim()) {
        toast({
          title: "txId required",
          description: "Please provide the blockchain transaction ID (txId).",
          variant: "destructive",
        });
        setUploadingLocal(false);
        return;
      }

      const txIdClean =
        txId.trim().match(/[A-Fa-f0-9]{16,}/)?.[0] ?? txId.trim();

      console.log("[modal] doApprove → uploadWithdrawProof", {
        transactionId: withdrawal.id,
        typeofId: typeof withdrawal.id,
        txIdInput: txId,
        txIdClean,
        file: selectedFile
          ? {
              name: selectedFile.name,
              size: selectedFile.size,
              type: selectedFile.type,
            }
          : null,
      });

      // 1) Upload ONLY the admin proof here
      await uploadWithdrawProof(Number(withdrawal.id), selectedFile, txIdClean);

      toast({
        title: "Admin proof uploaded",
        description: "Payment proof uploaded successfully.",
      });

      // 2) Do NOT call onApprove here (no status change on this step)
      // Close the modal; status will be set when user clicks "Mark as Reviewed / Completed"
      closeModal();
    } catch (err) {
      console.error("Upload proof failed", err);
      toast({
        title: "Upload failed",
        description: err?.data?.message || "Failed to upload payment proof.",
        variant: "destructive",
      });
    } finally {
      setUploadingLocal(false);
    }
  };

  const doReject = async () => {
    if (!adminMessage || !adminMessage.trim()) {
      toast({
        title: "Message Required",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      });
      return;
    }
    try {
      await Promise.resolve(onReject(withdrawal.id, adminMessage.trim()));
      toast({
        title: "Withdrawal Rejected",
        description: `Rejected ${formatCurrency(withdrawal.amount)} for ${
          withdrawal.clientName ?? "User"
        }.`,
      });
      closeModal();
    } catch (err) {
      console.error("Reject failed:", err);
      toast({
        title: "Error",
        description: "Failed to reject withdrawal.",
        variant: "destructive",
      });
    }
  };

  const doMarkReviewed = async () => {
    if (!onMarkReviewed) return;
    try {
      await Promise.resolve(
        onMarkReviewed(withdrawal.id, adminMessage?.trim() || undefined)
      );
      toast({
        title: "Marked Reviewed",
        description: `Withdrawal ${formatCurrency(
          withdrawal.amount
        )} marked as reviewed.`,
      });
      closeModal();
    } catch (err) {
      console.error("Mark reviewed failed:", err);
      toast({
        title: "Error",
        description: "Failed to mark as reviewed.",
        variant: "destructive",
      });
    }
  };

  const closeModal = () => {
    setAdminMessage("");
    setTronScanLink("");
    setSelectedFile(null);
    setUploadingLocal(false);
    setTxId("");
    onClose();
  };

  const accountBalance =
    (userData && (userData as any).fundsAvailable) ??
    (withdrawal as any).currentBalance ??
    0;
  const typeLabel = withdrawFromLabel(
    withdrawal.withdrawFromRaw ?? (withdrawal as any).withdrawFrom
  );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && closeModal()}>
      <DialogContent
        aria-describedby={undefined}
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Review Withdrawal Request
            <div className="ml-2">
              <WithdrawalStatusBadge
                status={withdrawal.statusRaw ?? withdrawal.status}
              />
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Review details, upload or view proofs, and approve, reject, or mark
            the withdrawal as reviewed.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: details (UNCHANGED) */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <Label className="text-sm text-muted-foreground">Name</Label>
                  <div className="font-medium">
                    {withdrawal.clientName ?? "—"}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Email</Label>
                  <div className="font-medium">
                    {withdrawal.clientEmail ?? (userData as any)?.email ?? "—"}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Phone</Label>
                  <div className="font-medium">
                    {(userData as any)?.phoneNumber ??
                      withdrawal.phoneNumber ??
                      "—"}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">
                    User ID
                  </Label>
                  <div className="font-medium">
                    {withdrawal.userId ?? withdrawal.clientId ?? "—"}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Withdrawal Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm text-muted-foreground">Type</Label>
                  <div className="font-medium">{typeLabel}</div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Amount Requested
                  </Label>
                  <div className="font-medium text-lg">
                    {formatCurrency(withdrawal.amount)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Current Balance
                  </Label>
                  <div className="font-medium">
                    {formatCurrency(accountBalance)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Wallet Address
                  </Label>
                  <div className="mt-1">
                    <WalletAddressCopy
                      address={withdrawal.walletAddress ?? "—"}
                      showFullAddress
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Request Date
                  </Label>
                  <div className="font-medium">
                    {formatDate(withdrawal.createdAt)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {canonicalStatus(withdrawal.statusRaw) !== "pending" &&
              (withdrawal.adminMessage || (withdrawal as any).reviewedBy) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Previous Admin Action</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <Label className="text-sm text-muted-foreground">
                        Reviewed By
                      </Label>
                      <div className="font-medium">
                        {(withdrawal as any).reviewedBy ?? "—"}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">
                        Reviewed Date
                      </Label>
                      <div className="font-medium">
                        {(withdrawal as any).reviewedAt
                          ? formatDate((withdrawal as any).reviewedAt)
                          : "—"}
                      </div>
                    </div>
                    {withdrawal.adminMessage && (
                      <div>
                        <Label className="text-sm text-muted-foreground">
                          Message
                        </Label>
                        <div className="text-sm">{withdrawal.adminMessage}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
          </div>

          {/* Right: actions (UNCHANGED UI; just numeric id + txId in handler) */}
          <div className="space-y-6">
            {statusKey === "pending" && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Proof / TronScan</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm text-muted-foreground">
                        Upload Screenshot (optional)
                      </Label>
                      <div className="mt-2 flex items-center gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e)}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          disabled={uploadingLocal || isUploadingGlobal}
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm text-muted-foreground">
                        TronScan Transaction ID
                      </Label>
                      <Input
                        placeholder="https://tronscan.org/#/transaction/..."
                        value={txId}
                        onChange={(e) => setTxId(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Admin Message</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={adminMessage}
                      onChange={(e) => setAdminMessage(e.target.value)}
                      rows={4}
                      placeholder="Optional message to the user"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-3">
                      <Button
                        className="flex-1"
                        variant="default"
                        onClick={doApprove}
                        disabled={uploadingLocal || isUploadingGlobal}
                      >
                        ✅ Approve
                      </Button>
                      <Button
                        className="flex-1"
                        variant="destructive"
                        onClick={doReject}
                      >
                        ❌ Reject
                      </Button>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      <div>
                        • You may upload proof (optional) before approval.
                      </div>
                      <div>• Message is required for rejection.</div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {statusKey === "approved" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">
                    Payment Approved
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-6">
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ExternalLink className="w-8 h-8 text-green-500" />
                    </div>
                    <p className="text-lg font-medium text-green-600">
                      Payment Approved
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      This withdrawal has been approved. Below are the uploaded
                      proofs.
                    </p>

                    {/* 🧾 Admin Proof Section */}
                    <div className="mb-6">
                      <h3 className="font-medium text-sm text-muted-foreground mb-1">
                        Admin Uploaded Proof
                      </h3>
                      {withdrawal.adminProofUrl ? (
                        <ScreenshotPreview
                          imageUrl={withdrawal.adminProofUrl}
                          alt="Admin proof screenshot"
                        />
                      ) : (
                        <div className="text-xs text-muted-foreground">
                          No admin proof uploaded.
                        </div>
                      )}
                    </div>

                    {/* 👤 User Proof Section */}
                    <div>
                      <h3 className="font-medium text-sm text-muted-foreground mb-1">
                        User Uploaded Proof
                      </h3>
                      {withdrawal.userProofUrl ? (
                        <ScreenshotPreview
                          imageUrl={withdrawal.userProofUrl}
                          alt="User proof screenshot"
                        />
                      ) : (
                        <div className="text-xs text-muted-foreground">
                          No user proof uploaded.
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {(statusKey === "proof_submitted" || statusKey === "review") && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Client Receiving Proof</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <Label className="text-sm text-muted-foreground">
                        Submitted At
                      </Label>
                      <div className="font-medium">
                        {clientProofSubmittedAt
                          ? formatDate(clientProofSubmittedAt)
                          : "—"}
                      </div>
                    </div>

                    {/* 🧾 Admin Proof Section (direct, same as Approved card) */}
                    <div className="mt-4">
                      <h3 className="font-medium text-sm text-muted-foreground mb-1">
                        Admin Uploaded Proof
                      </h3>
                      {withdrawal.adminProofUrl ? (
                        <ScreenshotPreview
                          imageUrl={withdrawal.adminProofUrl}
                          alt="Admin proof screenshot"
                        />
                      ) : (
                        <div className="text-xs text-muted-foreground">
                          No admin proof uploaded.
                        </div>
                      )}
                    </div>

                    {/* 👤 User Proof Section (direct, same as Approved card) */}
                    <div className="mt-4">
                      <h3 className="font-medium text-sm text-muted-foreground mb-1">
                        User Uploaded Proof
                      </h3>
                      {withdrawal.userProofUrl ? (
                        <ScreenshotPreview
                          imageUrl={withdrawal.userProofUrl}
                          alt="User proof screenshot"
                        />
                      ) : (
                        <div className="text-xs text-muted-foreground">
                          No user proof uploaded.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Completion</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Label className="text-sm text-muted-foreground">
                      Completion Message (optional)
                    </Label>
                    <Textarea
                      value={adminMessage}
                      onChange={(e) => setAdminMessage(e.target.value)}
                      rows={3}
                    />
                    <Button
                      className="mt-3 w-full"
                      variant="default"
                      onClick={doMarkReviewed}
                    >
                      ✅ Mark as Reviewed / Completed
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}

            {statusKey === "reviewed" && (
              <Card>
                <CardHeader>
                  <CardTitle>Withdrawal Complete</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-6">
                    <div className="w-16 h-16 bg-emerald-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">✅</span>
                    </div>
                    <p className="text-lg font-medium text-emerald-600">
                      Completed
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Withdrawal has been processed and reviewed.
                    </p>
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

export default WithdrawalReviewModal;
