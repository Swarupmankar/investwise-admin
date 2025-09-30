// // src/components/withdrawals/WithdrawalReviewModal.tsx
// import { useEffect, useState } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { formatCurrency, formatDate } from "@/lib/formatters";
// import type { Withdrawal } from "@/types/transactions/withdraw";
// import { WithdrawalStatusBadge } from "./WithdrawalStatusBadge";
// import { WalletAddressCopy } from "./WalletAddressCopy";
// import { ScreenshotPreview } from "@/components/deposits/ScreenshotPreview";
// import { useToast } from "@/hooks/use-toast";
// import { Upload, ExternalLink } from "lucide-react";

// /**
//  * Normalizes backend status strings to a small set of internal keys we use
//  * for conditional rendering. Returns one of:
//  *  - "pending", "review", "proof_submitted", "approved", "rejected", "reviewed", "unknown"
//  */
// const canonicalStatus = (raw?: string) => {
//   const s = (raw ?? "").toString().trim().toLowerCase();
//   if (!s) return "unknown";
//   if (
//     s === "review" ||
//     s === "reviewing" ||
//     (s.includes("review") && !s.includes("submitted"))
//   )
//     return "review";
//   if (s.includes("pend") || s === "pending") return "pending";
//   if (
//     s.includes("proof_submitted") ||
//     s.includes("proof-submitted") ||
//     s.includes("proofsubmitted")
//   )
//     return "proof_submitted";
//   if (s.includes("approv") || s === "approved" || s === "paid")
//     return "approved";
//   if (s.includes("reject") || s === "rejected") return "rejected";
//   if (s === "reviewed" || s === "completed") return "reviewed";
//   return s;
// };

// interface WithdrawalReviewModalProps {
//   withdrawal: Withdrawal | null;
//   open: boolean;
//   onClose: () => void;
//   onApprove: (
//     id: string | number,
//     adminMessage?: string,
//     tronScanLink?: string,
//     emailSent?: boolean
//   ) => void;
//   onReject: (
//     id: string | number,
//     adminMessage: string,
//     emailSent?: boolean
//   ) => void;
//   onMarkReviewed?: (id: string | number, completionMessage?: string) => void;
// }

// export function WithdrawalReviewModal({
//   withdrawal,
//   open,
//   onClose,
//   onApprove,
//   onReject,
//   onMarkReviewed,
// }: WithdrawalReviewModalProps) {
//   const [adminMessage, setAdminMessage] = useState("");
//   const [tronScanLink, setTronScanLink] = useState("");
//   const [emailSent, setEmailSent] = useState(true);
//   const [uploading, setUploading] = useState(false);
//   const { toast } = useToast();

//   // Reset local form state each time a new withdrawal loads / modal opens
//   useEffect(() => {
//     if (open) {
//       setAdminMessage("");
//       setTronScanLink("");
//       setEmailSent(true);
//       setUploading(false);
//     }
//   }, [open, withdrawal?.id]);

//   // Nothing to render
//   if (!withdrawal) return null;

//   const statusKey = canonicalStatus(withdrawal.status);

//   const handleFileUpload = async (
//     event: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     const file = event.target.files?.[0];
//     if (!file) return;
//     setUploading(true);
//     try {
//       // If you have an upload API, upload here and set some URL state.
//       // For now we simulate success and show toast.
//       await new Promise((r) => setTimeout(r, 800));
//       toast({
//         title: "Upload complete",
//         description: "Screenshot uploaded (simulated).",
//       });
//     } catch (err) {
//       toast({
//         title: "Upload failed",
//         description: "Failed to upload screenshot.",
//         variant: "destructive",
//       });
//     } finally {
//       setUploading(false);
//     }
//   };

//   const doApprove = () => {
//     // TronScan required for approve
//     if (!tronScanLink || !tronScanLink.trim()) {
//       toast({
//         title: "TronScan Link Required",
//         description: "Provide a valid TronScan transaction link to approve.",
//         variant: "destructive",
//       });
//       return;
//     }

//     try {
//       onApprove(
//         withdrawal.id,
//         adminMessage?.trim() || undefined,
//         tronScanLink.trim(),
//         emailSent
//       );
//       toast({
//         title: "Withdrawal Approved",
//         description: `Approved ${formatCurrency(withdrawal.amount)} for ${
//           withdrawal.clientName
//         }`,
//       });
//       closeModal();
//     } catch (err) {
//       console.error("Approve failed:", err);
//       toast({
//         title: "Error",
//         description: "Failed to approve withdrawal.",
//         variant: "destructive",
//       });
//     }
//   };

