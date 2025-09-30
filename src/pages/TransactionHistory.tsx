import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { TransactionFilters } from "@/components/transactions/TransactionFilters";
import { TransactionsTable } from "@/components/transactions/TransactionsTable";
import { TransactionDetailsModal } from "@/components/transactions/TransactionDetailsModal";
import { useTransactionHistory } from "@/hooks/useTransactionHistory";
import { formatCurrency } from "@/lib/formatters";
import { Transaction, TransactionFilters as TFilters } from "@/types/transaction";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight 
} from "lucide-react";

export default function TransactionHistory() {
  const { getFilteredTransactions, getSummary } = useTransactionHistory();
  const [filters, setFilters] = useState<TFilters>({
    search: "",
    type: "all",
    status: "all",
    dateRange: { from: undefined, to: undefined }
  });
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const filteredTransactions = getFilteredTransactions(filters);
  const summary = getSummary();

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailsModal(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Transaction History</h1>
          <p className="text-muted-foreground">
            Complete platform transaction overview and detailed records
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <DashboardCard
            title="Total Deposited"
            icon={<TrendingUp className="h-4 w-4" />}
            valueColor="success"
          >
            {formatCurrency(summary.totalDeposited)}
          </DashboardCard>

          <DashboardCard
            title="Total Withdrawn"
            icon={<TrendingDown className="h-4 w-4" />}
            valueColor="destructive"
          >
            {formatCurrency(summary.totalWithdrawn)}
          </DashboardCard>

          <DashboardCard
            title="Net Flow"
            icon={<DollarSign className="h-4 w-4" />}
            valueColor={summary.totalDeposited - summary.totalWithdrawn >= 0 ? "success" : "destructive"}
          >
            {formatCurrency(summary.totalDeposited - summary.totalWithdrawn)}
          </DashboardCard>

          <DashboardCard
            title="Referral Payouts"
            icon={<Users className="h-4 w-4" />}
            valueColor="warning"
          >
            {formatCurrency(summary.totalReferralPayouts)}
          </DashboardCard>

          <DashboardCard
            title="Return Payments"
            icon={<ArrowUpRight className="h-4 w-4" />}
            valueColor="default"
          >
            {formatCurrency(summary.totalReturns)}
          </DashboardCard>

          <DashboardCard
            title="Principal Returned"
            icon={<ArrowDownRight className="h-4 w-4" />}
            valueColor="destructive"
          >
            {formatCurrency(summary.totalPrincipal)}
          </DashboardCard>
        </div>

        {/* Transaction Counts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DashboardCard
            title="Total Transactions"
            icon={<DollarSign className="h-4 w-4" />}
          >
            {summary.depositCount + summary.withdrawalCount}
          </DashboardCard>

          <DashboardCard
            title="Deposits"
            icon={<TrendingUp className="h-4 w-4" />}
            valueColor="success"
          >
            {summary.depositCount}
          </DashboardCard>

          <DashboardCard
            title="Withdrawals"
            icon={<TrendingDown className="h-4 w-4" />}
            valueColor="destructive"
          >
            {summary.withdrawalCount}
          </DashboardCard>
        </div>

        {/* Filters */}
        <TransactionFilters 
          filters={filters}
          onFiltersChange={setFilters}
        />

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredTransactions.length} transactions
          </p>
        </div>

        {/* Transactions Table */}
        <TransactionsTable 
          transactions={filteredTransactions}
          onViewDetails={handleViewDetails}
        />

        {/* Transaction Details Modal */}
        <TransactionDetailsModal
          transaction={selectedTransaction}
          open={showDetailsModal}
          onOpenChange={setShowDetailsModal}
        />
      </div>
    </DashboardLayout>
  );
}