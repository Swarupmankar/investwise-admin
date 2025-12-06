import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { BalanceEntryForm } from "@/components/dashboard/BalanceEntryForm";
import { BalanceHistoryTable } from "@/components/dashboard/BalanceHistoryTable";
import { useFinancialData } from "@/hooks/useFinancialData";
import { formatCurrency } from "@/lib/formatters";
import { toast } from "sonner";
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  Users,
  PieChart,
  ArrowUpCircle,
} from "lucide-react";

type BalanceEntry = {
  amount?: number;
  delta?: number;
  createdAt?: Date;
};

const Index = () => {
  const {
    stats,
    outflow,
    balances,
    currentPnl,
    creating,
    createCurrentBalance,
    refetchStats,
    refetchBalances,
  } = useFinancialData();

  const principal = stats?.principalBalance ?? 0;
  const principalWithdrawn = stats?.principalWithdrawn ?? 0;
  const totalPrincipalWithdrawn = stats?.totalPrincipalWithdrawn ?? 0;
  const totalProfitWithdrawn = stats?.totalProfitWithdrawn ?? 0;
  const clientsCount = stats?.clientsCount ?? 0;
  const investmentsCount = stats?.investmentsCount ?? 0;
  const projectedThisMonthRoi = outflow?.projectedThisMonthRoi ?? 0;
  const projectedThisMonthReferral = outflow?.projectedThisMonthReferral ?? 0;
  const monthlyPrincipalWithdrawn = outflow?.thisMonthPrincipalWithdrawn ?? 0;
  const carryOnOutflowRoi = outflow?.carryOnOutflowRoi ?? 0;
  const carryOnOutflowReferral = outflow?.carryOnOutflowReferral ?? 0;
  //sum up outflow components
  const monthlyOutflowRoi = projectedThisMonthRoi + carryOnOutflowRoi;
  const monthlyOutflowReferral =
    projectedThisMonthReferral + carryOnOutflowReferral;
  const monthlyOutflowPrincipal = monthlyPrincipalWithdrawn;

  const monthlyOutflowTotal =
    monthlyOutflowRoi + monthlyOutflowReferral + monthlyOutflowPrincipal;

  const totalWithdrawn =
    Number(stats?.totalProfitWithdrawn ?? 0) +
    Number(stats?.totalPrincipalWithdrawn ?? 0);

  const currentRow = balances.find((b) => b.isCurrent === true);

  const delta = currentRow
    ? Number(currentRow.amount ?? 0) - Number(stats?.principalBalance ?? 0)
    : Number(stats?.principalBalance ?? 0);

  const afterOutflow = delta - monthlyOutflowTotal;

  const currentPnL = currentPnl;

  const getPnLColor = () =>
    currentPnL > 0 ? "success" : currentPnL < 0 ? "destructive" : "default";

  const getPnLText = () =>
    currentPnL > 0 ? "Surplus" : currentPnL < 0 ? "Deficit" : "Break Even";

  const handleBalanceSubmit = async (amount: number, notes?: string) => {
    try {
      const res = await createCurrentBalance({ amount, notes });
      if (res?.success) {
        refetchBalances();
        refetchStats();
      } else {
        toast.error("Failed to create current balance");
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to create current balance");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <DashboardCard
            title="Principal Balance"
            icon={<DollarSign className="w-4 h-4" />}
          >
            <div className="space-y-1">
              <div className="text-2xl font-bold">
                {formatCurrency(principal)}
              </div>
              <div className="text-xs text-muted-foreground">
                Total Principal Withdrawn: {formatCurrency(principalWithdrawn)}
              </div>
            </div>
          </DashboardCard>

          <DashboardCard
            title="Total Outflow This Month"
            icon={<TrendingDown className="w-4 h-4" />}
          >
            <div className="space-y-1">
              <div className="text-2xl font-bold text-foreground">
                {formatCurrency(monthlyOutflowTotal)}
              </div>
              <div className="text-xs text-muted-foreground">
                ROI: {formatCurrency(monthlyOutflowRoi)} | Referral:{" "}
                {formatCurrency(monthlyOutflowReferral)} | Principal:{" "}
                {formatCurrency(monthlyOutflowPrincipal)}
              </div>
            </div>
          </DashboardCard>

          <DashboardCard
            title="Current PnL"
            icon={
              currentPnL >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )
            }
            valueColor={getPnLColor()}
          >
            <div className="space-y-1">
              <div className="text-2xl font-bold">
                {formatCurrency(Math.abs(currentPnL))}
              </div>
              <div className="text-sm text-muted-foreground">
                {getPnLText()}
              </div>
            </div>
          </DashboardCard>

          <DashboardCard
            title="Total Withdrawn"
            icon={<ArrowUpCircle className="w-4 h-4" />}
          >
            <div className="space-y-1">
              <div className="text-2xl font-bold">
                {formatCurrency(totalWithdrawn)}
              </div>
              <div className="text-xs text-muted-foreground">
                Profit: {formatCurrency(totalProfitWithdrawn)} | Principal:{" "}
                {formatCurrency(totalPrincipalWithdrawn)}
              </div>
            </div>
          </DashboardCard>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DashboardCard
            title="Total Number of Clients"
            icon={<Users className="w-4 h-4" />}
          >
            <div className="text-2xl font-bold">{clientsCount}</div>
          </DashboardCard>

          <DashboardCard
            title="Total Number of Investments"
            icon={<PieChart className="w-4 h-4" />}
          >
            <div className="text-2xl font-bold">{investmentsCount}</div>
          </DashboardCard>

          <div className="md:col-span-1">
            <BalanceEntryForm
              onSubmit={handleBalanceSubmit}
              submitting={creating}
            />
          </div>
        </div>

        <BalanceHistoryTable entries={balances} />
      </div>
    </DashboardLayout>
  );
};

export default Index;