//   const doReject = () => {
//     if (!adminMessage || !adminMessage.trim()) {
//       toast({
//         title: "Message Required",
//         description: "Please provide a reason for rejection.",
//         variant: "destructive",
//       });
//       return;
//     }

//     try {
//       onReject(withdrawal.id, adminMessage.trim(), emailSent);
//       toast({
//         title: "Withdrawal Rejected",
//         description: `Rejected ${formatCurrency(withdrawal.amount)} for ${
//           withdrawal.clientName
//         }`,
//       });
//       closeModal();
//     } catch (err) {
//       console.error("Reject failed:", err);
//       toast({
//         title: "Error",
//         description: "Failed to reject withdrawal.",
//         variant: "destructive",
//       });
//     }
//   };

//   const doMarkReviewed = () => {
//     if (!onMarkReviewed) return;
//     try {
//       onMarkReviewed(withdrawal.id, adminMessage?.trim() || undefined);
//       toast({
//         title: "Marked Reviewed",
//         description: `Withdrawal ${formatCurrency(
//           withdrawal.amount
//         )} marked as reviewed.`,
//       });
//       closeModal();
//     } catch (err) {
//       console.error("Mark reviewed failed:", err);
//       toast({
//         title: "Error",
//         description: "Failed to mark as reviewed.",
//         variant: "destructive",
//       });
//     }
//   };

//   const closeModal = () => {
//     setAdminMessage("");
//     setTronScanLink("");
//     setEmailSent(true);
//     setUploading(false);
//     onClose();
//   };

//   const getTypeLabel = (t: Withdrawal["withdrawFrom"]) => {
//     switch (t) {
//       case "return":
//         return "Return Withdrawal";
//       case "referral":
//         return "Referral Withdrawal";
//       case "principal":
//         return "Principal Withdrawal";
//       default:
//         return String(t);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={(v) => !v && closeModal()}>
//       <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle className="flex items-center gap-3">
//             Review Withdrawal Request
//             <div className="ml-2">
//               <WithdrawalStatusBadge status={withdrawal.status} />
//             </div>
//           </DialogTitle>
//         </DialogHeader>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {/* Left: details */}
//           <div className="space-y-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle>User Information</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-2">
//                 <div>
//                   <Label className="text-sm text-muted-foreground">Name</Label>
//                   <div className="font-medium">{withdrawal.clientName}</div>
//                 </div>
//                 <div>
//                   <Label className="text-sm text-muted-foreground">Email</Label>
//                   <div className="font-medium">
//                     {withdrawal.clientEmail ?? "—"}
//                   </div>
//                 </div>
//                 <div>
//                   <Label className="text-sm text-muted-foreground">Phone</Label>
//                   <div className="font-medium">
//                     {withdrawal.clientPhone ?? "—"}
//                   </div>
//                 </div>
//                 <div>
//                   <Label className="text-sm text-muted-foreground">
//                     User ID
//                   </Label>
//                   <div className="font-medium">{withdrawal.clientId}</div>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardHeader>
//                 <CardTitle>Withdrawal Details</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 <div>
//                   <Label className="text-sm text-muted-foreground">Type</Label>
//                   <div className="font-medium">
//                     {getTypeLabel(withdrawal.withdrawFrom)}
//                   </div>
//                 </div>

//                 <div>
//                   <Label className="text-sm text-muted-foreground">
//                     Amount Requested
//                   </Label>
//                   <div className="font-medium text-lg">
//                     {formatCurrency(withdrawal.amount)}
//                   </div>
//                 </div>

//                 <div>
//                   <Label className="text-sm text-muted-foreground">
//                     Current Balance
//                   </Label>
//                   <div className="font-medium">
//                     {formatCurrency(withdrawal.amount)}
//                   </div>
//                 </div>

//                 <div>
//                   <Label className="text-sm text-muted-foreground">
//                     Wallet Address
//                   </Label>
//                   <div className="mt-1">
//                     <WalletAddressCopy
//                       address={withdrawal.walletAddress}
//                       showFullAddress
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <Label className="text-sm text-muted-foreground">
//                     Request Date
//                   </Label>
//                   <div className="font-medium">
//                     {formatDate(withdrawal.createdAt)}
//                   </div>
//                 </div>

