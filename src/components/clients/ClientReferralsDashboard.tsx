import { Referral } from "@/types/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ClientStatusBadge } from "./ClientStatusBadge";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { 
  Users, 
  UserPlus, 
  DollarSign, 
  TrendingUp,
  Award,
  Target
} from "lucide-react";

interface ClientReferralsDashboardProps {
  referrals: Referral[];
  clientName: string;
}

export const ClientReferralsDashboard = ({ referrals, clientName }: ClientReferralsDashboardProps) => {
  const totalEarnings = referrals.reduce((sum, ref) => sum + ref.bonusReceived, 0);
  const paidReferrals = referrals.filter(ref => ref.status === "paid");
  const unpaidReferrals = referrals.filter(ref => ref.status === "unpaid");
  const paidEarnings = paidReferrals.reduce((sum, ref) => sum + ref.bonusReceived, 0);
  const unpaidEarnings = unpaidReferrals.reduce((sum, ref) => sum + ref.bonusReceived, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Referral Network
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Referral Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="text-center p-4 bg-card border border-border rounded-lg min-h-[100px] flex flex-col justify-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              <UserPlus className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-sm font-medium">Referrals</span>
            </div>
            <div className="text-2xl font-bold text-primary">{referrals.length}</div>
          </div>
          
          <div className="text-center p-4 bg-card border border-border rounded-lg min-h-[100px] flex flex-col justify-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              <DollarSign className="h-4 w-4 text-success flex-shrink-0" />
              <span className="text-sm font-medium">Earnings</span>
            </div>
            <div className="text-lg font-bold text-success">{formatCurrency(totalEarnings)}</div>
          </div>
          
          <div className="text-center p-4 bg-card border border-border rounded-lg min-h-[100px] flex flex-col justify-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              <Award className="h-4 w-4 text-success flex-shrink-0" />
              <span className="text-sm font-medium">Paid Out</span>
            </div>
            <div className="text-lg font-bold text-success">{formatCurrency(paidEarnings)}</div>
          </div>
          
          <div className="text-center p-4 bg-card border border-border rounded-lg min-h-[100px] flex flex-col justify-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              <Target className="h-4 w-4 text-warning flex-shrink-0" />
              <span className="text-sm font-medium">Pending</span>
            </div>
            <div className="text-lg font-bold text-warning">{formatCurrency(unpaidEarnings)}</div>
          </div>
        </div>

        {/* Performance Metrics */}
        {referrals.length > 0 && (
          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-success" />
              <span className="font-medium">Referral Performance</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Payment Success Rate</span>
                  <span>{((paidReferrals.length / referrals.length) * 100).toFixed(0)}%</span>
                </div>
                <Progress value={(paidReferrals.length / referrals.length) * 100} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Earnings per Referral</span>
                  <span>{formatCurrency(totalEarnings / referrals.length)}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Average bonus received per successful referral
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Referral List */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Referral History
          </h4>
          
          {referrals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <div className="text-lg font-medium">No Referrals Yet</div>
              <div className="text-sm">This client hasn't referred anyone to the platform.</div>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {referrals.map((referral) => (
                <div key={referral.id} className="border border-border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 p-2 bg-blue-100 text-blue-600 rounded-full">
                        <UserPlus className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">{referral.referredClientName}</div>
                        <div className="text-sm text-muted-foreground">
                          Referred on {formatDate(referral.date)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-medium text-success">
                        {formatCurrency(referral.bonusReceived)}
                      </div>
                      <ClientStatusBadge status={referral.status} />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Referral ID:</span>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {referral.id.slice(-8)}
                      </code>
                    </div>
                    
                    {referral.status === "paid" && (
                      <div className="flex items-center gap-1 text-success">
                        <Award className="h-3 w-3" />
                        <span className="text-xs">Bonus Paid</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Referral Program Info */}
        {referrals.length > 0 && (
          <div className="p-3 bg-info/10 border border-info/20 rounded-lg">
            <div className="text-sm">
              <strong>{clientName}</strong> has successfully referred {referrals.length} user
              {referrals.length !== 1 ? 's' : ''} to the platform, earning a total of{' '}
              <strong className="text-success">{formatCurrency(totalEarnings)}</strong> in referral bonuses.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};