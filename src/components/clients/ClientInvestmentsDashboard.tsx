import { Investment } from "@/types/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ClientStatusBadge } from "./ClientStatusBadge";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { TrendingUp, Calendar, DollarSign, Target, BarChart3 } from "lucide-react";

interface ClientInvestmentsDashboardProps {
  investments: Investment[];
}

export const ClientInvestmentsDashboard = ({ investments }: ClientInvestmentsDashboardProps) => {
  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalReturns = investments.reduce((sum, inv) => sum + inv.returnCredited, 0);
  const activeInvestments = investments.filter(inv => inv.status === "active");
  const completedInvestments = investments.filter(inv => inv.status === "completed");
  
  const averageROI = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Investment Portfolio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Investment Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="text-center p-4 bg-card border border-border rounded-lg min-h-[80px] flex flex-col justify-center">
            <div className="text-2xl font-bold text-foreground">{investments.length}</div>
            <div className="text-xs text-muted-foreground whitespace-nowrap">Total Investments</div>
          </div>
          <div className="text-center p-4 bg-card border border-border rounded-lg min-h-[80px] flex flex-col justify-center">
            <div className="text-2xl font-bold text-success">{activeInvestments.length}</div>
            <div className="text-xs text-muted-foreground">Active</div>
          </div>
          <div className="text-center p-4 bg-card border border-border rounded-lg min-h-[80px] flex flex-col justify-center">
            <div className="text-xl font-bold text-success">{formatCurrency(totalReturns)}</div>
            <div className="text-xs text-muted-foreground">Total Returns</div>
          </div>
          <div className="text-center p-4 bg-card border border-border rounded-lg min-h-[80px] flex flex-col justify-center">
            <div className="text-2xl font-bold text-primary">{averageROI.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">Average ROI</div>
          </div>
        </div>

        {/* Individual Investments */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Investment Details
          </h4>
          
          {investments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No investments found
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {investments.map((investment) => {
                const roi = investment.amount > 0 ? (investment.returnCredited / investment.amount) * 100 : 0;
                const progressValue = investment.status === "completed" ? 100 : 
                                    investment.status === "active" ? roi : 0;
                
                return (
                  <div key={investment.id} className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Investment #{investment.id.slice(-6)}</span>
                        <ClientStatusBadge status={investment.status} />
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(investment.amount)}</div>
                        <div className="text-xs text-muted-foreground">Principal</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <Calendar className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground flex-shrink-0">Started:</span>
                        <span className="truncate">{formatDate(investment.startDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                        <DollarSign className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground flex-shrink-0">Returns:</span>
                        <span className="font-medium text-success truncate">{formatCurrency(investment.returnCredited)}</span>
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                        <Target className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground flex-shrink-0">ROI:</span>
                        <span className="font-medium truncate">{roi.toFixed(1)}%</span>
                      </div>
                    </div>
                    
                    {investment.status === "active" && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Progress</span>
                          <span>{roi.toFixed(1)}%</span>
                        </div>
                        <Progress value={progressValue} className="h-2" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};