//                 {withdrawal.notes && (
//                   <div>
//                     <Label className="text-sm text-muted-foreground">
//                       Notes
//                     </Label>
//                     <div className="text-sm">{withdrawal.notes}</div>
//                   </div>
//                 )}
//               </CardContent>
//             </Card>

//             {/* previous admin action */}
//             {withdrawal.status !== "pending" &&
//               (withdrawal.adminMessage || withdrawal.reviewedBy) && (
//                 <Card>
//                   <CardHeader>
//                     <CardTitle>Previous Admin Action</CardTitle>
//                   </CardHeader>
//                   <CardContent className="space-y-2">
//                     <div>
//                       <Label className="text-sm text-muted-foreground">
//                         Reviewed By
//                       </Label>
//                       <div className="font-medium">
//                         {withdrawal.reviewedBy ?? "—"}
//                       </div>
//                     </div>
//                     <div>
//                       <Label className="text-sm text-muted-foreground">
//                         Reviewed Date
//                       </Label>
//                       <div className="font-medium">
//                         {withdrawal.reviewedAt
//                           ? formatDate(withdrawal.reviewedAt)
//                           : "—"}
//                       </div>
//                     </div>
//                     {withdrawal.adminMessage && (
//                       <div>
//                         <Label className="text-sm text-muted-foreground">
//                           Message
//                         </Label>
//                         <div className="text-sm">{withdrawal.adminMessage}</div>
//                       </div>
//                     )}
//                     {withdrawal.tronScanLink && (
//                       <div>
//                         <Label className="text-sm text-muted-foreground">
//                           TronScan
//                         </Label>
//                         <a
//                           href={withdrawal.tronScanLink}
//                           target="_blank"
//                           rel="noreferrer"
//                           className="flex items-center gap-2 text-primary hover:underline"
//                         >
//                           View Transaction <ExternalLink className="h-4 w-4" />
//                         </a>
//                       </div>
//                     )}
//                   </CardContent>
//                 </Card>
//               )}
//           </div>

//           {/* Right: actions, different UI depending on canonical status */}
//           <div className="space-y-6">
//             {/* pending or review: admin can act */}
//             {statusKey === "pending" || statusKey === "review" ? (
//               <>
//                 <Card>
//                   <CardHeader>
//                     <CardTitle>Payment Proof / TronScan</CardTitle>
//                   </CardHeader>
//                   <CardContent className="space-y-3">
//                     <div>
//                       <Label className="text-sm text-muted-foreground">
//                         Upload Screenshot (optional)
//                       </Label>
//                       <div className="mt-2 flex items-center gap-2">
//                         <Input
//                           type="file"
//                           accept="image/*"
//                           onChange={handleFileUpload}
//                           disabled={uploading}
//                         />
//                         <Button
//                           variant="outline"
//                           size="icon"
//                           disabled={uploading}
//                         >
//                           <Upload className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     </div>

//                     <div>
//                       <Label className="text-sm text-muted-foreground">
//                         TronScan Transaction Link (required for approve)
//                       </Label>
//                       <Input
//                         placeholder="https://tronscan.org/#/transaction/..."
//                         value={tronScanLink}
//                         onChange={(e) => setTronScanLink(e.target.value)}
//                         className="mt-2"
//                       />
//                     </div>
//                   </CardContent>
//                 </Card>

//                 <Card>
//                   <CardHeader>
//                     <CardTitle>Admin Message</CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <Textarea
//                       value={adminMessage}
//                       onChange={(e) => setAdminMessage(e.target.value)}
//                       rows={4}
//                       placeholder="Optional message to the user"
//                     />
//                     <div className="flex items-center gap-2 mt-3">
//                       <Checkbox
//                         checked={emailSent}
//                         onCheckedChange={(v) => setEmailSent(Boolean(v))}
//                       />
//                       <Label className="text-sm">
//                         Send notification via email
//                       </Label>
//                     </div>
//                   </CardContent>
//                 </Card>

//                 <Card>
//                   <CardHeader>
//                     <CardTitle>Actions</CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="flex gap-3">
//                       <Button
//                         className="flex-1"
//                         variant="default"
//                         onClick={doApprove}
//                       >
//                         ✅ Approve
//                       </Button>
//                       <Button
//                         className="flex-1"
//                         variant="destructive"
//                         onClick={doReject}
//                       >
//                         ❌ Reject
//                       </Button>
//                     </div>
//                     <div className="mt-2 text-sm text-muted-foreground">
//                       <div>• TronScan link is required for approval.</div>
//                       <div>• Message is required for rejection.</div>
//                     </div>
//                   </CardContent>
//                 </Card>
//               </>
//             ) : null}

