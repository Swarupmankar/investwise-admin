import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Client, Deposit, Investment, Referral, Withdrawal } from "@/types/client";
import { ClientActivityTimeline } from "@/components/clients/ClientActivityTimeline";
import { Download, ArrowRight, Mail, Scale } from "lucide-react";

interface OverviewTabProps {
  client: Client;
  investments: Investment[];
  deposits: Deposit[];
  withdrawals: Withdrawal[];
  referrals: Referral[];
  onJump: (tab: string) => void;
  onSendMessage: () => void;
  onManualAdjust: () => void;
  onExportCSV: () => void;
}

export function OverviewTab({ client, investments, deposits, withdrawals, referrals, onJump, onSendMessage, onManualAdjust, onExportCSV }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Quick actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={onSendMessage}>
            <Mail className="mr-2 h-4 w-4" /> Send Message
          </Button>
          <Button variant="outline" size="sm" onClick={() => onJump("kyc")}>Open KYC</Button>
          <Button variant="outline" size="sm" onClick={onManualAdjust}>
            <Scale className="mr-2 h-4 w-4" /> Manual Credit/Debit
          </Button>
          <Button variant="default" size="sm" onClick={onExportCSV}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientActivityTimeline
            client={client}
            investments={investments}
            deposits={deposits}
            withdrawals={withdrawals}
            referrals={referrals}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Jump to</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {[
            { label: "KYC", key: "kyc" },
            { label: "Investments", key: "investments" },
            { label: "Deposits", key: "deposits" },
            { label: "Withdrawals", key: "withdrawals" },
            { label: "Referrals", key: "referrals" },
            { label: "Questionnaires", key: "questionnaires" },
          ].map((link) => (
            <Button key={link.key} onClick={() => onJump(link.key)} size="sm" variant="ghost">
              {link.label} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
