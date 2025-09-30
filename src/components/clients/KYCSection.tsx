import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Client } from "@/types/client";
import { ClientStatusBadge } from "./ClientStatusBadge";
import { CheckCircle, XCircle, FileImage } from "lucide-react";

interface KYCSectionProps {
  client: Client;
}

export const KYCSection = ({ client }: KYCSectionProps) => {
  const [notes, setNotes] = useState("");

  const handleApprove = () => {
    console.log("Approving KYC for client:", client.id, "Notes:", notes);
    setNotes("");
  };

  const handleReject = () => {
    console.log("Rejecting KYC for client:", client.id, "Notes:", notes);
    setNotes("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">KYC Verification</h3>
        <ClientStatusBadge status={client.kycStatus} />
      </div>

      {client.kycDocuments && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Selfie with ID</Label>
            <div className="border border-card-border rounded-lg p-4 bg-card">
              {client.kycDocuments.selfieWithId ? (
                <img
                  src={client.kycDocuments.selfieWithId}
                  alt="Selfie with ID"
                  className="w-full h-40 object-cover rounded"
                />
              ) : (
                <div className="w-full h-40 flex items-center justify-center text-muted-foreground">
                  <FileImage className="h-8 w-8" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Address Proof</Label>
            <div className="border border-card-border rounded-lg p-4 bg-card">
              {client.kycDocuments.addressProof ? (
                <img
                  src={client.kycDocuments.addressProof}
                  alt="Address Proof"
                  className="w-full h-40 object-cover rounded"
                />
              ) : (
                <div className="w-full h-40 flex items-center justify-center text-muted-foreground">
                  <FileImage className="h-8 w-8" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {client.kycStatus === "pending" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="kyc-notes">KYC Notes</Label>
            <Textarea
              id="kyc-notes"
              placeholder="Add notes about the KYC verification..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <Button onClick={handleApprove} className="flex-1">
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve KYC
            </Button>
            <Button variant="destructive" onClick={handleReject} className="flex-1">
              <XCircle className="h-4 w-4 mr-2" />
              Reject KYC
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};