//             {/* approved -> waiting for client proof */}
//             {statusKey === "approved" && (
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Payment Sent — Awaiting Proof</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-center p-6">
//                     <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
//                       <ExternalLink className="w-8 h-8 text-green-500" />
//                     </div>
//                     <p className="text-lg font-medium text-green-600">
//                       Payment Sent
//                     </p>
//                     <p className="text-sm text-muted-foreground">
//                       Waiting for client to submit receiving proof screenshot
//                     </p>
//                   </div>
//                 </CardContent>
//               </Card>
//             )}

//             {/* proof_submitted -> show proof and allow mark reviewed */}
//             {statusKey === "proof_submitted" && (
//               <>
//                 <Card>
//                   <CardHeader>
//                     <CardTitle>Client Receiving Proof</CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div>
//                       <Label className="text-sm text-muted-foreground">
//                         Submitted At
//                       </Label>
//                       <div className="font-medium">
//                         {withdrawal.clientProofSubmittedAt
//                           ? formatDate(withdrawal.clientProofSubmittedAt)
//                           : "—"}
//                       </div>
//                     </div>

//                     {withdrawal.clientProofScreenshot && (
//                       <div className="mt-3">
//                         <ScreenshotPreview
//                           imageUrl={withdrawal.clientProofScreenshot}
//                           alt="Client proof"
//                         />
//                       </div>
//                     )}
//                   </CardContent>
//                 </Card>

//                 <Card>
//                   <CardHeader>
//                     <CardTitle>Completion</CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <Label className="text-sm text-muted-foreground">
//                       Completion Message (optional)
//                     </Label>
//                     <Textarea
//                       value={adminMessage}
//                       onChange={(e) => setAdminMessage(e.target.value)}
//                       rows={3}
//                     />
//                     <Button
//                       className="mt-3 w-full"
//                       variant="default"
//                       onClick={doMarkReviewed}
//                     >
//                       ✅ Mark as Reviewed / Completed
//                     </Button>
//                   </CardContent>
//                 </Card>
//               </>
//             )}

//             {/* reviewed -> show completed state */}
//             {statusKey === "reviewed" && (
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Withdrawal Complete</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-center p-6">
//                     <div className="w-16 h-16 bg-emerald-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
//                       <span className="text-2xl">✅</span>
//                     </div>
//                     <p className="text-lg font-medium text-emerald-600">
//                       Completed
//                     </p>
//                     <p className="text-sm text-muted-foreground">
//                       Withdrawal has been processed and reviewed.
//                     </p>
//                     {withdrawal.completedAt && (
//                       <p className="text-xs text-muted-foreground mt-2">
//                         Completed on {formatDate(withdrawal.completedAt)}
//                       </p>
//                     )}
//                     {withdrawal.clientProofScreenshot && (
//                       <div className="mt-4">
//                         <ScreenshotPreview
//                           imageUrl={withdrawal.clientProofScreenshot}
//                           alt="Client proof"
//                         />
//                       </div>
//                     )}
//                   </div>
//                 </CardContent>
//               </Card>
//             )}
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }

// export default WithdrawalReviewModal;

// src/components/withdrawals/WithdrawalReviewModal.tsx
import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/formatters";
import type { Withdrawal } from "@/types/transactions/withdraw";
import { WithdrawalStatusBadge } from "./WithdrawalStatusBadge";
import { WalletAddressCopy } from "./WalletAddressCopy";
import { ScreenshotPreview } from "@/components/deposits/ScreenshotPreview";
import { useToast } from "@/hooks/use-toast";
import { Upload, ExternalLink } from "lucide-react";
import { useGetUserByIdQuery } from "@/API/users.api";
import { useWithdrawalsData } from "@/hooks/useWithdrawalsData";

