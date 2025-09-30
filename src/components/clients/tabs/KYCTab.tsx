// src/components/clients/tabs/KYCTab.tsx
import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { MessageModal } from "@/components/clients/MessageModal";
import { KYCDocumentItem } from "@/components/clients/KYCDocumentItem";
import type { KycDocType, KycReviewAction } from "@/types/users/kyc.types";
import {
  useGetKycByUserIdQuery,
  useReviewKycDocumentMutation,
  useDeleteKycDocumentMutation,
} from "@/API/kyc.api";
import { UserApi } from "@/types/users/users.types";
import { KycDocumentsApi } from "@/types/users/userDetail.types";

type KycItemStatus = "pending" | "approved" | "rejected";

interface KYCTabProps {
  client: UserApi;
}

export function KYCTab({ client }: KYCTabProps) {
  const { toast } = useToast();

  const [messageOpen, setMessageOpen] = useState(false);
  const [initialTitle, setInitialTitle] = useState<string | undefined>();
  const [initialMessage, setInitialMessage] = useState<string | undefined>();

  // Helpful debug: show what the incoming client shape actually contains
  console.log("[KYCTab] mounted with client (raw):", client);

  // If the server returned KYC nested in the client payload, use it directly.
  // Many endpoints return `client.kycDocuments` (observed in your logs).
  const clientKycFromPayload: KycDocumentsApi | undefined = (client as any)
    ?.kycDocuments;

  // Derive a numeric user id from a few possible locations:
  // - client.id (preferred)
  // - client.userId
  // - clientKycFromPayload.userId (fallback, seen in your logs)
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

  // If we already have KYC on the client object, skip making the network call.
  // Otherwise, call the query using the derived id (or skip if we couldn't derive one).
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

  // Decide final `kyc` source: prefer payload, fallback to API response.
  const kyc = clientKycFromPayload ?? (kycFromApi as any);

  // Log what we got after the hook resolves (helpful to detect shape mismatch)
  console.log("[KYCTab] hook result:", {
    shouldSkipQuery,
    kycLoading,
    kycError,
    kycFromApi,
    kycUsed: kyc,
  });

  const [reviewKycDocument, { isLoading: isReviewing }] =
    useReviewKycDocumentMutation();
  const [deleteKycDocument, { isLoading: isDeleting }] =
    useDeleteKycDocumentMutation();

  const requestReupload = () =>
    toast({
      title: "Re-upload requested",
      description: "The client was asked to re-upload documents.",
    });

  const openTemplatedMessage = (
    title: string,
    message: string,
    open = true
  ) => {
    setInitialTitle(title);
    setInitialMessage(message);
    if (open) setMessageOpen(true);
  };

  // Map UI label to API docType
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

  // Convert server status (any casing) to the narrow KycItemStatus union that KYCDocumentItem expects.
  const mapToKycItemStatus = (status?: string): KycItemStatus => {
    if (!status) return "pending";
    const s = status.trim().toUpperCase();
    if (s === "APPROVED") return "approved";
    if (s === "REJECTED") return "rejected";
    // treat everything else as pending
    return "pending";
  };

  // Format date/time helpers
  const formatDate = (iso?: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.valueOf())) return iso;
    const month = d.toLocaleString("en-US", { month: "short" }); // e.g., "Jan"
    const day = d.getDate();
    const year = d.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  // Generic handler for approve/reject/delete actions coming from KYCDocumentItem
  const handleDocumentAction = async (
    label: string,
    action: "approve" | "reject" | "delete",
    notes?: string
  ) => {
    const docType = docKeyFromLabel(label);

    if (!docType) {
      if (action === "delete") {
        toast({
          title: "Cannot delete",
          description: "This item is not deletable.",
        });
      } else {
        if (action === "approve") {
          openTemplatedMessage(
            `${label} Approved`,
            `${label} has been approved.`,
            true
          );
        } else {
          openTemplatedMessage(
            `${label} Rejected`,
            notes ?? `${label} has been rejected.`,
            true
          );
        }
      }
      return;
    }

    // Determine kycId to send to the review/delete mutations:
    // prefer `kyc.id` from whatever source we have, otherwise fall back to derivedUserId.
    const kycIdToUse = (kyc as any)?.id ?? derivedUserId;
    console.log("[KYCTab] handleDocumentAction ->", {
      label,
      action,
      notes,
      docType,
      kycIdToUse,
    });

    if (action === "delete") {
      try {
        await deleteKycDocument({
          kycId: kycIdToUse ?? client.id ?? client.id,
          body: { docType },
        }).unwrap();
        toast({
          title: "Deleted",
          description: `${label} deleted successfully.`,
        });
        refetchKyc();
      } catch (err: any) {
        console.error("Delete KYC doc failed:", err);
        toast({
          title: "Delete failed",
          description: err?.data?.message ?? "Could not delete document.",
        });
      }
      return;
    }

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
        kycId: kycIdToUse ?? client.id ?? client.id,
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

      refetchKyc();
    } catch (err: any) {
      console.error("Review KYC doc failed:", err);
      toast({
        title: "Action failed",
        description: err?.data?.message ?? "Could not complete action.",
      });
    }
  };

  // Build the list of 4 documents; address (text) will be handled separately below as read-only
  const documentItems = useMemo(() => {
    if (!kyc) return [];

    const normalize = (s?: string) => (s ?? "PENDING").toUpperCase();

    const frontStatus = normalize(
      (kyc as any).passportFrontStatus ?? (kyc as any).overallStatus
    );
    const backStatus = normalize(
      (kyc as any).passportBackStatus ?? (kyc as any).overallStatus
    );
    const selfieStatus = normalize(
      (kyc as any).selfieWithIdStatus ?? (kyc as any).overallStatus
    );
    const utilityStatus = normalize(
      (kyc as any).utilityBillStatus ?? (kyc as any).overallStatus
    );

    return [
      {
        label: "Passport (Front)",
        kind: "image" as const,
        value: (kyc as any).passportFront,
        status: frontStatus,
        rejectionReason: (kyc as any).passportFrontRejectionReason,
        allowDelete: frontStatus === "REJECTED",
      },
      {
        label: "Passport (Back)",
        kind: "image" as const,
        value: (kyc as any).passportBack,
        status: backStatus,
        rejectionReason: (kyc as any).passportBackRejectionReason,
        allowDelete: backStatus === "REJECTED",
      },
      {
        label: "Selfie with ID",
        kind: "image" as const,
        value: (kyc as any).selfieWithId,
        status: selfieStatus,
        rejectionReason: (kyc as any).selfieWithIdRejectionReason,
        allowDelete: selfieStatus === "REJECTED",
      },
      {
        label: "Utility / Address Proof",
        kind: "image" as const,
        value: (kyc as any).utilityBill,
        status: utilityStatus,
        rejectionReason: (kyc as any).utilityBillRejectionReason,
        allowDelete: utilityStatus === "REJECTED",
      },
    ];
  }, [kyc]);

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
          ) : kycError || !kyc ? (
            <div className="py-6 text-center text-sm text-red-600">
              Could not load KYC record. Try refreshing the page.
            </div>
          ) : (
            <>
              <div className="mt-6 space-y-4">
                {documentItems.map((doc) => (
                  <div key={doc.label}>
                    <KYCDocumentItem
                      label={doc.label}
                      kind={doc.kind}
                      value={doc.value}
                      // map the server status into the exact union type KYCDocumentItem expects
                      initialStatus={mapToKycItemStatus(doc.status)}
                      rejectionReason={doc.rejectionReason}
                      allowDelete={doc.allowDelete}
                      onAction={(
                        action: "approve" | "reject" | "delete",
                        notes?: string
                      ) => handleDocumentAction(doc.label, action, notes)}
                      isProcessing={isReviewing || isDeleting}
                    />

                    {doc.label === "Utility / Address Proof" && (
                      <div className="mt-3 ml-4 p-3 rounded-md border bg-muted/50">
                        <div className="text-xs text-muted-foreground mb-1">
                          Address (read-only)
                        </div>
                        <div className="text-sm break-words whitespace-pre-wrap">
                          {(kyc as any).address ? (
                            (kyc as any).address
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
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
            <li>
              Submitted •{" "}
              <div className="inline-block ml-2">
                <div>{formatDate((kyc as any)?.createdAt)}</div>
              </div>
            </li>
            <li>
              Reviewed •{" "}
              <div className="inline-block ml-2">
                <div>{formatDate((kyc as any)?.reviewedAt)}</div>
              </div>
            </li>
            <li>
              Current status •{" "}
              {(kyc as any)?.overallStatus ?? (client as any).kycStatus}
            </li>
          </ul>
        </CardContent>
      </Card>

      <MessageModal
        open={messageOpen}
        onOpenChange={setMessageOpen}
        clientName={client.name}
        clientId={client.id}
        messages={[]}
        initialTitle={initialTitle}
        initialMessage={initialMessage}
      />
    </div>
  );
}
