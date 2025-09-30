// src/components/clients/KYCDocumentItem.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ClientStatusBadge } from "./ClientStatusBadge";
import {
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  Maximize2,
  Trash2,
} from "lucide-react";

export type KycItemStatus = "pending" | "approved" | "rejected";

interface KYCDocumentItemProps {
  label: string;
  kind: "image" | "text";
  value?: string;
  initialStatus?: KycItemStatus;
  rejectionReason?: string | null;
  /** Called for approve / reject / delete. For approve we pass empty string as reason. */
  onAction?: (action: "approve" | "reject" | "delete", notes?: string) => void;
  /** When true, component will disable interactive controls (parent is processing). */
  isProcessing?: boolean;
  /** Show delete button only when true (KYCTab will set this when status === 'REJECTED') */
  allowDelete?: boolean;
}

export const KYCDocumentItem = ({
  label,
  kind,
  value,
  initialStatus = "pending",
  rejectionReason,
  onAction,
  isProcessing = false,
  allowDelete = false,
}: KYCDocumentItemProps) => {
  // local status mirrors prop, but we DON'T set it locally on user click.
  // Parent should update initialStatus after successful API call (we rely on that).
  const [status, setStatus] = useState<KycItemStatus>(initialStatus);
  const [notes, setNotes] = useState(rejectionReason ?? "");
  const [open, setOpen] = useState(false);

  // Sync status and rejection reason from parent props to avoid stale local-only state
  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  useEffect(() => {
    setNotes(rejectionReason ?? "");
  }, [rejectionReason]);

  const handleApprove = () => {
    // Approval requires no reason per your requirement; pass empty string.
    onAction?.("approve", "");
    // optionally clear notes input — parent will push new status down when ready
    setNotes("");
  };

  const handleReject = () => {
    // Pass the notes (may be empty string). Parent will validate & reject if required.
    onAction?.("reject", notes.trim());
    // don't change local status — we wait for parent/server to send new status
  };

  const handleDelete = () => {
    if (!allowDelete) return;
    // simple confirm; replace with nicer modal if desired
    const confirmed = confirm(`Delete ${label}? This action cannot be undone.`);
    if (!confirmed) return;
    onAction?.("delete");
  };

  return (
    <div className="rounded-lg border border-card-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="font-medium">{label}</div>
        <ClientStatusBadge status={status} />
      </div>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Submitted {kind === "image" ? "Document" : "Details"}</Label>
          <div className="rounded-md border border-card-border bg-background/50 p-3 min-h-28 flex items-center justify-center overflow-hidden">
            {kind === "image" ? (
              value ? (
                <div className="relative w-full">
                  <img
                    src={value}
                    alt={`${label} image`}
                    className="w-full h-48 object-contain rounded"
                  />
                  <div className="mt-2 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setOpen(true)}
                    >
                      <Maximize2 className="h-4 w-4 mr-2" /> View
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ImageIcon className="h-5 w-5" />
                  <span>No file</span>
                </div>
              )
            ) : (
              <div className="w-full text-sm text-muted-foreground whitespace-pre-wrap">
                {value || "No address details provided."}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Verification Notes</Label>
          <Textarea
            placeholder="Add notes (reason for rejection, clarifications, etc.)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={kind === "text" ? 6 : 5}
            disabled={isProcessing}
          />

          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              onClick={handleApprove}
              className="flex-1 md:flex-none"
              disabled={isProcessing}
            >
              <CheckCircle className="h-4 w-4 mr-2" /> Approve
            </Button>

            <Button
              variant="destructive"
              onClick={handleReject}
              className="flex-1 md:flex-none"
              disabled={isProcessing}
            >
              <XCircle className="h-4 w-4 mr-2" /> Reject
            </Button>

            {allowDelete && (
              <Button
                variant="outline"
                onClick={handleDelete}
                className="flex-1 md:flex-none"
                disabled={isProcessing}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </Button>
            )}
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-full h-[100dvh] max-w-[100vw] rounded-none overflow-y-auto overflow-x-hidden box-border p-4 sm:h-auto sm:max-w-3xl sm:max-h-[85vh] sm:rounded-lg sm:p-6">
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
          </DialogHeader>
          {kind === "image" && value && (
            <img
              src={value}
              alt={`${label} enlarged`}
              className="w-full max-h-[70vh] object-contain rounded"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
