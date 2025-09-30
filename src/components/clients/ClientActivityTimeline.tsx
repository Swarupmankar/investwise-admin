import { Client, Investment, Deposit, Withdrawal, Referral } from "@/types/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { 
  TrendingUp, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  UserPlus, 
  Calendar,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";

interface ClientActivityTimelineProps {
  client: Client;
  investments: Investment[];
  deposits: Deposit[];
  withdrawals: Withdrawal[];
  referrals: Referral[];
}

type TimelineActivity = {
  id: string;
  type: "investment" | "deposit" | "withdrawal" | "referral";
  date: string;
  amount: number;
  status: string;
  description: string;
  icon: JSX.Element;
  color: string;
};

export const ClientActivityTimeline = ({ 
  client, 
  investments, 
  deposits, 
  withdrawals, 
  referrals 
}: ClientActivityTimelineProps) => {
  const activities: TimelineActivity[] = [
    ...investments.map(inv => ({
      id: inv.id,
      type: "investment" as const,
      date: inv.startDate,
      amount: inv.amount,
      status: inv.status,
      description: `Investment of ${formatCurrency(inv.amount)}`,
      icon: <TrendingUp className="h-4 w-4" />,
      color: "blue"
    })),
    ...deposits.map(dep => ({
      id: dep.id,
      type: "deposit" as const,
      date: dep.date,
      amount: dep.amount,
      status: dep.status,
      description: `Deposit of ${formatCurrency(dep.amount)}`,
      icon: <ArrowDownCircle className="h-4 w-4" />,
      color: "green"
    })),
    ...withdrawals.map(withdrawal => ({
      id: withdrawal.id,
      type: "withdrawal" as const,
      date: withdrawal.date,
      amount: withdrawal.amount,
      status: withdrawal.status,
      description: `${withdrawal.type} withdrawal of ${formatCurrency(withdrawal.amount)}`,
      icon: <ArrowUpCircle className="h-4 w-4" />,
      color: "orange"
    })),
    ...referrals.map(ref => ({
      id: ref.id,
      type: "referral" as const,
      date: ref.date,
      amount: ref.bonusReceived,
      status: ref.status,
      description: `Referred ${ref.referredClientName}`,
      icon: <UserPlus className="h-4 w-4" />,
      color: "purple"
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
      case "completed":
      case "paid":
      case "active":
        return <CheckCircle className="h-3 w-3 text-success" />;
      case "pending":
        return <Clock className="h-3 w-3 text-warning" />;
      case "rejected":
        return <XCircle className="h-3 w-3 text-destructive" />;
      default:
        return <Clock className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
      case "completed":
      case "paid":
      case "active":
        return "success";
      case "pending":
        return "warning";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No activity recorded yet
            </div>
          ) : (
            activities.slice(0, 20).map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                <div className="flex-shrink-0 p-2 rounded-full bg-muted text-muted-foreground">
                  {activity.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(activity.status)}
                      <Badge variant={getStatusColor(activity.status) as any}>
                        {activity.status}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(activity.date)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};