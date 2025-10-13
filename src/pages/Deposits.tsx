import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DepositFilters } from "@/components/deposits/DepositFilters";
import { DepositsTable } from "@/components/deposits/DepositsTable";
import { DepositReviewModal } from "@/components/deposits/DepositReviewModal";
import { useDepositsData } from "@/hooks/useDepositsData";
import { DepositRequest } from "@/types/transactions/deposit.types";

export default function Deposits() {
  const { deposits, filters, setFilters, updateDepositStatus, stats } =
    useDepositsData();
  const [selectedDeposit, setSelectedDeposit] = useState<DepositRequest | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleReviewDeposit = (deposit: DepositRequest) => {
    setSelectedDeposit(deposit);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDeposit(null);
  };

  const handleApproveDeposit = (
    id: number | string,
    message?: string,
    emailSent?: boolean
  ) => {
    return updateDepositStatus(id, "approved", message, emailSent);
  };

  const handleRejectDeposit = (
    id: number | string,
    message?: string,
    emailSent?: boolean
  ) => {
    return updateDepositStatus(id, "rejected", message, emailSent);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Deposit Approvals</h1>
          <p className="text-muted-foreground">
            Review and manage USDT deposit requests from clients
          </p>
        </div>

        <DepositFilters
          filters={filters}
          onFiltersChange={setFilters}
          stats={stats}
        />

        <DepositsTable
          deposits={deposits}
          onReviewDeposit={handleReviewDeposit}
        />

        <DepositReviewModal
          deposit={selectedDeposit}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onApprove={handleApproveDeposit}
          onReject={handleRejectDeposit}
        />
      </div>
    </DashboardLayout>
  );
}
