export interface AdminAccount {
  netProfitAvailable: number;
  principalBalance: number;
  currentPrincipalWithdrawn: number;
  totalWithdrawnNetProfit: number;
  totalWithdrawnPrincipal: number;
  lastUpdated: string;
  currentPnl: number;
}

export interface AdminTransaction {
  id: string;
  type: "net_profit" | "principal";
  amount: number;
  date: string;
  purpose: string;
  notes?: string;
  proofScreenshot?: string;
  tronScanLink?: string;
  adminName: string;
  createdAt: string;
}

export interface ManualInput {
  roiMadeThisMonth: number;
  roiUsedForPayouts: number;
  lastRecalculated: string;
}

export interface AdminTransactionFilters {
  dateRange?: { from?: Date; to?: Date };
  type?: "net_profit" | "principal" | "all";
  adminName?: string;
  searchQuery?: string;
}

export interface AdminAccountingStats {
  totalTransactions: number;
  monthlyWithdrawals: number;
  netProfitTransactions: number;
  principalTransactions: number;
}
