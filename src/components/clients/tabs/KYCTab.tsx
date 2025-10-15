import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { KYCDocumentItem } from "@/components/clients/KYCDocumentItem";
import type { KycDocType, KycReviewAction } from "@/types/users/kyc.types";
import {
  useGetKycByUserIdQuery,
  useReviewKycDocumentMutation,
  useDeleteKycDocumentMutation,
} from "@/API/kyc.api";
import { UserApi } from "@/types/users/users.types";
import { KycDocumentsApi } from "@/types/users/userDetail.types";

type KycItemStatus = "pending" | "approved" | "rejected" | "not_submitted";

interface KYCTabProps {
  client: UserApi;
}

export function KYCTab({ client }: KYCTabProps) {
  const { toast } = useToast();

  const [messageOpen, setMessageOpen] = useState(false);
  const [initialTitle, setInitialTitle] = useState<string | undefined>();
  const [initialMessage, setInitialMessage] = useState<string | undefined>();

  console.log("[KYCTab] mounted with client (raw):", client);

  const clientKycFromPayload: KycDocumentsApi | undefined = (client as any)
    ?.kycDocuments;

  // derive numeric user id
  const derivedUserId = useMemo(() => {
    const possible =
      (client && (client as any).id) ??
      (client && (client as any).userId) ??
      clientKycFromPayload?.userId;
    const num = possible != null ? Number(possible) : undefined;
    return Number.isFinite(num) ? num : undefined;
  }, [client, clientKycFromPayload]);

  console.log("[KYCTab] derivedUserId:", derivedUserId, {
    clientId: (client as any)?.id,
    clientUserId: (client as any)?.userId,
    kycInClient: !!clientKycFromPayload,
  });

  // If we have kyc embedded in client payload or couldn't derive id, skip calling API.
  const shouldSkipQuery = !!clientKycFromPayload || !derivedUserId;

  const {
    data: kycFromApi,
    isLoading: kycLoading,
    isError: kycError,
    error,
    refetch: refetchKyc,
  } = useGetKycByUserIdQuery(derivedUserId ?? "", {
    skip: shouldSkipQuery,
  });

  // Local editable copy of KYC used for UI updates when query is skipped (client payload)
  const [localKyc, setLocalKyc] = useState<any | null>(null);

  // Initialize localKyc when either the client payload or API response arrives
  useEffect(() => {
    if (clientKycFromPayload) {
      setLocalKyc(clientKycFromPayload);
    } else if (kycFromApi) {
      setLocalKyc(kycFromApi);
    } else if (!kycLoading && !kycError) {
      // No record coming from API and not loading/error -> explicitly set null
      setLocalKyc(null);
    }
  }, [clientKycFromPayload, kycFromApi, kycLoading, kycError]);

  // The kyc we actually render from
  const kyc = localKyc;

  console.log("[KYCTab] hook result:", {
    shouldSkipQuery,
    kycLoading,
    kycError,
    error,
    kycFromApi,
    kycUsed: kyc,
  });

  const [reviewKycDocument, { isLoading: isReviewing }] =
    useReviewKycDocumentMutation();

  const [deleteKycDocument, { isLoading: isDeletingGlobal }] =
    useDeleteKycDocumentMutation();

  // Track which doc label is currently being deleted (per-item loading)
  const [deletingLabel, setDeletingLabel] = useState<string | null>(null);

  const openTemplatedMessage = (
    title: string,
    message: string,
    open = true
  ) => {
    setInitialTitle(title);
    setInitialMessage(message);
    if (open) setMessageOpen(true);
  };

  const docKeyFromLabel = (label: string): KycDocType | null => {
    switch (label) {
      case "Passport (Front)":
        return "passportFront";
      case "Passport (Back)":
        return "passportBack";
      case "Selfie with ID":
        return "selfieWithId";
      case "Utility / Address Proof":
        return "utilityBill";
      default:
        return null;
    }
  };

  const mapToKycItemStatus = (status?: string): KycItemStatus => {
    if (!status) return "not_submitted";
    const s = status.trim().toUpperCase();
    if (s === "APPROVED") return "approved";
    if (s === "REJECTED") return "rejected";
    if (s === "NOT_SUBMITTED" || s === "NOT-SUBMITTED") return "not_submitted";
    if (s === "PENDING") return "pending";
    return "pending";
  };

  const formatDate = (iso?: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.valueOf())) return iso;
    const month = d.toLocaleString("en-US", { month: "short" }); // e.g., "Jan"
    const day = d.getDate();
    const year = d.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  // Approve / Reject
  const handleDocumentAction = async (
    label: string,
    action: "approve" | "reject",
    notes?: string
  ) => {
    const docType = docKeyFromLabel(label);
    if (!docType) {
      toast({
        title: "Cannot perform action",
        description: "Unknown doc type",
      });
      return;
    }

    const kycIdToUse = kyc?.id ?? derivedUserId;
    console.log("[KYCTab] handleDocumentAction ->", {
      label,
      action,
      notes,
      docType,
      kycIdToUse,
    });

    const apiAction: KycReviewAction =
      action === "approve" ? "APPROVE" : "REJECT";

    if (apiAction === "REJECT" && (!notes || !notes.trim())) {
      toast({
        title: "Rejection reason required",
        description: "Please enter a rejection reason before rejecting.",
      });
      return;
    }

    try {
      await reviewKycDocument({
        kycId: kycIdToUse ?? (client as any).id,
        body: {
          documentType: docType,
          action: apiAction,
          ...(apiAction === "REJECT" ? { rejectionReason: notes } : {}),
        },
      }).unwrap();

      toast({
        title: apiAction === "APPROVE" ? "Approved" : "Rejected",
        description:
          apiAction === "APPROVE"
            ? `${label} approved successfully.`
            : `${label} rejected: ${notes}`,
      });

      if (apiAction === "APPROVE") {
        openTemplatedMessage(
          `KYC: ${label} Approved`,
          `${label} has been approved.`,
          true
        );
      } else {
        openTemplatedMessage(
          `KYC: ${label} Rejected`,
          `Your ${label} was rejected. Reason: ${notes ?? "Please resubmit."}`,
          true
        );
      }

      // If the query was started, refetch; otherwise update local state
      if (!shouldSkipQuery && typeof refetchKyc === "function") {
        try {
          await refetchKyc();
        } catch (e) {
          console.warn("[KYCTab] refetchKyc failed:", e);
        }
      } else {
        // simple local state update: set the status to APPROVED/REJECTED and set verified flag where appropriate
        setLocalKyc((prev: any) => {
          if (!prev) return prev;
          const newPrev = { ...prev };
          const statusStr = apiAction === "APPROVE" ? "APPROVED" : "REJECTED";
          switch (docType) {
            case "passportFront":
              newPrev.passportFrontStatus = statusStr;
              break;
            case "passportBack":
              newPrev.passportBackStatus = statusStr;
              break;
            case "selfieWithId":
              newPrev.selfieWithIdStatus = statusStr;
              break;
            case "utilityBill":
              newPrev.utilityBillStatus = statusStr;
              break;
          }
          return newPrev;
        });
      }
    } catch (err: any) {
      console.error("Review KYC doc failed:", err);
      toast({
        title: "Action failed",
        description: err?.data?.message ?? "Could not complete action.",
      });
    }
  };

  // Confirmation modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{
    label: string;
    docType: KycDocType;
  } | null>(null);

  // show confirm modal (called when user clicks Delete button on item)
  const showDeleteConfirm = (label: string) => {
    const docType = docKeyFromLabel(label);
    if (!docType) {
      toast({ title: "Cannot delete", description: "Unknown document type." });
      return;
    }
    setPendingDelete({ label, docType });
    setConfirmOpen(true);
  };

  // actual delete action (called when user confirms in modal)
  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const { label, docType } = pendingDelete;
    const kycIdToUse = kyc?.id ?? derivedUserId;
    const resolvedKycId =
      kycIdToUse ?? (client as any).id ?? (client as any).userId;
    setDeletingLabel(label);
    setConfirmOpen(false);

    try {
      console.log("[KYCTab] deleting document", { resolvedKycId, docType });
      await deleteKycDocument({
        kycId: resolvedKycId ?? "",
        body: { docType },
      }).unwrap();

      toast({
        title: "Deleted",
        description: `${label} deleted successfully.`,
      });

      // If the API query was started (not skipped), refetch. Otherwise patch localKyc.
      if (!shouldSkipQuery && typeof refetchKyc === "function") {
        try {
          await refetchKyc();
        } catch (e) {
          console.warn("[KYCTab] refetchKyc failed:", e);
        }
      } else {
        // Patch local state to reflect deletion: remove value URL and set status to NOT_SUBMITTED
        setLocalKyc((prev: any) => {
          if (!prev) return prev;
          const newPrev = { ...prev };
          switch (docType) {
            case "passportFront":
              newPrev.passportFront = null;
              newPrev.passportFrontStatus = "NOT_SUBMITTED";
              newPrev.passportFrontRejectionReason = null;
              break;
            case "passportBack":
              newPrev.passportBack = null;
              newPrev.passportBackStatus = "NOT_SUBMITTED";
              newPrev.passportBackRejectionReason = null;
              break;
            case "selfieWithId":
              newPrev.selfieWithId = null;
              newPrev.selfieWithIdStatus = "NOT_SUBMITTED";
              newPrev.selfieWithIdRejectionReason = null;
              break;
            case "utilityBill":
              newPrev.utilityBill = null;
              newPrev.utilityBillStatus = "NOT_SUBMITTED";
              newPrev.utilityBillRejectionReason = null;
              break;
          }
          return newPrev;
        });
      }
    } catch (err: any) {
      console.error("Delete KYC doc failed:", err);
      toast({
        title: "Delete failed",
        description: err?.data?.message ?? "Could not delete document.",
      });
    } finally {
      setDeletingLabel(null);
    }
  };

  // Build document list from current kyc (local)
  const documentItems = useMemo(() => {
    if (!kyc) return [];

    const frontStatusRaw =
      kyc.passportFrontStatus ?? kyc.overallStatus ?? undefined;
    const backStatusRaw =
      kyc.passportBackStatus ?? kyc.overallStatus ?? undefined;
    const selfieStatusRaw =
      kyc.selfieWithIdStatus ?? kyc.overallStatus ?? undefined;
    const utilityStatusRaw =
      kyc.utilityBillStatus ?? kyc.overallStatus ?? undefined;

    const has = (val: any) => !!val;

    return [
      {
        label: "Passport (Front)",
        kind: "image" as const,
        value: kyc.passportFront,
        status: frontStatusRaw,
        rejectionReason: kyc.passportFrontRejectionReason,
        allowDelete:
          has(kyc.passportFront) ||
          String(frontStatusRaw).toUpperCase() === "REJECTED",
      },
      {
        label: "Passport (Back)",
        kind: "image" as const,
        value: kyc.passportBack,
        status: backStatusRaw,
        rejectionReason: kyc.passportBackRejectionReason,
        allowDelete:
          has(kyc.passportBack) ||
          String(backStatusRaw).toUpperCase() === "REJECTED",
      },
      {
        label: "Selfie with ID",
        kind: "image" as const,
        value: kyc.selfieWithId,
        status: selfieStatusRaw,
        rejectionReason: kyc.selfieWithIdRejectionReason,
        allowDelete:
          has(kyc.selfieWithId) ||
          String(selfieStatusRaw).toUpperCase() === "REJECTED",
      },
      {
        label: "Utility / Address Proof",
        kind: "image" as const,
        value: kyc.utilityBill,
        status: utilityStatusRaw,
        rejectionReason: kyc.utilityBillRejectionReason,
        allowDelete:
          has(kyc.utilityBill) ||
          String(utilityStatusRaw).toUpperCase() === "REJECTED",
      },
    ];
  }, [kyc]);

  // ----- NEW: helpers for clearer UI states -----
  const httpStatus = (error as any)?.status;
  const notFound =
    kycError &&
    (httpStatus === 404 || (error as any)?.data?.code === "NOT_FOUND");

  const hasAnyDoc =
    !!kyc &&
    !!(
      kyc.passportFront ||
      kyc.passportBack ||
      kyc.selfieWithId ||
      kyc.utilityBill
    );

  const noDocsState = (!kycLoading && !kycError && !hasAnyDoc) || notFound;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>KYC Summary</CardTitle>
          <CardDescription>Verification status and timeline</CardDescription>
        </CardHeader>

        <CardContent>
          {kycLoading ? (
            <div className="py-6 text-center text-sm">Loading KYC...</div>
          ) : kycError && !notFound ? (
            <div className="py-6 text-center">
              <div className="text-sm text-red-600">
                Failed to load KYC.{" "}
                {httpStatus ? `(Error ${httpStatus})` : null}
              </div>
              <button
                className="mt-3 px-3 py-1.5 text-sm rounded border"
                onClick={() => refetchKyc && refetchKyc()}
              >
                Retry
              </button>
            </div>
          ) : noDocsState ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No KYC documents uploaded yet.
            </div>
          ) : (
            <>
              <div className="mt-6 space-y-4">
                {documentItems.map((doc) => (
                  <div key={doc.label} className="border-b pb-4">
                    <KYCDocumentItem
                      label={doc.label}
                      kind={doc.kind}
                      value={doc.value}
                      initialStatus={mapToKycItemStatus(doc.status as string)}
                      rejectionReason={doc.rejectionReason}
                      allowDelete={doc.allowDelete}
                      onAction={async (action, notes) => {
                        await handleDocumentAction(doc.label, action, notes);
                      }}
                      onDelete={() => showDeleteConfirm(doc.label)}
                      isProcessing={isReviewing || deletingLabel === doc.label}
                      deleting={deletingLabel === doc.label}
                    />
                    {doc.label === "Utility / Address Proof" && (
                      <div className="mt-3 ml-4 p-3 rounded-md border bg-muted/50">
                        <div className="text-xs text-muted-foreground mb-1">
                          Address (read-only)
                        </div>
                        <div className="text-sm break-words whitespace-pre-wrap">
                          {kyc.address ? (
                            kyc.address
                          ) : (
                            <span className="text-muted-foreground">
                              No address provided
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audit Trail</CardTitle>
          <CardDescription>Key KYC events</CardDescription>
        </CardHeader>
        <CardContent>
          {kycLoading ? (
            <div className="py-3 text-sm text-muted-foreground">Loading…</div>
          ) : kycError && !notFound ? (
            <div className="py-3 text-sm text-red-600">
              Unable to load audit trail.
            </div>
          ) : noDocsState ? (
            <div className="py-3 text-sm text-muted-foreground">
              No audit trail yet — the client hasn’t uploaded any KYC documents.
            </div>
          ) : (
            <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
              <li>
                Submitted •{" "}
                <div className="inline-block ml-2">
                  <div>{formatDate(kyc?.createdAt)}</div>
                </div>
              </li>
              <li>
                Reviewed •{" "}
                <div className="inline-block ml-2">
                  <div>{formatDate(kyc?.reviewedAt)}</div>
                </div>
              </li>
              <li>
                Current status •{" "}
                {kyc?.overallStatus ?? (client as any).kycStatus}
              </li>
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      {confirmOpen && pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setConfirmOpen(false)}
            aria-hidden
          />
          <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-md z-10">
            <h3 className="text-lg font-semibold">Delete document</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Are you sure you want to delete{" "}
              <strong>{pendingDelete.label}</strong>? This action is
              irreversible.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="px-3 py-1 rounded border"
                onClick={() => {
                  setConfirmOpen(false);
                  setPendingDelete(null);
                }}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 rounded bg-red-600 text-white"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default KYCTab;
