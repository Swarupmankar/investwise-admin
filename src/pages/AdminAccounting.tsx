import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BalanceOverviewCards } from "@/components/adminAccounting/BalanceOverviewCards";
import { AdminWithdrawForm } from "@/components/adminAccounting/AdminWithdrawForm";
import { AdminReplenishPrincipalForm } from "@/components/adminAccounting/AdminReplenishPrincipalForm";
import { AdminTransactionTable } from "@/components/adminAccounting/AdminTransactionTable";
import { AdminAccountingFilters } from "@/components/adminAccounting/AdminAccountingFilters";
import { ManualControlsPanel } from "@/components/adminAccounting/ManualControlsPanel";
import { useAdminAccountingContext } from "@/context/AdminAccountingContext";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const AdminAccounting = () => {
  const {
    account,
    transactions,
    manualInputs,
    filters,
    stats,
    addWithdrawal,
    replenishPrincipal,
    updateManualInputs,
    recalculateNetProfit,
    updateFilters,
    clearFilters,
  } = useAdminAccountingContext();

  const [withdrawFormType, setWithdrawFormType] = useState<
    "net_profit" | "principal" | null
  >(null);

  const handleWithdrawClick = (type: "net_profit" | "principal") => {
    setWithdrawFormType(type);
    // Scroll to form
    document
      .getElementById("withdraw-form")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const handleReplenishClick = () => {
    document
      .getElementById("replenish-form")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const handleWithdraw = async (
    type: "net_profit" | "principal",
    amount: number,
    purpose: string,
    notes?: string,
    proofScreenshot?: string,
    tronScanLink?: string
  ) => {
    try {
      await addWithdrawal(
        type,
        amount,
        purpose,
        notes,
        proofScreenshot,
        tronScanLink
      );

      setWithdrawFormType(null);
    } catch (err: any) {
      // clear any existing toasts (prevents duplicates from other components)
      toast.dismiss();

      // Show proper error toast. Prefer server message if present.
      const message =
        err?.message || (typeof err === "string" ? err : "Failed to withdraw");
      toast.error(message);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Admin Accounting
          </h1>
          <p className="text-muted-foreground">
            Manage platform-level financial health and track admin withdrawals
          </p>
        </div>

        {/* Section 1: Account Balance Overview */}
        <section>
          <h2 className="text-xl font-semibold mb-4">
            Account Balance Overview
          </h2>
          <BalanceOverviewCards
            account={account}
            onWithdrawClick={handleWithdrawClick}
            onReplenishClick={handleReplenishClick}
          />
        </section>

        <Separator />

        {/* Section 2: Withdraw Funds Form */}
        <section id="withdraw-form">
          <h2 className="text-xl font-semibold mb-4">Withdraw Funds</h2>
          <AdminWithdrawForm
            account={account}
            onWithdraw={handleWithdraw}
            defaultType={withdrawFormType || undefined}
          />
        </section>

        <Separator />

        {/* Section 2b: Replenish Principal Deficit */}
        <section id="replenish-form">
          <h2 className="text-xl font-semibold mb-4">
            Replenish Principal Deficit
          </h2>
          <AdminReplenishPrincipalForm
            account={account}
            onReplenish={replenishPrincipal}
          />
        </section>

        <Separator />
        {/* Section 3: Filters and Stats */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Transaction Overview</h2>
          <AdminAccountingFilters
            filters={filters}
            stats={stats}
            onFiltersChange={updateFilters}
            onClearFilters={clearFilters}
          />
        </section>

        {/* Section 4: Admin Transaction Log */}
        <section>
          <AdminTransactionTable transactions={transactions} />
        </section>

        <Separator />

        {/* Section 5: Manual Controls */}
        <section>
          <h2 className="text-xl font-semibold mb-4">
            Manual Financial Controls
          </h2>
          <ManualControlsPanel
            manualInputs={manualInputs}
            onUpdateInputs={updateManualInputs}
            onRecalculate={recalculateNetProfit}
          />
        </section>
      </div>
    </DashboardLayout>
  );
};

export default AdminAccounting;
