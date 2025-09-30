import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Referral } from "@/types/client";

interface UnderWhomTreeProps {
  clientName: string;
  referrals: Referral[];
}

export function UnderWhomTree({ clientName, referrals }: UnderWhomTreeProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Under Whom</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground mb-2">Mini referral graph</div>
        <ul className="text-sm space-y-1">
          <li className="font-medium">{clientName}</li>
          {referrals.map((r) => (
            <li key={r.id} className="pl-4">↳ {r.referredClientName}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
