import { useState } from "react";
import { Client } from "@/types/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClientStatusBadge } from "./ClientStatusBadge";
import { formatDate } from "@/lib/formatters";
import { 
  Shield, 
  FileImage, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Calendar,
  User,
  MapPin
} from "lucide-react";

interface ClientKYCDashboardProps {
  client: Client;
}

export const ClientKYCDashboard = ({ client }: ClientKYCDashboardProps) => {
  const [notes, setNotes] = useState("");
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string } | null>(null);

  const handleApprove = () => {
    console.log("Approving KYC for client:", client.id, "Notes:", notes);
    setNotes("");
  };

  const handleReject = () => {
    console.log("Rejecting KYC for client:", client.id, "Notes:", notes);
    setNotes("");
  };

  const openImageModal = (url: string, title: string) => {
    setSelectedImage({ url, title });
    setImageModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "text-success";
      case "rejected": return "text-destructive";
      case "pending": return "text-warning";
      default: return "text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle className="h-5 w-5 text-success" />;
      case "rejected": return <XCircle className="h-5 w-5 text-destructive" />;
      case "pending": return <Shield className="h-5 w-5 text-warning" />;
      default: return <Shield className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              KYC Verification
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(client.kycStatus)}
              <ClientStatusBadge status={client.kycStatus} />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Client Information Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3 min-w-0">
              <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-xs text-muted-foreground">Full Name</div>
                <div className="font-medium truncate">{client.name}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 min-w-0">
              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-xs text-muted-foreground">Member Since</div>
                <div className="font-medium truncate">{formatDate(client.joinDate)}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 min-w-0">
              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-xs text-muted-foreground">Email</div>
                <div className="font-medium truncate">{client.email}</div>
              </div>
            </div>
          </div>

          {/* KYC Documents */}
          <div className="space-y-4">
            <h4 className="font-medium">Verification Documents</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Selfie with ID */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <FileImage className="h-4 w-4" />
                  Selfie with ID
                </Label>
                <div className="border border-border rounded-lg p-3 bg-card">
                  {client.kycDocuments?.selfieWithId ? (
                    <div className="space-y-2">
                      <img
                        src={client.kycDocuments.selfieWithId}
                        alt="Selfie with ID"
                        className="w-full h-32 object-cover rounded cursor-pointer"
                        onClick={() => openImageModal(client.kycDocuments!.selfieWithId!, "Selfie with ID")}
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => openImageModal(client.kycDocuments!.selfieWithId!, "Selfie with ID")}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View Full Image
                      </Button>
                    </div>
                  ) : (
                    <div className="w-full h-32 flex items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded">
                      <div className="text-center">
                        <FileImage className="h-8 w-8 mx-auto mb-2" />
                        <div className="text-sm">No document uploaded</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Address Proof */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <FileImage className="h-4 w-4" />
                  Address Proof
                </Label>
                <div className="border border-border rounded-lg p-3 bg-card">
                  {client.kycDocuments?.addressProof ? (
                    <div className="space-y-2">
                      <img
                        src={client.kycDocuments.addressProof}
                        alt="Address Proof"
                        className="w-full h-32 object-cover rounded cursor-pointer"
                        onClick={() => openImageModal(client.kycDocuments!.addressProof!, "Address Proof")}
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => openImageModal(client.kycDocuments!.addressProof!, "Address Proof")}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View Full Image
                      </Button>
                    </div>
                  ) : (
                    <div className="w-full h-32 flex items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded">
                      <div className="text-center">
                        <FileImage className="h-8 w-8 mx-auto mb-2" />
                        <div className="text-sm">No document uploaded</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* KYC Actions */}
          {client.kycStatus === "pending" && (
            <div className="space-y-4 p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <h4 className="font-medium text-warning">Pending Verification</h4>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="kyc-notes">Admin Notes</Label>
                  <Textarea
                    id="kyc-notes"
                    placeholder="Add verification notes or feedback..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="mt-1"
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
            </div>
          )}

          {client.kycStatus === "approved" && (
            <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
              <div className="flex items-center gap-2 text-success">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">KYC Verification Approved</span>
              </div>
              <p className="text-sm text-success/80 mt-1">
                This client has been successfully verified and can access all platform features.
              </p>
            </div>
          )}

          {client.kycStatus === "rejected" && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center gap-2 text-destructive">
                <XCircle className="h-5 w-5" />
                <span className="font-medium">KYC Verification Rejected</span>
              </div>
              <p className="text-sm text-destructive/80 mt-1">
                This client's verification was rejected. They may need to resubmit documents.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Modal */}
      <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedImage?.title}</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="flex justify-center">
              <img
                src={selectedImage.url}
                alt={selectedImage.title}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};