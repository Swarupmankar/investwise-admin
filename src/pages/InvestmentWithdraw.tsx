import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { InvestmentWithdrawFilters } from "@/components/InvestmentWithdraw/InvestmentWithdarwFilter";
import { InvestmentWithdrawTable } from "@/components/InvestmentWithdraw/InvestmentWithdarwTable";
import { InvestmentWithdrawReviewModal } from "@/components/InvestmentWithdraw/InvestmentWithdarwReviewModal";
import {
  useApproveInvestmentSettlementMutation,
  useGetAllInvestmentSettlementsQuery,
} from "@/API/investmentSettlementsApi";
import {
  InvestmentWithdrawFiltersState,
  InvestmentWithdrawRequest,
  SettlementStatusApi,
} from "@/types/InvestmentWithdraw/investmentWithdraw";

export default function InvestmentWithdraw() {
  const [filters, setFilters] = useState<InvestmentWithdrawFiltersState>({
    status: "all",
    q: "",
    sortOrder: "newest",
  });

  const [selectedRequest, setSelectedRequest] =
    useState<InvestmentWithdrawRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, isError } = useGetAllInvestmentSettlementsQuery();
  const [approveSettlement] = useApproveInvestmentSettlementMutation();

  const allRequests: InvestmentWithdrawRequest[] = useMemo(() => {
    if (!data) return [];

    return data.flatMap((user) =>
      user.investmentSettlements.map((s) => {
        const rawStatus = s.status as SettlementStatusApi;
        const statusLower = rawStatus.toLowerCase();

        const mappedStatus: InvestmentWithdrawRequest["status"] =
          statusLower === "completed"
            ? "approved"
            : statusLower === "pending"
            ? "pending"
            : "rejected";

        return {
          id: s.id,
          investmentId: s.investmemtId,
          amount: Number(s.amount),
          date: s.createdAt,
          status: mappedStatus,
          clientName: `${user.firstName} ${user.lastName}`,
          clientEmail: user.email,
          rawStatus,
          approvedAt: rawStatus === "COMPLETED" ? s.updatedAt : undefined,
        };
      })
    );
  }, [data]);

  const filteredRequests = useMemo(() => {
    let res = [...allRequests];

    if (filters.status && filters.status !== "all") {
      res = res.filter((r) => r.status === filters.status);
    }

    if (filters.q) {
      const q = filters.q.toLowerCase();
      res = res.filter(
        (r) =>
          r.clientName.toLowerCase().includes(q) ||
          r.clientEmail.toLowerCase().includes(q)
      );
    }
    res.sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();

      if (filters.sortOrder === "oldest") {
        return da - db;
      }
      return db - da;
    });

    return res;
  }, [allRequests, filters]);

  const stats = useMemo(() => {
    const approvedRequests = allRequests.filter((r) => r.status === "approved");

    const approvedAmount = approvedRequests.reduce(
      (sum, r) => sum + (Number(r.amount) || 0),
      0
    );

    return {
      total: allRequests.length,
      pending: allRequests.filter((r) => r.status === "pending").length,
      approved: approvedRequests.length,
      approvedAmount,
    };
  }, [allRequests]);

  const handleReview = (req: InvestmentWithdrawRequest) => {
    setSelectedRequest(req);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  const handleFiltersChange = (next: InvestmentWithdrawFiltersState) => {
    setFilters(next);
  };

  // Approve API integration
  const handleApprove = async (id: number | string) => {
    return approveSettlement({ settlementId: id }).unwrap();
  };

  // No reject API given yet – this will show an error toast from modal
  const handleReject = async (id: number | string, _reason: string) => {
    return Promise.reject(
      new Error("Settlement reject API is not implemented yet.")
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Investment Withdraw Requests</h1>
          <p className="text-muted-foreground">
            Review and manage principal withdrawal requests from clients.
          </p>
        </div>

        <InvestmentWithdrawFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          stats={stats}
        />

        <InvestmentWithdrawTable
          requests={filteredRequests}
          onReview={handleReview}
          isLoading={isLoading}
          isError={isError}
        />

        <InvestmentWithdrawReviewModal
          request={selectedRequest}
          isOpen={isModalOpen}
          onClose={handleClose}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </div>
    </DashboardLayout>
  );
}