/* canonicalStatus and withdrawFromLabel same as before - omitted for brevity */
/* ... copy canonicalStatus and withdrawFromLabel helpers from your previous modal ... */

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
  // these props still get called; parent hooks will perform update status
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
  const [emailSent, setEmailSent] = useState(true);
  const [uploadingLocal, setUploadingLocal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  // hook helper for uploading (from our central hook)
  const { uploadWithdrawProof, isUploading: isUploadingGlobal } =
    useWithdrawalsData();

  // fetch user info
  const userId =
    withdrawal?.userId ?? (withdrawal ? (withdrawal as any).userId : undefined);
  const { data: userData } = useGetUserByIdQuery(userId ?? 0, {
    skip: !userId,
  });

  useEffect(() => {
    if (open) {
      setAdminMessage("");
      setTronScanLink("");
      setSelectedFile(null);
      setEmailSent(true);
      setUploadingLocal(false);
    }
  }, [open, withdrawal?.id]);

  if (!withdrawal) return null;

  const statusKey = canonicalStatus(withdrawal.status);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setSelectedFile(f);
  };

  const doApprove = async () => {
    // tron link optional per your latest instruction, so remove requirement
    try {
      setUploadingLocal(true);

      // first upload the file if selected
      if (selectedFile) {
        try {
          await uploadWithdrawProof(withdrawal.id, selectedFile);
          toast({
            title: "Proof uploaded",
            description: "Withdrawal proof uploaded successfully.",
          });
        } catch (err) {
          console.error("Upload proof failed", err);
          toast({
            title: "Upload failed",
            description: "Failed to upload proof. Approval cancelled.",
            variant: "destructive",
          });
          setUploadingLocal(false);
          return;
        }
      }

      // call parent approve handler (which will call updateWithdrawalStatus)
      await Promise.resolve(
        onApprove(
          withdrawal.id,
          adminMessage || undefined,
          tronScanLink || undefined,
          emailSent
        )
      );
      toast({
        title: "Withdrawal Approved",
        description: `Approved ${formatCurrency(withdrawal.amount)} for ${
          withdrawal.clientName ?? "User"
        }.`,
      });
      closeModal();
    } catch (err) {
      console.error("Approve failed:", err);
      toast({
        title: "Error",
        description: "Failed to approve withdrawal.",
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
      await Promise.resolve(
        onReject(withdrawal.id, adminMessage.trim(), emailSent)
      );
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
    setEmailSent(true);
    setUploadingLocal(false);
    onClose();
  };

  const accountBalance =
    (userData && userData.fundsAvailable) ??
    (withdrawal as any).currentBalance ??
    0;
  const typeLabel = withdrawFromLabel(
    withdrawal.withdrawFromRaw ?? withdrawal.withdrawFrom
  );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && closeModal()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Review Withdrawal Request
            <div className="ml-2">
              <WithdrawalStatusBadge
                status={withdrawal.statusRaw ?? withdrawal.status}
              />
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: details */}
          <div className="space-y-6">
            {/* ... same left column as before (user info, withdrawal details) ... */}
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
                    {withdrawal.clientEmail ?? userData?.email ?? "—"}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Phone</Label>
                  <div className="font-medium">
                    {userData?.phoneNumber ?? withdrawal.phoneNumber ?? "—"}
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
            {/* previous admin action if any */}
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

          {/* Right: actions */}
          <div className="space-y-6">
            {(statusKey === "pending" || statusKey === "review") && (
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
                        TronScan Transaction Link (optional)
                      </Label>
                      <Input
                        placeholder="https://tronscan.org/#/transaction/..."
                        value={tronScanLink}
                        onChange={(e) => setTronScanLink(e.target.value)}
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
                    <div className="flex items-center gap-2 mt-3">
                      <Checkbox
                        checked={emailSent}
                        onCheckedChange={(v) => setEmailSent(Boolean(v))}
                      />
                      <Label className="text-sm">
                        Send notification via email
                      </Label>
                    </div>
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

            {/* other status presentations as before ... */}
            {statusKey === "approved" && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Sent — Awaiting Proof</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-6">
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ExternalLink className="w-8 h-8 text-green-500" />
                    </div>
                    <p className="text-lg font-medium text-green-600">
                      Payment Sent
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Waiting for client to submit receiving proof screenshot
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
            {statusKey === "proof_submitted" && (
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
                        {(withdrawal as any).clientProofSubmittedAt
                          ? formatDate(
                              (withdrawal as any).clientProofSubmittedAt
                            )
                          : "—"}
                      </div>
                    </div>
                    {(withdrawal as any).clientProofScreenshot && (
                      <div className="mt-3">
                        <ScreenshotPreview
                          imageUrl={(withdrawal as any).clientProofScreenshot}
                          alt="Client proof"
                        />
                      </div>
                    )}
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
