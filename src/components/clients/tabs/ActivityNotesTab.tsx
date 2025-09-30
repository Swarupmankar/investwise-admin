import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Client } from "@/types/client";
import { ClientActivityTimeline } from "@/components/clients/ClientActivityTimeline";
import { AdminNotes } from "@/components/clients/AdminNotes";
import { Investment, Deposit, Withdrawal, Referral } from "@/types/client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useClientsData } from "@/hooks/useClientsData";

interface ActivityNotesTabProps {
  client: Client;
  investments: Investment[];
  deposits: Deposit[];
  withdrawals: Withdrawal[];
  referrals: Referral[];
}

export function ActivityNotesTab({ client, investments, deposits, withdrawals, referrals }: ActivityNotesTabProps) {
  const { toast } = useToast();
  const { logDeposit, logWithdrawal, logReferral } = useClientsData();

  const [depAmount, setDepAmount] = useState<string>("");
  const [withAmount, setWithAmount] = useState<string>("");
  const [withType, setWithType] = useState<Withdrawal["type"]>("return");
  const [refName, setRefName] = useState<string>("");
  const [refBonus, setRefBonus] = useState<string>("");

  const parseNum = (v: string) => Number.isFinite(parseFloat(v)) ? Math.max(0, parseFloat(v)) : NaN;

  const onQuickDeposit = () => {
    const amt = parseNum(depAmount);
    if (isNaN(amt) || amt <= 0) return toast({ title: "Invalid amount", description: "Enter a positive number" });
    logDeposit(client.id, amt);
    setDepAmount("");
    toast({ title: "Deposit logged", description: `Amount ${amt}` });
  };

  const onQuickWithdrawal = () => {
    const amt = parseNum(withAmount);
    if (isNaN(amt) || amt <= 0) return toast({ title: "Invalid amount", description: "Enter a positive number" });
    logWithdrawal(client.id, withType, amt);
    setWithAmount("");
    toast({ title: "Withdrawal logged", description: `${withType} • ${amt}` });
  };

  const onQuickReferral = () => {
    const bonus = parseNum(refBonus);
    if (!refName.trim()) return toast({ title: "Missing name", description: "Enter referred client name" });
    if (isNaN(bonus) || bonus <= 0) return toast({ title: "Invalid bonus", description: "Enter a positive number" });
    const tempId = `temp-${Date.now()}`;
    logReferral(client.id, tempId, refName.trim(), bonus);
    setRefName("");
    setRefBonus("");
    toast({ title: "Referral logged", description: `${refName} • ${bonus}` });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Activity Timeline</CardTitle>
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
      </div>
      <div className="xl:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Log</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Deposit</div>
              <div className="flex gap-2">
                <Input inputMode="decimal" placeholder="Amount" value={depAmount} onChange={(e) => setDepAmount(e.target.value)} />
                <Button onClick={onQuickDeposit} size="sm">Log</Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Withdrawal</div>
              <div className="flex gap-2">
                <Select value={withType} onValueChange={(v) => setWithType(v as Withdrawal["type"]) }>
                  <SelectTrigger className="w-[140px]"><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="return">Return</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="principal">Principal</SelectItem>
                  </SelectContent>
                </Select>
                <Input inputMode="decimal" placeholder="Amount" value={withAmount} onChange={(e) => setWithAmount(e.target.value)} />
                <Button onClick={onQuickWithdrawal} size="sm">Log</Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Referral</div>
              <div className="flex gap-2">
                <Input placeholder="Referred client name" value={refName} onChange={(e) => setRefName(e.target.value)} />
                <Input inputMode="decimal" placeholder="Bonus" value={refBonus} onChange={(e) => setRefBonus(e.target.value)} />
                <Button onClick={onQuickReferral} size="sm">Log</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <AdminNotes clientId={client.id} />
      </div>
    </div>
  );
}
