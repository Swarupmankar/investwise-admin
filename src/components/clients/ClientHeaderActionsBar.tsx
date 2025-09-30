import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Client } from "@/types/client";
import { Mail, CheckCircle2, XCircle, Scale, FileDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClientHeaderActionsBarProps {
  client: Client;
  className?: string;
  onSendMessage: () => void;
  onApproveKYC?: () => void;
  onRejectKYC?: () => void;
  onManualAdjust?: () => void;
  onExport?: () => void;
}

export function ClientHeaderActionsBar({
  client,
  className,
  onSendMessage,
  onApproveKYC,
  onRejectKYC,
  onManualAdjust,
  onExport,
}: ClientHeaderActionsBarProps) {
  const kycPending = client.kycStatus === "pending";

  return (
    <header
      className={cn(
        "bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b",
        className
      )}
    >
      <div className="container mx-auto py-3 flex items-center justify-between gap-4">
        <h1 className="sr-only">Client actions</h1>
        <TooltipProvider delayDuration={150}>
          <div className="flex flex-wrap items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={onSendMessage} size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </TooltipTrigger>
              <TooltipContent>Send a message to {client.name}</TooltipContent>
            </Tooltip>

            {kycPending && onApproveKYC && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="secondary" size="sm" onClick={onApproveKYC}>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Approve KYC
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Approve client's KYC</TooltipContent>
              </Tooltip>
            )}

            {kycPending && onRejectKYC && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="destructive" size="sm" onClick={onRejectKYC}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject KYC
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reject client's KYC</TooltipContent>
              </Tooltip>
            )}

            {onManualAdjust && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={onManualAdjust}>
                    <Scale className="h-4 w-4 mr-2" />
                    Manual Adjust
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Adjust balances manually</TooltipContent>
              </Tooltip>
            )}

            {onExport && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={onExport}>
                    <FileDown className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Export client summary</TooltipContent>
              </Tooltip>
            )}
          </div>
        </TooltipProvider>

        <div className="text-sm text-muted-foreground">KYC: {client.kycStatus}</div>
      </div>
    </header>
  );
}
