// src/pages/Withdrawals.tsx
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/formatters";
import type {
  Withdrawal as WithdrawalType,
  // If you have a UI filter type, import it; otherwise we'll keep a local shape below
} from "@/types/transactions/withdraw";
import { useWithdrawalsData } from "@/hooks/useWithdrawalsData";
import { WithdrawalFilters } from "@/components/withdrawals/WithdrawalFilters";
import { WithdrawalsTable } from "@/components/withdrawals/WithdrawalsTable";
import { WithdrawalReviewModal } from "@/components/withdrawals/WithdrawalReviewModal";

/**
 * Local filter shape used by the UI controls.
 * The hook expects getFiltered(filters: { query?, status?, startDate?, endDate? }, type?)
 * so we'll map from this UI shape to the hook shape when calling getFiltered.
 */
type UIFilters = {
  search?: string;
  status?: string; // "all" | "pending" | "approved" | "rejected" | ...
  dateRange?: { from?: string | undefined; to?: string | undefined };
};

export default function Withdrawals() {
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

  const {
    // note: hook provides getFiltered, getStats, updateWithdrawalStatus, markAsReviewed
    getFiltered,
    getStats,
    updateWithdrawalStatus,
    markAsReviewed,
  } = useWithdrawalsData();

  // map UI filter -> hook filter shape
  const mapFiltersForHook = (f: UIFilters) => ({
    query: f.search,
    status: f.status,
    // convert dateRange to startDate/endDate string if present
    startDate: f.dateRange?.from,
    endDate: f.dateRange?.to,
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
    tronScanLink?: string,
    emailSent?: boolean
  ) => {
    try {
      await updateWithdrawalStatus(id, "APPROVED"); // send backend token
      // optionally pass extra fields if your hook supports them (e.g. adminMessage, tx link)
      // mark as reviewed/completed if your business logic requires it:
      // await markAsReviewed(id, adminMessage);
      setModalOpen(false);
      setSelectedWithdrawal(null);
    } catch (err) {
      console.error("Approve failed", err);
      // You likely have a toast hook; show error to user here if available
    }
  };

  const handleReject = async (
    id: number | string,
    adminMessage?: string,
    emailSent?: boolean
  ) => {
    try {
      await updateWithdrawalStatus(id, "REJECTED");
      setModalOpen(false);
      setSelectedWithdrawal(null);
    } catch (err) {
      console.error("Reject failed", err);
    }
  };

  const handleMarkReviewed = async (
    id: number | string,
    completionMessage?: string
  ) => {
    try {
      // depending on API: you may use updateWithdrawalStatus(id, "REVIEW") or call a separate markReviewed helper.
      await updateWithdrawalStatus(id, "REVIEW");
      // Optionally call local markAsReviewed if the hook provides it to update UI faster
      try {
        markAsReviewed?.(id, completionMessage);
      } catch {
        /* ignore */
      }
      setModalOpen(false);
      setSelectedWithdrawal(null);
    } catch (err) {
      console.error("Mark reviewed failed", err);
    }
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
            {/* Your WithdrawalFilters component expects a shape; keep passing UI filters */}
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
