// src/pages/index.tsx
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

const Index = () => {
  const {
    stats,
    balances,
    isLoading,
    isFetching,
    creating,
    createCurrentBalance,
    refetchStats,
    refetchBalances,
    error,
  } = useFinancialData();

  // safe numeric fallbacks (stats properties are already parsed numbers in the hook)
  const principal = stats?.principalBalance ?? 0;
  const principalWithdrawn = stats?.principalWithdrawn ?? 0;
  const totalPrincipalWithdrawn = stats?.totalPrincipalWithdrawn ?? 0;
  const totalProfitWithdrawn = stats?.totalProfitWithdrawn ?? 0;
  const clientsCount = stats?.clientsCount ?? 0;
  const investmentsCount = stats?.investmentsCount ?? 0;

  // monthly fields (already parsed or 0)
  const monthlyRoi = stats?.thisMonthRoi ?? undefined;
  const monthlyReferral = stats?.thisMonthRefEarnings ?? undefined;
  const monthlyPrincipalWithdrawn = stats?.thisMonthPrincipalWithdrawn ?? 0;

  const monthlyOutflowRoi =
    monthlyRoi !== undefined ? monthlyRoi : principal * 0.05;
  const monthlyOutflowReferral =
    monthlyReferral !== undefined ? monthlyReferral : principal * 0.01;
  const monthlyOutflowPrincipal = monthlyPrincipalWithdrawn ?? 0;

  const monthlyOutflowTotal =
    (monthlyOutflowRoi ?? 0) +
    (monthlyOutflowReferral ?? 0) +
    (monthlyOutflowPrincipal ?? 0);

  const totalWithdrawn = totalProfitWithdrawn + totalPrincipalWithdrawn;
  const currentPnL = principal - (totalWithdrawn + monthlyOutflowTotal);

  const getPnLColor = () => {
    if (currentPnL > 0) return "success";
    if (currentPnL < 0) return "destructive";
    return "default";
  };

  const getPnLText = () => {
    if (currentPnL > 0) return "Surplus";
    if (currentPnL < 0) return "Deficit";
    return "Break Even";
  };

  const handleBalanceSubmit = async (amount: number, notes?: string) => {
    // call hook action which wraps the mutation
    try {
      const res = await createCurrentBalance({ amount, notes });
      if (res?.success) {
        try {
          refetchBalances();
          refetchStats();
        } catch {
          /* ignore */
        }
      } else {
        const err = res?.error ?? res;
        toast.error(
          err?.data?.message ??
            err?.message ??
            "Failed to create current balance"
        );
      }
    } catch (err: any) {
      console.error("create current balance error", err);
      toast.error(
        err?.data?.message ?? err?.message ?? "Failed to create current balance"
      );
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

        {/* Balance history from server */}
        <BalanceHistoryTable entries={balances} />
      </div>
    </DashboardLayout>
  );
};

export default Index;
