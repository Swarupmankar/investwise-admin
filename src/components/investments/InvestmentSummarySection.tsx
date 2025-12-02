import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Investment } from "@/types/client";
import { formatCurrency } from "@/lib/formatters";
import { TrendingUp, Calendar, PieChart, DollarSign } from "lucide-react";

interface InvestmentSummarySectionProps {
  investments: Investment[];
}

export function InvestmentSummarySection({
  investments,
}: InvestmentSummarySectionProps) {
  const monthlyInvestments = investments.filter(
    (inv) => inv.planType === "monthly"
  );
  const quarterlyInvestments = investments.filter(
    (inv) => inv.planType === "quarterly"
  );

  const monthlyTotal = monthlyInvestments.reduce(
    (sum, inv) => sum + inv.amount,
    0
  );
  const quarterlyTotal = quarterlyInvestments.reduce(
    (sum, inv) => sum + inv.amount,
    0
  );

  const monthlyActive = monthlyInvestments.filter(
    (inv) => inv.status === "active"
  ).length;
  const quarterlyActive = quarterlyInvestments.filter(
    (inv) => inv.status === "active"
  ).length;

  const monthlyPaused = monthlyInvestments.filter(
    (inv) => inv.status === "paused"
  ).length;
  const quarterlyPaused = quarterlyInvestments.filter(
    (inv) => inv.status === "paused"
  ).length;

  const monthlyInactive =
    monthlyInvestments.length - monthlyActive - monthlyPaused;
  const quarterlyInactive =
    quarterlyInvestments.length - quarterlyActive - quarterlyPaused;

  const totalInvestments = investments.length;
  const totalAmount = monthlyTotal + quarterlyTotal;
  const totalActive = monthlyActive + quarterlyActive;
  const totalPaused = monthlyPaused + quarterlyPaused;
  const totalInactive = totalInvestments - totalActive - totalPaused;

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Monthly Plan Card */}
      <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              Monthly Plan (1%)
            </CardTitle>
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-500" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">
              {monthlyInvestments.length}
            </span>
            <span className="text-sm text-muted-foreground">investments</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Amount:</span>
              <span className="font-semibold text-blue-500">
                {formatCurrency(monthlyTotal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active:</span>
              <span className="font-medium text-foreground">
                {monthlyActive}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Paused:</span>
              <span className="font-medium text-yellow-500">
                {monthlyPaused}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Inactive:</span>
              <span className="font-medium text-muted-foreground">
                {monthlyInactive}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quarterly Plan Card */}
      <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              Quarterly Plan (5%)
            </CardTitle>
            <div className="p-2 bg-green-500/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">
              {quarterlyInvestments.length}
            </span>
            <span className="text-sm text-muted-foreground">investments</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Amount:</span>
              <span className="font-semibold text-green-500">
                {formatCurrency(quarterlyTotal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active:</span>
              <span className="font-medium text-foreground">
                {quarterlyActive}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Paused:</span>
              <span className="font-medium text-yellow-500">
                {quarterlyPaused}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Inactive:</span>
              <span className="font-medium text-muted-foreground">
                {quarterlyInactive}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Summary Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              Overall Summary
            </CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <PieChart className="h-5 w-5 text-primary" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">
              {totalInvestments}
            </span>
            <span className="text-sm text-muted-foreground">total</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Combined Amount:</span>
              <span className="font-semibold text-primary">
                {formatCurrency(totalAmount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active:</span>
              <span className="font-medium text-foreground">{totalActive}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Paused:</span>
              <span className="font-medium text-yellow-500">{totalPaused}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Inactive:</span>
              <span className="font-medium text-muted-foreground">
                {totalInactive}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
