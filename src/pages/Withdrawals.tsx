import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/formatters";
import type { Withdrawal as WithdrawalType } from "@/types/transactions/withdraw.types";
import { useWithdrawalsData } from "@/hooks/useWithdrawalsData";
import { WithdrawalFilters } from "@/components/withdrawals/WithdrawalFilters";
import { WithdrawalsTable } from "@/components/withdrawals/WithdrawalsTable";
import { WithdrawalReviewModal } from "@/components/withdrawals/WithdrawalReviewModal";
import type { WithdrawalFilters as UIFilters } from "@/types/withdrawal";

export default function Withdrawals() {
  // ✅ state now uses WithdrawalFilters with Date objects
  const [filters, setFilters] = useState<UIFilters>({
    search: "",
    status: "all",
    dateRange: { from: undefined, to: undefined },
  });

  const [selectedWithdrawal, setSelectedWithdrawal] =
    useState<WithdrawalType | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "return" | "referral" | "principal"
  >("return");

  const { getFiltered, getStats, updateWithdrawalStatus } =
    useWithdrawalsData();

  // ✅ map Date -> string only when calling the hook
  const mapFiltersForHook = (f: UIFilters) => ({
    query: f.search,
    status: f.status,
    startDate: f.dateRange?.from ? f.dateRange.from.toISOString() : undefined,
    endDate: f.dateRange?.to ? f.dateRange.to.toISOString() : undefined,
  });

  const hookFilters = mapFiltersForHook(filters);

  // get filtered lists for each tab
  const returnWithdrawals = getFiltered(hookFilters, "return");
  const referralWithdrawals = getFiltered(hookFilters, "referral");
  const principalWithdrawals = getFiltered(hookFilters, "principal");

  const returnStats = getStats("return");
  const referralStats = getStats("referral");
  const principalStats = getStats("principal");
  const totalStats = getStats();

  const handleReview = (withdrawal: WithdrawalType) => {
    setSelectedWithdrawal(withdrawal);
    setModalOpen(true);
  };

  const handleApprove = async (
    id: number | string,
    adminMessage?: string,
    tronScanLink?: string
  ) => {
    try {
      // no status change here
      setModalOpen(false);
      setSelectedWithdrawal(null);
    } catch (err) {}
  };

  // Reject: send REJECTED (unchanged)
  const handleReject = async (id: number | string, adminMessage?: string) => {
    try {
      await updateWithdrawalStatus(id, "REJECTED", adminMessage);
      setModalOpen(false);
      setSelectedWithdrawal(null);
    } catch (err) {}
  };

  // Mark as Completed: send APPROVED (this updates status)
  const handleMarkReviewed = async (id: number | string) => {
    try {
      await updateWithdrawalStatus(id, "APPROVED");
      setModalOpen(false);
      setSelectedWithdrawal(null);
    } catch (err) {}
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedWithdrawal(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Withdrawal Approvals
          </h1>
          <p className="text-muted-foreground mt-1">
            Review and approve withdrawal requests from clients
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStats.total}</div>
              <p className="text-xs text-muted-foreground">
                {totalStats.pending} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Amount
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totalStats.totalAmount)}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(totalStats.pendingAmount ?? 0)} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {totalStats.approved}
              </div>
              <p className="text-xs text-muted-foreground">This period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {totalStats.rejected}
              </div>
              <p className="text-xs text-muted-foreground">This period</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            {/* ✅ props now match exactly */}
            <WithdrawalFilters filters={filters} onFiltersChange={setFilters} />
          </CardContent>
        </Card>

        {/* Tabbed Withdrawals */}
        <Card>
          <CardHeader>
            <CardTitle>Withdrawal Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as any)}
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="return" className="flex items-center gap-2">
                  Return Withdrawals
                  {returnStats.pending > 0 && (
                    <span className="bg-yellow-500 text-yellow-50 text-xs px-2 py-0.5 rounded-full">
                      {returnStats.pending}
                    </span>
                  )}
                </TabsTrigger>

                <TabsTrigger
                  value="referral"
                  className="flex items-center gap-2"
                >
                  Referral Withdrawals
                  {referralStats.pending > 0 && (
                    <span className="bg-yellow-500 text-yellow-50 text-xs px-2 py-0.5 rounded-full">
                      {referralStats.pending}
                    </span>
                  )}
                </TabsTrigger>

                <TabsTrigger
                  value="principal"
                  className="flex items-center gap-2"
                >
                  Principal Withdrawals
                  {principalStats.pending > 0 && (
                    <span className="bg-yellow-500 text-yellow-50 text-xs px-2 py-0.5 rounded-full">
                      {principalStats.pending}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="return" className="mt-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Return Withdrawals</h3>
                    <div className="text-sm text-muted-foreground">
                      {returnStats.total} total •{" "}
                      {formatCurrency(returnStats.totalAmount)}
                    </div>
                  </div>

                  <WithdrawalsTable
                    withdrawals={returnWithdrawals}
                    onReview={handleReview}
                  />
                </div>
              </TabsContent>

              <TabsContent value="referral" className="mt-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">
                      Referral Withdrawals
                    </h3>
                    <div className="text-sm text-muted-foreground">
                      {referralStats.total} total •{" "}
                      {formatCurrency(referralStats.totalAmount)}
                    </div>
                  </div>

                  <WithdrawalsTable
                    withdrawals={referralWithdrawals}
                    onReview={handleReview}
                  />
                </div>
              </TabsContent>

              <TabsContent value="principal" className="mt-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">
                      Principal Withdrawals
                    </h3>
                    <div className="text-sm text-muted-foreground">
                      {principalStats.total} total •{" "}
                      {formatCurrency(principalStats.totalAmount)}
                    </div>
                  </div>

                  <WithdrawalsTable
                    withdrawals={principalWithdrawals}
                    onReview={handleReview}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Review Modal */}
        <WithdrawalReviewModal
          withdrawal={selectedWithdrawal}
          open={modalOpen}
          onClose={handleCloseModal}
          onApprove={handleApprove}
          onReject={handleReject}
          onMarkReviewed={handleMarkReviewed}
        />
      </div>
    </DashboardLayout>
  );
}
