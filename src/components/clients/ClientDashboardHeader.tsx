import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ClientStatusBadge } from "./ClientStatusBadge";
import { formatDate } from "@/lib/formatters";
import {
  ArrowLeft,
  MessageSquare,
  Mail,
  Phone,
  Calendar,
  Activity,
  Gift,
} from "lucide-react";
import type { UserDetailApi } from "@/types/users/userDetail.types";

interface ClientDashboardHeaderProps {
  client: UserDetailApi;
  onBack: () => void;
  onSendMessage: () => void;
}

export const ClientDashboardHeader = ({
  client,
  onBack,
  onSendMessage,
}: ClientDashboardHeaderProps) => {
  const fullName = `${client.firstName} ${client.lastName}`.trim();

  // account status -> "active" | "archived"
  const accountStatus = client.isActive ? "active" : "archived";

  // kyc status -> normalize from API enum to badge format
  let kycStatus: string = "not submitted";
  if (client.kycDocuments?.status) {
    const raw = client.kycDocuments.status.toLowerCase();
    if (raw === "not_submitted") kycStatus = "not submitted";
    else if (raw === "pending") kycStatus = "pending";
    else if (raw === "approved") kycStatus = "approved";
    else if (raw === "rejected") kycStatus = "rejected";
  }

  return (
    <div className="bg-card border border-card-border rounded-lg p-6 shadow-card">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Left Section - Client Info */}
        <div className="flex items-start gap-4">
          <Button variant="outline" onClick={onBack} className="shrink-0">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <Avatar className="h-16 w-16 shrink-0">
            <AvatarImage src={`https://avatar.vercel.sh/${client.email}`} />
            <AvatarFallback className="text-lg font-semibold">
              {fullName
                .split(" ")
                .filter(Boolean)
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{fullName}</h1>
              <ClientStatusBadge status={accountStatus} />
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {client.email}
              </div>
              {client.phoneNumber && (
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {client.phoneNumber}
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Joined {formatDate(client.createdAt)}
              </div>
              <div className="flex items-center gap-1">
                <Gift className="h-3 w-3" />
                Referral Code : {client.Referral?.code}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">KYC Status:</span>
              <ClientStatusBadge status={kycStatus} />
            </div>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex gap-3">
          <Button onClick={onSendMessage} className="shrink-0">
            <MessageSquare className="h-4 w-4 mr-2" />
            Send Message
          </Button>
        </div>
      </div>
    </div>
  );
};
