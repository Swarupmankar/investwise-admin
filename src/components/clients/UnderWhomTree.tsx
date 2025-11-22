import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UnderWhom } from "@/types/users/referral.types";

interface UnderWhomTreeProps {
  clientName: string;
  underWhom: UnderWhom;
}

export function UnderWhomTree({ clientName, underWhom }: UnderWhomTreeProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Under Whom</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground mb-2">
          Mini referral graph
        </div>
        <ul className="text-sm space-y-1">
          <li className="font-light">
            Referred by : <span className="font-medium">{clientName}</span>
          </li>
          {underWhom.referrer && (
            <li className="pl-4 text-muted-foreground">
              ↳ Referred by {clientName}
            </li>
          )}
          {underWhom.referrerChildren?.map((child) => (
            <li key={child.id} className="pl-4">
              ↳ {child.name}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
